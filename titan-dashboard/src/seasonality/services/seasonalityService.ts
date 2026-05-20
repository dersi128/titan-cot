import { getOhlcProvider } from "../data/providers";
import type { OhlcProviderId } from "../data/types";
import { calculateSeasonality } from "../utils/calculateSeasonality";
import type { SeasonalityResult } from "../types";

export type SeasonalityServiceOptions = {
  providerId?: OhlcProviderId;
  years?: number;
  asOfDate?: string;
};

/**
 * Loads daily OHLC via configured provider and runs the seasonality engine.
 */
export async function fetchSeasonalityAnalysis(
  symbol: string,
  options: SeasonalityServiceOptions = {},
): Promise<SeasonalityResult> {
  const provider = getOhlcProvider(options.providerId ?? "mock");
  const bars = await provider.fetchDailyOHLC(symbol, { years: options.years ?? 15 });
  if (bars.length < 252) {
    throw new Error(`Insufficient OHLC history for ${symbol} (${bars.length} bars)`);
  }
  return calculateSeasonality({
    symbol,
    bars,
    asOfDate: options.asOfDate,
  });
}
