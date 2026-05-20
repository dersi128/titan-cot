import type { OhlcBar } from "../types";
import type { OhlcProviderId } from "./types";
import { mockOhlcProvider } from "./mockOhlcProvider";
import { yahooOhlcProvider } from "./yahooOhlcProvider";
import { getOhlcProvider } from "./providers";

/** Default: Yahoo (free). Set VITE_OHLC_PROVIDER=mock for synthetic only. */
export function getDefaultOhlcProviderId(): OhlcProviderId {
  const raw = import.meta.env.VITE_OHLC_PROVIDER?.trim().toLowerCase();
  if (raw === "mock") return "mock";
  if (raw === "yahoo") return "yahoo";
  return "yahoo";
}

export async function fetchOhlcWithFallback(
  symbol: string,
  years: number,
  preferred: OhlcProviderId = getDefaultOhlcProviderId(),
): Promise<{ bars: OhlcBar[]; source: OhlcProviderId }> {
  try {
    const bars = await getOhlcProvider(preferred).fetchDailyOHLC(symbol, { years });
    return { bars, source: preferred };
  } catch (primaryErr) {
    if (preferred === "mock") throw primaryErr;
    console.warn("[seasonality] Yahoo OHLC failed, using mock:", primaryErr);
    const bars = await mockOhlcProvider.fetchDailyOHLC(symbol, { years });
    return { bars, source: "mock" };
  }
}
