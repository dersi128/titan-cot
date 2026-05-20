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
import { computeRollingSeasonality } from "./rollingSeasonalityEngine";
import { buildTradingDaySeries, parseIso } from "./tradingDays";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SMOOTH_WINDOW = 10;

type DailyReturnRow = {
  date: string;
  year: number;
  month: number;
  dayOfYear: number;
  ret: number;
};

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
    const d = parseIso(cur.date);
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

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
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
    monthlyStats.push({ month: m, monthLabel: MONTH_LABELS[m - 1], avgReturn: avg, winRate, bias });
  }

  return { monthlyStats, winRateByMonth, averageReturnByMonth };
}

function findCurrentWindow(windows: SeasonalWindow[], bearish: SeasonalWindow[], tdy: number): SeasonalWindow | null {
  const all = [...windows, ...bearish];
  for (const w of all) {
    if (w.startDay <= w.endDay) {
      if (tdy >= w.startDay && tdy <= w.endDay) return w;
    } else if (tdy >= w.startDay || tdy <= w.endDay) {
      return w;
    }
  }
  return all[0] ?? null;
}

export function slopeAround(points: SeasonalCurvePoint[], centerDoy: number, span = 15): number {
  const byOffset = points.every((p) => p.tradingDayOffset !== undefined);
  if (byOffset) {
    const samples: number[] = [];
    for (let delta = -span; delta <= span; delta++) {
      const p = points.find((x) => x.tradingDayOffset === delta);
      if (p) samples.push(p.smoothed);
    }
    if (samples.length < 2) return 0;
    return (samples[samples.length - 1] - samples[0]) / samples.length;
  }
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

export type CalculateSeasonalityOptions = {
  symbol: string;
  bars: OhlcBar[];
  asOfDate?: string;
  yearsLookback?: YearsLookback;
};

/**
 * Rolling trading-day seasonality (v2) with legacy monthly stats for tables.
 */
export function calculateSeasonality(options: CalculateSeasonalityOptions): SeasonalityResult {
  const { symbol, bars } = options;
  const asOf = options.asOfDate ?? bars[bars.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const rolling = computeRollingSeasonality(bars, asOf);
  const returns = computeDailyReturns(bars);
  const years = new Set(returns.map((r) => r.year));
  const { monthlyStats, winRateByMonth, averageReturnByMonth } = buildMonthlyStats(returns);

  const primaryCurve = rolling.momentumAdjustedCurve;
  const currentPoint = primaryCurve[0] ?? { smoothed: 50 };
  const currentSeasonalWindow = findCurrentWindow(
    rolling.bullishWindows,
    rolling.bearishWindows,
    rolling.tradingDayOfYear,
  );

  const windowReturns = returns.filter((r) => r.date >= asOf.slice(0, 4));

  return {
    symbol,
    yearsUsed: years.size,
    selectedLookback: options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK,
    currentDate: asOf,
    seasonalBias: rolling.seasonalBias,
    seasonalStrength: rolling.seasonalStrength,
    bullishWindows: rolling.bullishWindows,
    bearishWindows: rolling.bearishWindows,
    currentSeasonalWindow,
    seasonalCurve: primaryCurve,
    monthlyStats,
    winRateByMonth,
    averageReturnByMonth,
    currentCurveLevel: currentPoint.smoothed ?? 50,
    averageReturnInWindow: windowReturns.length ? mean(windowReturns.map((r) => r.ret)) : 0,
    overallWinRate: returns.length ? (returns.filter((r) => r.ret > 0).length / returns.length) * 100 : 0,
    currentYearCurve: [],
    seasonalityAlignment: "ALIGNED",
    currentYearPerformance: 0,
    historicalPerformance: currentPoint.smoothed ?? 50,
    engineVersion: "rolling-v2",
    tradingDayOfYear: rolling.tradingDayOfYear,
    rollingProjections: rolling.rollingProjections,
    momentumAdjustedCurve: rolling.momentumAdjustedCurve,
    trendStrength: rolling.trendStrength,
    volatilityRegime: rolling.volatilityRegime,
    seasonalEvents: rolling.seasonalEvents,
    intramonthBuckets: rolling.intramonthBuckets,
    primaryRollingWindow: 60,
  };
}
