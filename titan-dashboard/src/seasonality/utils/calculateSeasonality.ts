import type {
  MonthlyStat,
  OhlcBar,
  SeasonalCurvePoint,
  SeasonalityResult,
  SeasonalWindow,
} from "../types";
import { DEFAULT_YEARS_LOOKBACK, type YearsLookback } from "../yearsLookback";
import { computeRollingSeasonality } from "./rollingSeasonalityEngine";
import { buildCalendarMonthlyStats, buildWeekdayStats } from "./periodStats";

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
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
 * Seasonality engine: Seasonax-style period bars + rolling metadata.
 */
export function calculateSeasonality(options: CalculateSeasonalityOptions): SeasonalityResult {
  const { symbol, bars } = options;
  const asOf = options.asOfDate ?? bars[bars.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const rolling = computeRollingSeasonality(bars, asOf);
  const { monthlyStats, winRateByMonth, averageReturnByMonth } = buildCalendarMonthlyStats(bars);
  const weekdayStats = buildWeekdayStats(bars);

  const primaryCurve = rolling.fullYearCurve;
  const forwardCurve = rolling.momentumAdjustedCurve;
  const currentPoint = forwardCurve[0] ?? primaryCurve[0] ?? { smoothed: 50 };
  const currentSeasonalWindow = findCurrentWindow(
    rolling.bullishWindows,
    rolling.bearishWindows,
    rolling.tradingDayOfYear,
  );

  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const dailyRets: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].close > 0 && sorted[i].close > 0) {
      dailyRets.push(sorted[i].close / sorted[i - 1].close - 1);
    }
  }

  return {
    symbol,
    yearsUsed: new Set(sorted.map((b) => b.date.slice(0, 4))).size,
    selectedLookback: options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK,
    currentDate: asOf,
    seasonalBias: rolling.seasonalBias,
    seasonalStrength: rolling.seasonalStrength,
    bullishWindows: rolling.bullishWindows,
    bearishWindows: rolling.bearishWindows,
    currentSeasonalWindow,
    seasonalCurve: primaryCurve,
    monthlyStats,
    weekdayStats,
    winRateByMonth,
    averageReturnByMonth,
    currentCurveLevel: currentPoint.smoothed ?? 50,
    averageReturnInWindow: dailyRets.length ? mean(dailyRets) : 0,
    overallWinRate: dailyRets.length ? (dailyRets.filter((r) => r > 0).length / dailyRets.length) * 100 : 0,
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

export type { MonthlyStat };
