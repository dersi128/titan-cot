import type {
  OhlcBar,
  SeasonalBias,
  SeasonalCurvePoint,
  SeasonalEventMarker,
  SeasonalWindow,
  RollingWindowDays,
  VolatilityRegime,
  IntramonthBucket,
} from "../types";
import { buildSeasonalEvents } from "./seasonalEvents";
import { buildTradingDaySeries, parseIso, wrapTdy, yearWeight, type TradingDayRow } from "./tradingDays";
import { circularMovingAverage } from "./smoothing";
import { slopeAround, classifyBias, classifyStrength } from "./rollingSeasonalityClassifiers";

export type RollingSeasonalityOutput = {
  tradingDayOfYear: number;
  rollingProjections: Record<RollingWindowDays, SeasonalCurvePoint[]>;
  momentumAdjustedCurve: SeasonalCurvePoint[];
  trendStrength: number;
  volatilityRegime: VolatilityRegime;
  seasonalEvents: SeasonalEventMarker[];
  intramonthBuckets: IntramonthBucket[];
  primaryCurve: SeasonalCurvePoint[];
  bullishWindows: SeasonalWindow[];
  bearishWindows: SeasonalWindow[];
  seasonalBias: ReturnType<typeof classifyBias>;
  seasonalStrength: ReturnType<typeof classifyStrength>;
};

const ROLLING_WINDOWS: RollingWindowDays[] = [30, 60, 90];
const SMOOTH = 5;

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length);
}

function scaleToDisplay(values: number[]): number[] {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values.map((v) => ((v - min) / span) * 100);
}

function blendToFixedLength(values: number[], len: number): number[] {
  if (values.length >= len) return values.slice(0, len);
  const out = [...values];
  while (out.length < len) out.push(out[out.length - 1] ?? 100);
  return out;
}

function buildRollingProjection(
  rows: TradingDayRow[],
  startTdy: number,
  horizon: RollingWindowDays,
  asOfYear: number,
): SeasonalCurvePoint[] {
  const byYear = new Map<number, TradingDayRow[]>();
  for (const r of rows) {
    const list = byYear.get(r.year) ?? [];
    list.push(r);
    byYear.set(r.year, list);
  }

  const paths: { weight: number; cum: number[] }[] = [];

  for (const [year, yearRows] of byYear) {
    if (year >= asOfYear) continue;
    const w = yearWeight(asOfYear - year);
    const start = yearRows.find((r) => r.tdy === startTdy) ?? yearRows.find((r) => r.tdy >= startTdy);
    if (!start) continue;
    const idx = yearRows.indexOf(start);
    const slice = yearRows.slice(idx, idx + horizon + 1);
    if (slice.length < 8) continue;

    const cum: number[] = [100];
    for (let i = 1; i < slice.length; i++) {
      cum.push(cum[i - 1] * (1 + slice[i].ret));
    }
    paths.push({ weight: w, cum });
  }

  if (!paths.length) return [];

  const maxLen = Math.max(...paths.map((p) => p.cum.length));
  const blended: number[] = [];

  for (let i = 0; i < maxLen; i++) {
    let num = 0;
    let den = 0;
    for (const p of paths) {
      if (i >= p.cum.length) continue;
      num += p.cum[i] * p.weight;
      den += p.weight;
    }
    blended.push(den > 0 ? num / den : 100);
  }

  const fixed = blendToFixedLength(blended, horizon + 1);
  const smoothed = circularMovingAverage(fixed, SMOOTH);
  const display = scaleToDisplay(smoothed);

  return display.map((smoothedVal, i) => ({
    dayOfYear: wrapTdy(startTdy + i),
    month: Math.min(12, Math.ceil((startTdy + i) / 21)),
    value: fixed[i] ?? 100,
    smoothed: smoothedVal,
    tradingDayOffset: i,
  }));
}

function buildWeightedTdyReturns(rows: TradingDayRow[], asOfYear: number): Map<number, { sum: number; weight: number }> {
  const map = new Map<number, { sum: number; weight: number }>();
  for (const r of rows) {
    if (r.year >= asOfYear) continue;
    const w = yearWeight(asOfYear - r.year);
    const tdy = wrapTdy(r.tdy);
    const prev = map.get(tdy) ?? { sum: 0, weight: 0 };
    map.set(tdy, { sum: prev.sum + r.ret * w, weight: prev.weight + w });
  }
  return map;
}

function buildPrimarySeasonalPath(
  avgByTdy: Map<number, { sum: number; weight: number }>,
  startTdy: number,
  len: number,
): SeasonalCurvePoint[] {
  const raw: number[] = [];
  let level = 100;
  for (let i = 0; i < len; i++) {
    const tdy = wrapTdy(startTdy + i);
    const bucket = avgByTdy.get(tdy);
    const avgRet = bucket && bucket.weight > 0 ? bucket.sum / bucket.weight : 0;
    level *= 1 + avgRet;
    raw.push(level);
  }
  const smoothed = circularMovingAverage(raw, SMOOTH);
  const display = scaleToDisplay(smoothed);
  return display.map((smoothedVal, i) => ({
    dayOfYear: wrapTdy(startTdy + i),
    month: Math.min(12, Math.ceil((startTdy + i) / 21)),
    value: raw[i],
    smoothed: smoothedVal,
    tradingDayOffset: i,
  }));
}

function buildIntramonthBuckets(rows: TradingDayRow[], asOfYear: number): IntramonthBucket[] {
  const buckets = new Map<string, { sum: number; weight: number }>();
  for (const r of rows) {
    if (r.year >= asOfYear) continue;
    const week = Math.min(4, Math.ceil((r.tdy % 20) / 5) || 1);
    const key = `${r.month}-${week}`;
    const w = yearWeight(asOfYear - r.year);
    const prev = buckets.get(key) ?? { sum: 0, weight: 0 };
    buckets.set(key, { sum: prev.sum + r.ret * w, weight: prev.weight + w });
  }

  const out: IntramonthBucket[] = [];
  for (let month = 1; month <= 12; month++) {
    for (let week = 1; week <= 4; week++) {
      const b = buckets.get(`${month}-${week}`);
      const avgReturn = b && b.weight > 0 ? b.sum / b.weight : 0;
      const bias: SeasonalBias = avgReturn > 0.0004 ? "BULLISH" : avgReturn < -0.0004 ? "BEARISH" : "NEUTRAL";
      out.push({ week, month, avgReturn, bias });
    }
  }
  return out;
}

function detectWindowsFromCurve(points: SeasonalCurvePoint[], bias: SeasonalWindow["bias"]): SeasonalWindow[] {
  const windows: SeasonalWindow[] = [];
  let start: number | null = null;
  const isBull = bias === "bullish";

  for (let i = 1; i < points.length; i++) {
    const rising = points[i].smoothed > points[i - 1].smoothed;
    const active = isBull ? rising : !rising;
    if (active && start === null) start = points[i - 1].dayOfYear;
    if (!active && start !== null) {
      windows.push({
        startDay: start,
        endDay: points[i - 1].dayOfYear,
        label: `TDY ${start}–${points[i - 1].dayOfYear}`,
        bias,
      });
      start = null;
    }
  }
  return windows.slice(0, 4);
}

function computeVolatilityRegime(rows: TradingDayRow[]): VolatilityRegime {
  const rets = rows.slice(-60).map((r) => r.ret);
  const short = rows.slice(-20).map((r) => r.ret);
  if (rets.length < 20) return "NORMAL";
  const ratio = stdDev(short) / (stdDev(rets) || 1);
  if (ratio > 1.35) return "HIGH";
  if (ratio < 0.75) return "LOW";
  return "NORMAL";
}

function computeTrendStrength(rows: TradingDayRow[]): number {
  const tail = rows.slice(-20);
  if (tail.length < 5) return 0;
  const cum = tail.reduce((s, r) => s + r.ret, 0);
  return Math.max(-1, Math.min(1, cum * 50));
}

function applyMomentumAdjustment(
  base: SeasonalCurvePoint[],
  trendStrength: number,
  vol: VolatilityRegime,
): SeasonalCurvePoint[] {
  const volDamp = vol === "HIGH" ? 0.55 : vol === "LOW" ? 1.1 : 0.85;
  const adj = trendStrength * 12 * volDamp;

  return base.map((p, i) => {
    const momentum = adj * (i / Math.max(1, base.length - 1));
    const smoothed = Math.max(0, Math.min(100, p.smoothed + momentum));
    return { ...p, smoothed, value: smoothed };
  });
}

export function computeRollingSeasonality(bars: OhlcBar[], asOfDate?: string): RollingSeasonalityOutput {
  const rows = buildTradingDaySeries(bars);
  const asOf = asOfDate ?? rows[rows.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const asOfYear = parseIso(asOf).getFullYear();
  const yearRows = rows.filter((r) => r.date <= asOf);
  const currentRow = yearRows.at(-1);
  const startTdy = currentRow?.tdy ?? 1;

  const rollingProjections = {} as Record<RollingWindowDays, SeasonalCurvePoint[]>;
  for (const w of ROLLING_WINDOWS) {
    rollingProjections[w] = buildRollingProjection(rows, startTdy, w, asOfYear);
  }

  const avgByTdy = buildWeightedTdyReturns(rows, asOfYear);
  const base60 = rollingProjections[60].length ? rollingProjections[60] : buildPrimarySeasonalPath(avgByTdy, startTdy, 90);
  const ytdRows = rows.filter((r) => r.year === asOfYear && r.date <= asOf);
  const trendStrength = computeTrendStrength(ytdRows);
  const volatilityRegime = computeVolatilityRegime(yearRows);
  const momentumAdjustedCurve = applyMomentumAdjustment(base60, trendStrength, volatilityRegime);
  const slope = slopeAround(momentumAdjustedCurve, 0, 5);

  return {
    tradingDayOfYear: startTdy,
    rollingProjections,
    momentumAdjustedCurve,
    trendStrength,
    volatilityRegime,
    seasonalEvents: buildSeasonalEvents(asOf, 90),
    intramonthBuckets: buildIntramonthBuckets(rows, asOfYear),
    primaryCurve: momentumAdjustedCurve,
    bullishWindows: detectWindowsFromCurve(momentumAdjustedCurve, "bullish"),
    bearishWindows: detectWindowsFromCurve(momentumAdjustedCurve, "bearish"),
    seasonalBias: classifyBias(slope),
    seasonalStrength: classifyStrength(slope),
  };
}
