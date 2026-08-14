import type { OhlcProviderId } from "./types.js";
import { getOhlcProvider } from "./providers.js";

/** Default: Yahoo (free). Set SEASONALITY_OHLC_PROVIDER=mock for synthetic only. */
export function getConfiguredOhlcProviderId(): OhlcProviderId {
  const raw = process.env.SEASONALITY_OHLC_PROVIDER?.trim().toLowerCase();
  if (raw === "mock") return "mock";
  if (raw === "yahoo") return "yahoo";
  return "yahoo";
}

export function getConfiguredOhlcProvider() {
  return getOhlcProvider(getConfiguredOhlcProviderId());
}
