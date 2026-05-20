/** Daily OHLC bar — universal input for seasonality engine. */
export type OhlcBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type SeasonalBias = "BULLISH" | "BEARISH" | "NEUTRAL";

export type SeasonalStrength = "LOW" | "MODERATE" | "HIGH" | "EXTREME";

export type SeasonalWindowBias = "bullish" | "bearish";

export type SeasonalWindow = {
  startDay: number;
  endDay: number;
  label: string;
  bias: SeasonalWindowBias;
};

export type SeasonalCurvePoint = {
  dayOfYear: number;
  value: number;
  smoothed: number;
  month: number;
};

export type MonthlyStat = {
  month: number;
  monthLabel: string;
  avgReturn: number;
  winRate: number;
  bias: SeasonalBias;
};

import type { YearsLookback } from "./yearsLookback";

export type SeasonalityAlignment = "ALIGNED" | "DIVERGING" | "STRONGLY_DIVERGING";

export type SeasonalityResult = {
  symbol: string;
  yearsUsed: number;
  selectedLookback: YearsLookback;
  currentDate: string;
  seasonalBias: SeasonalBias;
  seasonalStrength: SeasonalStrength;
  bullishWindows: SeasonalWindow[];
  bearishWindows: SeasonalWindow[];
  currentSeasonalWindow: SeasonalWindow | null;
  seasonalCurve: SeasonalCurvePoint[];
  monthlyStats: MonthlyStat[];
  winRateByMonth: Record<number, number>;
  averageReturnByMonth: Record<number, number>;
  /** Smoothed index at current calendar position (base 100). */
  currentCurveLevel: number;
  /** Mean daily return in active window (%). */
  averageReturnInWindow: number;
  /** Share of positive daily returns in sample (%). */
  overallWinRate: number;
  /** YTD cumulative trajectory for the active calendar year (normalized 0–100). */
  currentYearCurve: SeasonalCurvePoint[];
  /** Historical vs current-year directional fit at today. */
  seasonalityAlignment: SeasonalityAlignment;
  /** YTD % performance (base 100). */
  currentYearPerformance: number;
  /** Historical seasonal index at current date (0–100). */
  historicalPerformance: number;
};

export type SeasonalityMarket = {
  id: string;
  label: string;
  dataSymbol: string;
};
