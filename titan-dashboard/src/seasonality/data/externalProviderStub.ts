import type { OhlcBar } from "../types";
import type { OhlcDataProvider, OhlcFetchOptions, OhlcProviderId } from "./types";

/**
 * Factory for future Yahoo / TwelveData / Polygon / CSV / API adapters.
 * Register with `registerOhlcProvider(createExternalProviderStub("yahoo", "Yahoo Finance"))`
 * once implemented.
 */
export function createExternalProviderStub(id: OhlcProviderId, label: string): OhlcDataProvider {
  return {
    id,
    label,
    async fetchDailyOHLC(_symbol: string, _options?: OhlcFetchOptions): Promise<OhlcBar[]> {
      throw new Error(`${label} OHLC provider is not configured yet. Implement adapter and registerOhlcProvider().`);
    },
  };
}
