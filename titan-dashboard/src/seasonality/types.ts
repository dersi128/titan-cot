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

export type SeasonalityResult = {
  symbol: string;
  yearsUsed: number;
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
};

export type SeasonalityMarket = {
  id: string;
  label: string;
  dataSymbol: string;
};
