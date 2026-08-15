import type {
  MonthlyStat,
  OhlcBar,
  SeasonalityResult,
  SeasonalWindow,
} from "../types";
import { DEFAULT_YEARS_LOOKBACK, type YearsLookback } from "../yearsLookback";
import { computeRollingSeasonality } from "./rollingSeasonalityEngine";
import { buildCalendarMonthlyStats, buildWeekdayStats } from "./periodStats";
import {
  computeSeasonalityWindowsV2,
  DEFAULT_WINDOW_LOOKBACK,
  type WindowLookback,
} from "./seasonalWindowEngineV2";

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export type CalculateSeasonalityOptions = {
  symbol: string;
  bars: OhlcBar[];
  asOfDate?: string;
  yearsLookback?: YearsLookback;
};

function toLegacyWindow(
  startDay: number,
  endDay: number,
  label: string,
  bias: "bullish" | "bearish",
): SeasonalWindow {
  return { startDay, endDay, label, bias };
}

/**
 * Seasonality engine V2: historical windows drive bias/score.
 * Rolling curve kept for charts only — momentum does NOT set seasonal bias.
 */
export function calculateSeasonality(options: CalculateSeasonalityOptions): SeasonalityResult {
  const { symbol, bars } = options;
  const asOf = options.asOfDate ?? bars[bars.length - 1]?.date ?? new Date().toISOString().slice(0, 10);
  const lookback = options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK;
  const windowLb: WindowLookback =
    lookback === "ALL" ? DEFAULT_WINDOW_LOOKBACK : (lookback as WindowLookback);

  const rolling = computeRollingSeasonality(bars, asOf);
  const v2 = computeSeasonalityWindowsV2(bars, asOf, windowLb);
  const { monthlyStats, winRateByMonth, averageReturnByMonth } = buildCalendarMonthlyStats(bars);
  const weekdayStats = buildWeekdayStats(bars);

  const primaryCurve = rolling.fullYearCurve;
  // Chart forward path: use pure rolling projection without momentum bias for display base
  const forwardCurve = rolling.rollingProjections?.[60]?.length
    ? rolling.rollingProjections[60]
    : rolling.momentumAdjustedCurve;
  const currentPoint = forwardCurve[0] ?? primaryCurve[0] ?? { smoothed: 50 };

  const bullishWindows = v2.bullishWindows.slice(0, 4).map((w) =>
    toLegacyWindow(w.startTdy, w.endTdy, `${w.startDateLabel} → ${w.endDateLabel}`, "bullish"),
  );
  const bearishWindows = v2.bearishWindows.slice(0, 4).map((w) =>
    toLegacyWindow(w.startTdy, w.endTdy, `${w.startDateLabel} → ${w.endDateLabel}`, "bearish"),
  );

  const currentSeasonalWindow = v2.window
    ? toLegacyWindow(
        v2.window.startTdy,
        v2.window.endTdy,
        `${v2.window.startDateLabel} → ${v2.window.endDateLabel}`,
        v2.window.direction === "BULLISH" ? "bullish" : "bearish",
      )
    : null;

  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const winRatePct = v2.window ? v2.window.stats.winRate * 100 : 0;
  const avgInWindow = v2.window ? v2.window.stats.avgReturn : 0;

  return {
    symbol,
    yearsUsed: v2.yearsUsed || new Set(sorted.map((b) => b.date.slice(0, 4))).size,
    selectedLookback: lookback,
    currentDate: asOf,
    seasonalBias: v2.bias,
    seasonalStrength: v2.confidence,
    bullishWindows,
    bearishWindows,
    currentSeasonalWindow,
    seasonalCurve: primaryCurve,
    monthlyStats,
    weekdayStats,
    winRateByMonth,
    averageReturnByMonth,
    currentCurveLevel: currentPoint.smoothed ?? 50,
    averageReturnInWindow: avgInWindow,
    overallWinRate: winRatePct,
    currentYearCurve: [],
    seasonalityAlignment: "ALIGNED",
    currentYearPerformance: 0,
    historicalPerformance: currentPoint.smoothed ?? 50,
    engineVersion: "window-v2",
    tradingDayOfYear: v2.tradingDayOfYear,
    rollingProjections: rolling.rollingProjections,
    // Charts only — never drives seasonal bias / window status
    momentumAdjustedCurve: rolling.rollingProjections?.[60] ?? rolling.fullYearCurve,
    trendStrength: rolling.trendStrength,
    volatilityRegime: rolling.volatilityRegime,
    seasonalEvents: rolling.seasonalEvents,
    intramonthBuckets: rolling.intramonthBuckets,
    primaryRollingWindow: 60,
    windowEngine: {
      status: v2.status,
      score: v2.score,
      confidence: v2.confidence,
      turnDate: v2.turnDate,
      alignmentLabel: v2.alignment.scoreLabel,
      avgReturn: v2.window?.stats.avgReturn ?? 0,
      medianReturn: v2.window?.stats.medianReturn ?? 0,
      winRate: v2.window?.stats.winRate ?? 0,
      lossRate: v2.window?.stats.lossRate ?? 0,
      sampleSize: v2.window?.stats.sampleSize ?? 0,
      daysRemaining: v2.window?.daysRemaining ?? 0,
      windowLabel: v2.window
        ? `${v2.window.startDateLabel} → ${v2.window.endDateLabel}`
        : "—",
      upcomingLabel: v2.upcoming
        ? `${v2.upcoming.startDateLabel} → ${v2.upcoming.endDateLabel}`
        : undefined,
      upcomingScore: v2.upcoming?.score,
      upcomingSide: v2.upcoming?.direction,
      upcomingAvgReturn: v2.upcoming?.stats.avgReturn,
      upcomingWinRate: v2.upcoming?.stats.winRate,
      upcomingSampleSize: v2.upcoming?.stats.sampleSize,
      daysUntilStart: v2.upcoming?.daysUntilStart ?? 0,
    },
  };
}

export type { MonthlyStat };
