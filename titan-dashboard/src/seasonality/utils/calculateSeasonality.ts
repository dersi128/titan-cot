import type {
  MonthlyStat,
  OhlcBar,
  SeasonalBias,
  SeasonalCurvePoint,
  SeasonalityResult,
  SeasonalStrength,
  SeasonalWindow,
} from "../types";
import { DEFAULT_YEARS_LOOKBACK, type YearsLookback } from "../yearsLookback";
import { circularMovingAverage } from "./smoothing";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SMOOTH_WINDOW = 10;

type DailyReturnRow = {
  date: string;
  year: number;
  month: number;
  dayOfYear: number;
  ret: number;
};

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function computeDailyReturns(bars: OhlcBar[]): DailyReturnRow[] {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const rows: DailyReturnRow[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (prev.close <= 0 || cur.close <= 0) continue;
    const d = parseDate(cur.date);
    rows.push({
      date: cur.date,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      dayOfYear: dayOfYear(d),
      ret: cur.close / prev.close - 1,
    });
  }

  return rows;
}

function averageReturnByDayOfYear(rows: DailyReturnRow[]): Map<number, number[]> {
  const buckets = new Map<number, number[]>();
  for (const r of rows) {
    const list = buckets.get(r.dayOfYear) ?? [];
    list.push(r.ret);
    buckets.set(r.dayOfYear, list);
  }
  return buckets;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildSeasonalCurve(avgByDoy: Map<number, number[]>, maxDoy: number): { raw: number[]; points: SeasonalCurvePoint[] } {
  const raw: number[] = [];
  let level = 100;

  for (let doy = 1; doy <= maxDoy; doy++) {
    const samples = avgByDoy.get(doy) ?? [];
    const avgRet = samples.length > 0 ? mean(samples) : 0;
    level *= 1 + avgRet;
    raw.push(level);
  }

  const smoothed = circularMovingAverage(raw, SMOOTH_WINDOW);

  const min = Math.min(...smoothed);
  const max = Math.max(...smoothed);
  const span = max - min || 1;

  const points: SeasonalCurvePoint[] = [];
  for (let doy = 1; doy <= maxDoy; doy++) {
    const idx = doy - 1;
    const date = new Date(2024, 0, doy);
    points.push({
      dayOfYear: doy,
      value: raw[idx],
      smoothed: ((smoothed[idx] - min) / span) * 100,
      month: date.getMonth() + 1,
    });
  }

  return { raw, points };
}

function slopeAround(points: SeasonalCurvePoint[], centerDoy: number, span = 15): number {
  const n = points.length;
  const samples: number[] = [];
  for (let delta = -span; delta <= span; delta++) {
    const doy = ((centerDoy + delta - 1 + n) % n) + 1;
    const p = points.find((x) => x.dayOfYear === doy);
    if (p) samples.push(p.smoothed);
  }
  if (samples.length < 2) return 0;
  return (samples[samples.length - 1] - samples[0]) / samples.length;
}

function classifyBias(slope: number): SeasonalBias {
  if (slope > 0.35) return "BULLISH";
  if (slope < -0.35) return "BEARISH";
  return "NEUTRAL";
}

function classifyStrength(slope: number): SeasonalStrength {
  const abs = Math.abs(slope);
  if (abs >= 1.2) return "EXTREME";
  if (abs >= 0.75) return "HIGH";
  if (abs >= 0.35) return "MODERATE";
  return "LOW";
}

function detectWindows(points: SeasonalCurvePoint[], bias: SeasonalWindow["bias"]): SeasonalWindow[] {
  const n = points.length;
  const windows: SeasonalWindow[] = [];
  let start: number | null = null;

  const isBull = bias === "bullish";

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const cur = points[i];
    const rising = cur.smoothed > prev.smoothed;
    const active = isBull ? rising : !rising;

    if (active && start === null) {
      start = cur.dayOfYear;
    } else if (!active && start !== null) {
      const endDay = prev.dayOfYear;
      if (endDay !== start) {
        windows.push({
          startDay: start,
          endDay,
          label: windowLabel(start, endDay),
          bias,
        });
      }
      start = null;
    }
  }

  if (start !== null) {
    windows.push({
      startDay: start,
      endDay: points[n - 1].dayOfYear,
      label: windowLabel(start, points[n - 1].dayOfYear),
      bias,
    });
  }

  return windows.slice(0, 4);
}

function windowLabel(startDay: number, endDay: number): string {
  const s = new Date(2024, 0, startDay);
  const e = new Date(2024, 0, endDay);
  return `${MONTH_LABELS[s.getMonth()]} – ${MONTH_LABELS[e.getMonth()]}`;
}

function findCurrentWindow(
  windows: SeasonalWindow[],
  bearish: SeasonalWindow[],
  doy: number,
): SeasonalWindow | null {
  const all = [...windows, ...bearish];
  for (const w of all) {
    if (w.startDay <= w.endDay) {
      if (doy >= w.startDay && doy <= w.endDay) return w;
    } else if (doy >= w.startDay || doy <= w.endDay) {
      return w;
    }
  }
  return all[0] ?? null;
}

function buildMonthlyStats(rows: DailyReturnRow[]): {
  monthlyStats: MonthlyStat[];
  winRateByMonth: Record<number, number>;
  averageReturnByMonth: Record<number, number>;
} {
  const byMonth = new Map<number, number[]>();
  for (const r of rows) {
    const list = byMonth.get(r.month) ?? [];
    list.push(r.ret);
    byMonth.set(r.month, list);
  }

  const monthlyStats: MonthlyStat[] = [];
  const winRateByMonth: Record<number, number> = {};
  const averageReturnByMonth: Record<number, number> = {};

  for (let m = 1; m <= 12; m++) {
    const rets = byMonth.get(m) ?? [];
    const avg = rets.length ? mean(rets) : 0;
    const wins = rets.filter((x) => x > 0).length;
    const winRate = rets.length ? (wins / rets.length) * 100 : 0;
    const bias: SeasonalBias = avg > 0.0003 ? "BULLISH" : avg < -0.0003 ? "BEARISH" : "NEUTRAL";

    winRateByMonth[m] = winRate;
    averageReturnByMonth[m] = avg;
    monthlyStats.push({
      month: m,
      monthLabel: MONTH_LABELS[m - 1],
      avgReturn: avg,
      winRate,
      bias,
    });
  }

  return { monthlyStats, winRateByMonth, averageReturnByMonth };
}

export type CalculateSeasonalityOptions = {
  symbol: string;
  bars: OhlcBar[];
  asOfDate?: string;
};

export function calculateSeasonality(options: CalculateSeasonalityOptions): SeasonalityResult {
  const { symbol, bars } = options;
  const asOf = options.asOfDate ?? bars[bars.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const asOfParsed = parseDate(asOf);
  const currentDoy = dayOfYear(asOfParsed);

  const returns = computeDailyReturns(bars);
  const years = new Set(returns.map((r) => r.year));
  const avgByDoy = averageReturnByDayOfYear(returns);
  const maxDoy = 365;
  const { points } = buildSeasonalCurve(avgByDoy, maxDoy);

  const slope = slopeAround(points, currentDoy, 15);
  const seasonalBias = classifyBias(slope);
  const seasonalStrength = classifyStrength(slope);

  const bullishWindows = detectWindows(points, "bullish");
  const bearishWindows = detectWindows(points, "bearish");
  const currentSeasonalWindow = findCurrentWindow(bullishWindows, bearishWindows, currentDoy);

  const { monthlyStats, winRateByMonth, averageReturnByMonth } = buildMonthlyStats(returns);

  const currentPoint = points.find((p) => p.dayOfYear === currentDoy) ?? points[0];
  const windowReturns =
    currentSeasonalWindow && currentSeasonalWindow.bias === "bullish"
      ? returns.filter((r) => {
          if (currentSeasonalWindow.startDay <= currentSeasonalWindow.endDay) {
            return r.dayOfYear >= currentSeasonalWindow.startDay && r.dayOfYear <= currentSeasonalWindow.endDay;
          }
          return r.dayOfYear >= currentSeasonalWindow.startDay || r.dayOfYear <= currentSeasonalWindow.endDay;
        })
      : returns.filter((r) => r.month === asOfParsed.getMonth() + 1);

  const averageReturnInWindow = windowReturns.length ? mean(windowReturns.map((r) => r.ret)) : 0;
  const overallWinRate =
    returns.length > 0 ? (returns.filter((r) => r.ret > 0).length / returns.length) * 100 : 0;

  return {
    symbol,
    yearsUsed: years.size,
    selectedLookback: options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK,
    currentDate: asOf,
    seasonalBias,
    seasonalStrength,
    bullishWindows,
    bearishWindows,
    currentSeasonalWindow,
    seasonalCurve: points,
    monthlyStats,
    winRateByMonth,
    averageReturnByMonth,
    currentCurveLevel: currentPoint?.smoothed ?? 50,
    averageReturnInWindow,
    overallWinRate,
  };
}
