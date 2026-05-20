import { getOhlcProvider } from "../data/providers";
import type { OhlcProviderId } from "../data/types";
import {
  DEFAULT_YEARS_LOOKBACK,
  filterBarsByLookback,
  lookbackLabel,
  MAX_OHLC_FETCH_YEARS,
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
