import { getOhlcProvider } from "../data/providers";
import type { OhlcProviderId } from "../data/types";
import {
  CHART_COMPARISON_LOOKBACKS,
  DEFAULT_YEARS_LOOKBACK,
  filterBarsByLookback,
  lookbackLabel,
  MAX_OHLC_FETCH_YEARS,
  YEARS_LOOKBACK_OPTIONS,
  type YearsLookback,
} from "../yearsLookback";
import { calculateSeasonality } from "../utils/calculateSeasonality";
import type { SeasonalityResult } from "../types";

export type SeasonalityServiceOptions = {
  providerId?: OhlcProviderId;
  /** @deprecated Use yearsLookback. Kept for provider fetch sizing only. */
  years?: number;
  yearsLookback?: YearsLookback;
  asOfDate?: string;
};

/**
 * Loads daily OHLC via configured provider and runs the seasonality engine.
 */
export async function fetchSeasonalityAnalysis(
  symbol: string,
  options: SeasonalityServiceOptions = {},
): Promise<SeasonalityResult> {
  const lookback = options.yearsLookback ?? DEFAULT_YEARS_LOOKBACK;
  const provider = getOhlcProvider(options.providerId ?? "mock");
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });
  const filtered = filterBarsByLookback(bars, lookback, options.asOfDate);

  if (filtered.length < 252) {
    throw new Error(`Insufficient OHLC history for ${symbol} (${filtered.length} bars, ${lookbackLabel(lookback)})`);
  }

  return calculateSeasonality({
    symbol,
    bars: filtered,
    asOfDate: options.asOfDate,
    yearsLookback: lookback,
  });
}

export type SeasonalityComparison = Partial<Record<YearsLookback, SeasonalityResult>>;

/**
 * One OHLC fetch, multiple lookback curves for parallel chart overlay.
 */
export async function fetchSeasonalityComparison(
  symbol: string,
  options: Omit<SeasonalityServiceOptions, "yearsLookback"> & {
    lookbacks?: readonly YearsLookback[];
  } = {},
): Promise<SeasonalityComparison> {
  const lookbacks = options.lookbacks ?? CHART_COMPARISON_LOOKBACKS;
  const provider = getOhlcProvider(options.providerId ?? "mock");
  const fetchYears = Math.max(MAX_OHLC_FETCH_YEARS, options.years ?? MAX_OHLC_FETCH_YEARS);
  const bars = await provider.fetchDailyOHLC(symbol, { years: fetchYears });

  const comparison: SeasonalityComparison = {};

  for (const lb of lookbacks) {
    const filtered = filterBarsByLookback(bars, lb, options.asOfDate);
    if (filtered.length < 252) continue;
    comparison[lb] = calculateSeasonality({
      symbol,
      bars: filtered,
      asOfDate: options.asOfDate,
      yearsLookback: lb,
    });
  }

  const primary = comparison[DEFAULT_YEARS_LOOKBACK];
  if (!primary) {
    const first = YEARS_LOOKBACK_OPTIONS.find((lb) => comparison[lb]);
    if (!first || !comparison[first]) {
      throw new Error(`Insufficient OHLC history for ${symbol}`);
    }
  }

  return comparison;
}
