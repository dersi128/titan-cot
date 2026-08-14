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

export type MonthlyYearReturn = {
  month: number;
  monthLabel: string;
  pct: number | null;
  isCurrent: boolean;
};

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
  currentCurveLevel: number;
  averageReturnInWindow: number;
  overallWinRate: number;
  currentYearCurve: SeasonalCurvePoint[];
  seasonalityAlignment: SeasonalityAlignment;
  currentYearPerformance: number;
  historicalPerformance: number;
  currentYearMonthlyReturns?: MonthlyYearReturn[];
  engineVersion?: "rolling-v2";
  tradingDayOfYear?: number;
  rollingProjections?: Partial<Record<RollingWindowDays, SeasonalCurvePoint[]>>;
  momentumAdjustedCurve?: SeasonalCurvePoint[];
  trendStrength?: number;
  volatilityRegime?: VolatilityRegime;
  seasonalEvents?: SeasonalEventMarker[];
  intramonthBuckets?: IntramonthBucket[];
  primaryRollingWindow?: RollingWindowDays;
};

export type SeasonalityMarket = {
  id: string;
  label: string;
  dataSymbol: string;
};
