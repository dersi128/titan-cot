import type { SeasonalityMarket } from "./types.js";

export const SEASONALITY_MARKETS: readonly SeasonalityMarket[] = [
  { id: "GOLD", label: "Gold", dataSymbol: "GOLD" },
  { id: "SILVER", label: "Silver", dataSymbol: "SILVER" },
  { id: "OIL", label: "Oil", dataSymbol: "OIL" },
  { id: "NATGAS", label: "Natural Gas", dataSymbol: "NATGAS" },
  { id: "COCOA", label: "Cocoa", dataSymbol: "COCOA" },
  { id: "COFFEE", label: "Coffee", dataSymbol: "COFFEE" },
  { id: "COTTON", label: "Cotton", dataSymbol: "COTTON" },
  { id: "NAS100", label: "NAS 100", dataSymbol: "NAS100" },
  { id: "AUD", label: "AUD", dataSymbol: "AUD" },
  { id: "EUR", label: "EUR", dataSymbol: "EUR" },
] as const;

export function getSeasonalityMarket(id: string): SeasonalityMarket | undefined {
  return SEASONALITY_MARKETS.find((m) => m.id === id);
}
