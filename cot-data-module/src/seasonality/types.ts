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
  /** Offset from anchor TDY in rolling projection (0 = today). */
  tradingDayOffset?: number;
};

export type RollingWindowDays = 30 | 60 | 90;

export type VolatilityRegime = "LOW" | "NORMAL" | "HIGH";

export type SeasonalEventType = "FOMC" | "CPI" | "OPEX" | "NVDA_EARNINGS" | "ELECTION";

export type SeasonalEventMarker = {
  type: SeasonalEventType;
  date: string;
  label: string;
  tdyOffset: number;
};

export type IntramonthBucket = {
  week: number;
  month: number;
  avgReturn: number;
  bias: SeasonalBias;
};

export type MonthlyStat = {
  month: number;
  monthLabel: string;
  avgReturn: number;
  winRate: number;
  bias: SeasonalBias;
};

export type WeekdayStat = {
  weekday: number;
  weekdayLabel: string;
  avgReturn: number;
  winRate: number;
  bias: SeasonalBias;
};

import type { YearsLookback } from "./yearsLookback.js";

export type SeasonalityAlignment = "ALIGNED" | "DIVERGING" | "STRONGLY_DIVERGING";

import type { MonthlyYearReturn } from "./utils/monthlyYearReturns.js";

/** Client-only deviation layer — stubbed on API module. */
export type SeasonalDeviationAnalysis = Record<string, unknown>;

export type { MonthlyYearReturn };

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
  weekdayStats?: WeekdayStat[];
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
  /** Current Year vs 10Y expectation — institutional deviation layer. */
  deviationAnalysis?: SeasonalDeviationAnalysis;
  /** Calendar-month % returns for the active year (real OHLC). */
  currentYearMonthlyReturns?: MonthlyYearReturn[];
  /** Rolling institutional engine (30/60/90 TD projections) or window-v2. */
  engineVersion?: "rolling-v2" | "window-v2";
  tradingDayOfYear?: number;
  rollingProjections?: Partial<Record<RollingWindowDays, SeasonalCurvePoint[]>>;
  momentumAdjustedCurve?: SeasonalCurvePoint[];
  trendStrength?: number;
  volatilityRegime?: VolatilityRegime;
  seasonalEvents?: SeasonalEventMarker[];
  intramonthBuckets?: IntramonthBucket[];
  primaryRollingWindow?: RollingWindowDays;
  /** V2 historical window engine payload (pure seasonality). */
  windowEngine?: {
    score: number;
    confidence: SeasonalStrength;
    turnDate: string | null;
    alignmentLabel: string;
    avgReturn: number;
    medianReturn: number;
    winRate: number;
    sampleSize: number;
    daysRemaining: number;
    windowLabel: string;
    upcomingLabel?: string;
    upcomingScore?: number;
    upcomingSide?: "BULLISH" | "BEARISH";
    daysUntilStart?: number;
  };
};

export type SeasonalityMarket = {
  id: string;
  label: string;
  dataSymbol: string;
};
