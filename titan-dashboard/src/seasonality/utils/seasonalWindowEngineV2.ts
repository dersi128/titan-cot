/**
 * Seasonality Engine V2 — historical calendar windows (no price-momentum bias).
 */
import type { OhlcBar, SeasonalBias, SeasonalStrength } from "../types";
import { buildTradingDaySeries, type TradingDayRow } from "./tradingDays";

export const WINDOW_LOOKBACKS = [5, 10, 15, 20] as const;
export type WindowLookback = (typeof WINDOW_LOOKBACKS)[number];
export const DEFAULT_WINDOW_LOOKBACK: WindowLookback = 20;

const MIN_LEN = 7;
const MAX_LEN = 45;
const MIN_SAMPLE = 8;
const MIN_WR = 0.6;

export type SeasonalWindowStatus =
  | "ACTIVE_BULLISH"
  | "ACTIVE_BEARISH"
  | "NO_ACTIVE"
  | "UPCOMING_BULLISH"
  | "UPCOMING_BEARISH";

export type WindowStats = {
  avgReturn: number;
  medianReturn: number;
  winRate: number;
  lossRate: number;
  stdDev: number;
  sampleSize: number;
  bestYear: number;
  worstYear: number;
};

export type ScoredSeasonalWindow = {
  /** Trading-day-of-year start (1-based) in the as-of year calendar. */
  startTdy: number;
  endTdy: number;
  startDateLabel: string;
  endDateLabel: string;
  lengthTradingDays: number;
  direction: "BULLISH" | "BEARISH";
  stats: WindowStats;
  score: number;
  confidence: SeasonalStrength;
  daysRemaining: number;
  /** Days until window starts (0 if already inside). */
  daysUntilStart: number;
};

export type LookbackAlignment = {
  byLookback: Partial<Record<WindowLookback, SeasonalBias>>;
  scoreLabel: string;
  agreeCount: number;
  total: number;
};

export type SeasonalityWindowV2Result = {
  bias: SeasonalBias;
  score: number;
  confidence: SeasonalStrength;
  status: SeasonalWindowStatus;
  window: ScoredSeasonalWindow | null;
  /** Best windows near today (merged). */
  bullishWindows: ScoredSeasonalWindow[];
  bearishWindows: ScoredSeasonalWindow[];
  turnDate: string | null;
  alignment: LookbackAlignment;
  lookbackUsed: WindowLookback;
  yearsUsed: number;
  tradingDayOfYear: number;
  /** Upcoming opportunity within 5 TD — does NOT set bias. */
  upcoming: ScoredSeasonalWindow | null;
};

type YearBook = {
  year: number;
  /** close by 1-based tdy */
  closes: number[];
  dates: string[];
};

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  const v = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(v);
}

function winsorize(values: number[], p = 0.1): number[] {
  if (values.length < 5) return values;
  const s = [...values].sort((a, b) => a - b);
  const lo = s[Math.floor(s.length * p)]!;
  const hi = s[Math.ceil(s.length * (1 - p)) - 1]!;
  return values.map((v) => Math.max(lo, Math.min(hi, v)));
}

function labelFromDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}. ${Number(m)}.`;
}

function mmdd(iso: string): string {
  return iso.slice(5, 10);
}

function strengthFromScore(score: number): SeasonalStrength {
  if (score >= 80) return "EXTREME";
  if (score >= 65) return "HIGH";
  if (score >= 50) return "MODERATE";
  return "LOW";
}

function buildYearBooks(rows: TradingDayRow[]): YearBook[] {
  const byYear = new Map<number, TradingDayRow[]>();
  for (const r of rows) {
    const list = byYear.get(r.year) ?? [];
    list.push(r);
    byYear.set(r.year, list);
  }
  const books: YearBook[] = [];
  for (const [year, list] of [...byYear.entries()].sort((a, b) => a[0] - b[0])) {
    const sorted = [...list].sort((a, b) => a.tdy - b.tdy);
    books.push({
      year,
      closes: sorted.map((r) => r.close),
      dates: sorted.map((r) => r.date),
    });
  }
  return books;
}

function windowReturns(
  books: YearBook[],
  startTdy: number,
  length: number,
  asOfYear: number,
  lookbackYears: number,
): number[] {
  const minYear = asOfYear - lookbackYears;
  const out: number[] = [];
  for (const book of books) {
    if (book.year >= asOfYear) continue;
    if (book.year < minYear) continue;
    const startIdx = startTdy - 1;
    const endIdx = startIdx + length - 1;
    if (startIdx < 0 || endIdx >= book.closes.length) continue;
    const a = book.closes[startIdx]!;
    const b = book.closes[endIdx]!;
    if (!(a > 0) || !(b > 0)) continue;
    out.push(b / a - 1);
  }
  return out;
}

function computeStats(raw: number[]): WindowStats | null {
  if (raw.length < MIN_SAMPLE) return null;
  const values = winsorize(raw);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const med = median(values);
  const wins = values.filter((v) => v > 0).length;
  const losses = values.filter((v) => v < 0).length;
  const winRate = wins / values.length;
  const lossRate = losses / values.length;
  return {
    avgReturn: avg,
    medianReturn: med,
    winRate,
    lossRate,
    stdDev: stdDev(values),
    sampleSize: raw.length,
    bestYear: Math.max(...raw),
    worstYear: Math.min(...raw),
  };
}

/** Score 0–100 per prompt weights + overfitting penalties. */
export function scoreWindowStats(stats: WindowStats, length: number, alignmentAgree = 0.5): number {
  const wrPts = Math.min(35, Math.max(0, ((stats.winRate - 0.5) / 0.35) * 35));
  const absAvg = Math.abs(stats.avgReturn);
  const avgPts = Math.min(25, (absAvg / 0.08) * 25);
  const absMed = Math.abs(stats.medianReturn);
  const medPts = Math.min(15, (absMed / 0.06) * 15);
  const cv = absAvg > 1e-6 ? stats.stdDev / absAvg : 3;
  const stabPts = Math.min(10, Math.max(0, 10 - cv * 3));
  const samplePts = Math.min(10, (stats.sampleSize / 20) * 10);
  const alignPts = Math.min(5, alignmentAgree * 5);

  let score = wrPts + avgPts + medPts + stabPts + samplePts + alignPts;

  // Penalties
  if (stats.sampleSize < 12) score -= (12 - stats.sampleSize) * 1.5;
  if (length < 10) score -= 4;
  const signAgree =
    (stats.avgReturn > 0 && stats.medianReturn > 0) || (stats.avgReturn < 0 && stats.medianReturn < 0);
  if (!signAgree) score -= 18;
  const gap = Math.abs(stats.avgReturn - stats.medianReturn);
  if (gap > Math.abs(stats.medianReturn) * 1.5 + 0.02) score -= 12;
  if (stats.winRate < 0.55 && Math.abs(stats.avgReturn) > 0.05) score -= 10;

  return Math.round(Math.max(0, Math.min(100, score)));
}

function qualifiesBull(stats: WindowStats): boolean {
  return (
    stats.avgReturn > 0 &&
    stats.medianReturn > 0 &&
    stats.winRate >= MIN_WR &&
    stats.sampleSize >= MIN_SAMPLE
  );
}

function qualifiesBear(stats: WindowStats): boolean {
  return (
    stats.avgReturn < 0 &&
    stats.medianReturn < 0 &&
    stats.lossRate >= MIN_WR &&
    stats.sampleSize >= MIN_SAMPLE
  );
}

function dateLabelForTdy(book: YearBook | undefined, tdy: number, fallbackDoyBook?: YearBook): string {
  const b = book ?? fallbackDoyBook;
  if (!b) return `TDY ${tdy}`;
  const iso = b.dates[tdy - 1];
  return iso ? labelFromDate(iso) : `TDY ${tdy}`;
}

function mmddForTdy(book: YearBook | undefined, tdy: number): string {
  const iso = book?.dates[tdy - 1];
  return iso ? mmdd(iso) : "";
}

function evaluateCandidate(
  books: YearBook[],
  asOfYear: number,
  lookback: number,
  startTdy: number,
  length: number,
  todayTdy: number,
  asOfBook: YearBook | undefined,
): ScoredSeasonalWindow | null {
  const rets = windowReturns(books, startTdy, length, asOfYear, lookback);
  const stats = computeStats(rets);
  if (!stats) return null;

  let direction: "BULLISH" | "BEARISH" | null = null;
  if (qualifiesBull(stats)) direction = "BULLISH";
  else if (qualifiesBear(stats)) direction = "BEARISH";
  if (!direction) return null;

  const endTdy = startTdy + length - 1;
  // Hard filters only — no slope / soft score gate for window existence
  const score = scoreWindowStats(stats, length, 0.5);

  return {
    startTdy,
    endTdy,
    startDateLabel: dateLabelForTdy(asOfBook, startTdy, books.at(-1)),
    endDateLabel: dateLabelForTdy(asOfBook, endTdy, books.at(-1)),
    lengthTradingDays: length,
    direction,
    stats,
    score,
    confidence: strengthFromScore(score),
    daysRemaining: Math.max(0, endTdy - todayTdy),
    daysUntilStart: Math.max(0, startTdy - todayTdy),
  };
}

/** Merge overlapping same-direction windows → keep best representative span. */
export function mergeWindows(windows: ScoredSeasonalWindow[]): ScoredSeasonalWindow[] {
  if (!windows.length) return [];
  const sorted = [...windows].sort((a, b) => a.startTdy - b.startTdy || b.score - a.score);
  const groups: ScoredSeasonalWindow[][] = [];

  for (const w of sorted) {
    const g = groups.find((grp) => {
      const last = grp[grp.length - 1]!;
      if (last.direction !== w.direction) return false;
      return w.startTdy <= last.endTdy + 3;
    });
    if (g) g.push(w);
    else groups.push([w]);
  }

  return groups.map((grp) => {
    const best = [...grp].sort(
      (a, b) =>
        b.score - a.score ||
        b.stats.winRate - a.stats.winRate ||
        Math.abs(b.stats.avgReturn) - Math.abs(a.stats.avgReturn),
    )[0]!;
    const startTdy = Math.min(...grp.map((x) => x.startTdy));
    const endTdy = Math.max(...grp.map((x) => x.endTdy));
    return {
      ...best,
      startTdy,
      endTdy,
      lengthTradingDays: endTdy - startTdy + 1,
      startDateLabel: grp.find((x) => x.startTdy === startTdy)?.startDateLabel ?? best.startDateLabel,
      endDateLabel: grp.find((x) => x.endTdy === endTdy)?.endDateLabel ?? best.endDateLabel,
      daysRemaining: best.daysRemaining,
      daysUntilStart: Math.max(0, startTdy - (best.startTdy - best.daysUntilStart)),
    };
  });
}

function scanAroundToday(
  books: YearBook[],
  asOfYear: number,
  lookback: number,
  todayTdy: number,
  asOfBook: YearBook | undefined,
): ScoredSeasonalWindow[] {
  const found: ScoredSeasonalWindow[] = [];
  const maxTdy = asOfBook?.closes.length ?? 252;

  // Windows containing today
  for (let startOffset = 0; startOffset <= MAX_LEN - MIN_LEN; startOffset++) {
    const startTdy = todayTdy - startOffset;
    if (startTdy < 1) continue;
    for (let length = MIN_LEN; length <= MAX_LEN; length++) {
      const endTdy = startTdy + length - 1;
      if (endTdy < todayTdy) continue;
      if (endTdy > maxTdy) continue;
      const w = evaluateCandidate(books, asOfYear, lookback, startTdy, length, todayTdy, asOfBook);
      if (w) found.push(w);
    }
  }

  // Upcoming within 5 TD
  for (let ahead = 1; ahead <= 5; ahead++) {
    const startTdy = todayTdy + ahead;
    if (startTdy > maxTdy) break;
    for (let length = MIN_LEN; length <= MAX_LEN; length++) {
      const endTdy = startTdy + length - 1;
      if (endTdy > maxTdy) break;
      const w = evaluateCandidate(books, asOfYear, lookback, startTdy, length, todayTdy, asOfBook);
      if (w) found.push(w);
    }
  }

  return mergeWindows(found);
}

function alignmentForWindow(
  books: YearBook[],
  asOfYear: number,
  startTdy: number,
  length: number,
  direction: "BULLISH" | "BEARISH",
): LookbackAlignment {
  const byLookback: Partial<Record<WindowLookback, SeasonalBias>> = {};
  let agree = 0;
  let total = 0;
  for (const lb of WINDOW_LOOKBACKS) {
    const rets = windowReturns(books, startTdy, length, asOfYear, lb);
    const stats = computeStats(rets);
    let bias: SeasonalBias = "NEUTRAL";
    if (stats && qualifiesBull(stats)) bias = "BULLISH";
    else if (stats && qualifiesBear(stats)) bias = "BEARISH";
    byLookback[lb] = bias;
    if (stats) {
      total += 1;
      if (bias === direction) agree += 1;
    }
  }
  return {
    byLookback,
    scoreLabel: `${agree}/${total || WINDOW_LOOKBACKS.length}`,
    agreeCount: agree,
    total: total || WINDOW_LOOKBACKS.length,
  };
}

export function computeSeasonalityWindowsV2(
  bars: OhlcBar[],
  asOfDate?: string,
  preferredLookback: WindowLookback = DEFAULT_WINDOW_LOOKBACK,
): SeasonalityWindowV2Result {
  const rows = buildTradingDaySeries(bars);
  const asOf = asOfDate ?? rows.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
  const asOfYear = Number(asOf.slice(0, 4));
  const books = buildYearBooks(rows);
  const asOfBook = books.find((b) => b.year === asOfYear) ?? books.at(-1);
  const todayTdy = rows.filter((r) => r.date <= asOf && r.year === asOfYear).at(-1)?.tdy ?? 1;

  // Use longest available lookback if history is short
  const historyYears = books.filter((b) => b.year < asOfYear).length;
  let lookback: WindowLookback = preferredLookback;
  for (const lb of [...WINDOW_LOOKBACKS].reverse()) {
    if (historyYears >= Math.min(lb, 8)) {
      lookback = Math.min(lb, preferredLookback) as WindowLookback;
      if (historyYears >= preferredLookback) lookback = preferredLookback;
      break;
    }
  }
  if (historyYears < preferredLookback) {
    const fit = WINDOW_LOOKBACKS.filter((lb) => lb <= historyYears).at(-1);
    lookback = fit ?? 5;
  }

  const candidates = scanAroundToday(books, asOfYear, lookback, todayTdy, asOfBook);

  // ACTIVE = today strictly inside a hard-qualified historical window
  const active = candidates
    .filter((w) => w.daysUntilStart === 0 && w.startTdy <= todayTdy && w.endTdy >= todayTdy)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.stats.winRate - a.stats.winRate ||
        Math.abs(b.stats.avgReturn) - Math.abs(a.stats.avgReturn),
    );

  // UPCOMING = starts in next 1–5 TD — informational only, does not set bias
  const upcoming =
    candidates
      .filter((w) => w.daysUntilStart >= 1 && w.daysUntilStart <= 5)
      .sort((a, b) => b.score - a.score || a.daysUntilStart - b.daysUntilStart)[0] ?? null;

  let dominant: ScoredSeasonalWindow | null = active[0] ?? null;

  let alignment: LookbackAlignment = {
    byLookback: {},
    scoreLabel: "0/4",
    agreeCount: 0,
    total: 4,
  };

  if (dominant) {
    alignment = alignmentForWindow(
      books,
      asOfYear,
      dominant.startTdy,
      dominant.lengthTradingDays,
      dominant.direction,
    );
    const rescored = scoreWindowStats(
      dominant.stats,
      dominant.lengthTradingDays,
      alignment.agreeCount / alignment.total,
    );
    dominant = {
      ...dominant,
      score: rescored,
      confidence: strengthFromScore(rescored),
    };
  }

  // Bias ONLY from active window — never from slope, momentum, or upcoming
  const bias: SeasonalBias = dominant ? dominant.direction : "NEUTRAL";
  const score = dominant?.score ?? 0;
  const confidence = dominant ? dominant.confidence : "LOW";

  let status: SeasonalWindowStatus = "NO_ACTIVE";
  if (dominant?.direction === "BULLISH") status = "ACTIVE_BULLISH";
  else if (dominant?.direction === "BEARISH") status = "ACTIVE_BEARISH";
  else if (upcoming?.direction === "BULLISH") status = "UPCOMING_BULLISH";
  else if (upcoming?.direction === "BEARISH") status = "UPCOMING_BEARISH";

  const bullishWindows = mergeWindows(candidates.filter((w) => w.direction === "BULLISH")).sort(
    (a, b) => b.score - a.score,
  );
  const bearishWindows = mergeWindows(candidates.filter((w) => w.direction === "BEARISH")).sort(
    (a, b) => b.score - a.score,
  );

  return {
    bias,
    score,
    confidence,
    status,
    window: dominant,
    bullishWindows,
    bearishWindows,
    turnDate: dominant ? mmddForTdy(asOfBook, dominant.endTdy) || dominant.endDateLabel : null,
    alignment,
    lookbackUsed: lookback,
    yearsUsed: historyYears,
    tradingDayOfYear: todayTdy,
    upcoming,
  };
}

export function toDashboardPayload(v2: SeasonalityWindowV2Result) {
  const w = v2.window;
  return {
    bias: v2.bias,
    score: v2.score,
    confidence: v2.confidence,
    window: w
      ? {
          start: mmddFromLabel(w.startDateLabel, w.startTdy),
          end: mmddFromLabel(w.endDateLabel, w.endTdy),
          daysRemaining: w.daysRemaining,
          startLabel: w.startDateLabel,
          endLabel: w.endDateLabel,
        }
      : null,
    stats: w
      ? {
          avgReturn: w.stats.avgReturn,
          medianReturn: w.stats.medianReturn,
          winRate: w.stats.winRate,
          sampleSize: w.stats.sampleSize,
          bestYear: w.stats.bestYear,
          worstYear: w.stats.worstYear,
        }
      : null,
    alignment: {
      "5Y": v2.alignment.byLookback[5] ?? "NEUTRAL",
      "10Y": v2.alignment.byLookback[10] ?? "NEUTRAL",
      "15Y": v2.alignment.byLookback[15] ?? "NEUTRAL",
      "20Y": v2.alignment.byLookback[20] ?? "NEUTRAL",
      score: v2.alignment.scoreLabel,
    },
    turnDate: v2.turnDate,
  };
}

function mmddFromLabel(label: string, tdy: number): string {
  const m = label.match(/(\d+)\.\s*(\d+)\./);
  if (m) return `${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}`;
  return `TDY-${tdy}`;
}
