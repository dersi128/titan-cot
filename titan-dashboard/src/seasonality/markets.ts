import type { SeasonalityMarket } from "./types";

/** Quick-pick markets (most common). Everything else via search. */
export const SEASONALITY_MARKETS: readonly SeasonalityMarket[] = [
  { id: "GOLD", label: "Gold", dataSymbol: "GOLD" },
  { id: "SILVER", label: "Silver", dataSymbol: "SILVER" },
  { id: "OIL", label: "Oil", dataSymbol: "OIL" },
  { id: "NAS100", label: "Nasdaq", dataSymbol: "NAS100" },
  { id: "SPX", label: "S&P 500", dataSymbol: "SPX" },
  { id: "EUR", label: "EURUSD", dataSymbol: "EUR" },
  { id: "GBP", label: "GBPUSD", dataSymbol: "GBP" },
  { id: "USDJPY", label: "USDJPY", dataSymbol: "USDJPY" },
] as const;

export const DEFAULT_SEASONALITY_MARKET_ID = "GOLD";

export function getSeasonalityMarket(id: string): SeasonalityMarket | undefined {
  const key = id.trim().toUpperCase();
  return SEASONALITY_MARKETS.find((m) => m.id === key || m.dataSymbol === key);
}

/** Preset or free-text Yahoo/custom symbol (AAPL, EURJPY=X, …). */
export function resolveSeasonalityMarket(id: string): SeasonalityMarket | null {
  const raw = id.trim();
  if (!raw) return null;
  const preset = getSeasonalityMarket(raw);
  if (preset) return preset;
  const symbol = normalizeCustomSymbol(raw);
  if (!symbol) return null;
  return { id: symbol, label: symbol, dataSymbol: symbol };
}

/** Allow Yahoo-style tickers: AAPL, BRK-B, EURJPY=X, ^GSPC, BTC-USD */
export function normalizeCustomSymbol(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned || cleaned.length > 24) return null;
  if (!/^[A-Z0-9.^*=-]+$/.test(cleaned)) return null;
  return cleaned;
}
