import type { SeasonalityMarket } from "./types.js";

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

export function getSeasonalityMarket(id: string): SeasonalityMarket | undefined {
  const key = id.trim().toUpperCase();
  return SEASONALITY_MARKETS.find((m) => m.id === key || m.dataSymbol === key);
}

export function normalizeCustomSymbol(raw: string): string | null {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned || cleaned.length > 24) return null;
  if (!/^[A-Z0-9.^*=-]+$/.test(cleaned)) return null;
  return cleaned;
}

export function resolveSeasonalitySymbol(param: string): string | null {
  const raw = param.trim();
  if (!raw) return null;
  const upper = decodeURIComponent(raw).toUpperCase();
  const preset = getSeasonalityMarket(upper);
  if (preset) return preset.dataSymbol;
  return normalizeCustomSymbol(upper);
}
