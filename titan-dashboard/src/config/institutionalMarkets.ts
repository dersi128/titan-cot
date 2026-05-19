/** Core institutional watchlist — maps to CFTC Legacy futures roots. */
export type InstitutionalMarket = {
  id: string;
  symbol: string;
  shortLabel: string;
  subtitle: string;
  /** UI grouping in scanner / heatmap */
  category: "forex" | "metals" | "energy" | "grains" | "softs" | "livestock" | "indices";
};

export const INSTITUTIONAL_MARKETS: readonly InstitutionalMarket[] = [
  // Forex
  { id: "DXY", symbol: "DX1!", shortLabel: "DXY", subtitle: "U.S. Dollar Index", category: "forex" },
  { id: "EUR", symbol: "6E1!", shortLabel: "EUR", subtitle: "Euro FX", category: "forex" },
  { id: "JPY", symbol: "6J1!", shortLabel: "JPY", subtitle: "Japanese Yen", category: "forex" },
  { id: "GBP", symbol: "6B1!", shortLabel: "GBP", subtitle: "British Pound", category: "forex" },
  { id: "AUD", symbol: "6A1!", shortLabel: "AUD", subtitle: "Australian Dollar", category: "forex" },
  { id: "CAD", symbol: "6C1!", shortLabel: "CAD", subtitle: "Canadian Dollar", category: "forex" },
  { id: "CHF", symbol: "6S1!", shortLabel: "CHF", subtitle: "Swiss Franc", category: "forex" },
  // Metals
  { id: "GOLD", symbol: "GC1!", shortLabel: "GOLD", subtitle: "Gold", category: "metals" },
  { id: "SILVER", symbol: "SI1!", shortLabel: "SILVER", subtitle: "Silver", category: "metals" },
  { id: "PLATINUM", symbol: "PL1!", shortLabel: "PLAT", subtitle: "Platinum", category: "metals" },
  { id: "PALLADIUM", symbol: "PA1!", shortLabel: "PALL", subtitle: "Palladium", category: "metals" },
  { id: "COPPER", symbol: "HG1!", shortLabel: "COPPER", subtitle: "Copper", category: "metals" },
  // Energy
  { id: "OIL", symbol: "CL1!", shortLabel: "OIL", subtitle: "WTI Crude", category: "energy" },
  { id: "NATGAS", symbol: "NG1!", shortLabel: "NG", subtitle: "Natural Gas (Henry Hub)", category: "energy" },
  // Grains
  { id: "CORN", symbol: "ZC1!", shortLabel: "CORN", subtitle: "Corn", category: "grains" },
  { id: "SOYBEANS", symbol: "ZS1!", shortLabel: "SOY", subtitle: "Soybeans", category: "grains" },
  { id: "WHEAT", symbol: "ZW1!", shortLabel: "WHEAT", subtitle: "Wheat SRW", category: "grains" },
  // Softs
  { id: "COFFEE", symbol: "KC1!", shortLabel: "COFFEE", subtitle: "Coffee C", category: "softs" },
  { id: "COCOA", symbol: "CC1!", shortLabel: "COCOA", subtitle: "Cocoa", category: "softs" },
  { id: "SUGAR", symbol: "SB1!", shortLabel: "SUGAR", subtitle: "Sugar No. 11", category: "softs" },
  { id: "COTTON", symbol: "CT1!", shortLabel: "COTTON", subtitle: "Cotton No. 2", category: "softs" },
  // Livestock
  { id: "CATTLE", symbol: "LE1!", shortLabel: "CATTLE", subtitle: "Live Cattle", category: "livestock" },
  { id: "HOGS", symbol: "HE1!", shortLabel: "HOGS", subtitle: "Lean Hogs", category: "livestock" },
  // Indices
  { id: "SP500", symbol: "ES1!", shortLabel: "SP 500", subtitle: "E-mini S&P 500 · ES1!", category: "indices" },
  { id: "NAS100", symbol: "NQ1!", shortLabel: "NAS 100", subtitle: "E-mini Nasdaq-100 · NQ1!", category: "indices" },
  { id: "DOW", symbol: "YM1!", shortLabel: "DOW", subtitle: "Dow E-mini", category: "indices" },
  { id: "RUSSELL", symbol: "RTY1!", shortLabel: "RTY", subtitle: "Russell 2000 E-mini", category: "indices" },
] as const;

export const INSTITUTIONAL_SYMBOLS = INSTITUTIONAL_MARKETS.map((m) => m.symbol);

export const MARKET_CATEGORY_LABELS: Record<InstitutionalMarket["category"], string> = {
  forex: "Forex",
  metals: "Metals",
  energy: "Energy",
  grains: "Grains",
  softs: "Softs",
  livestock: "Livestock",
  indices: "Indices",
};

/** Default instrument when the dashboard loads (scanner + detail + heatmap). */
export const DEFAULT_INSTITUTIONAL_MARKET_ID = "DXY" as const;

export function getInstitutionalMarketById(id: string): InstitutionalMarket | undefined {
  return INSTITUTIONAL_MARKETS.find((m) => m.id === id);
}

export function getInstitutionalMarketBySymbol(symbol: string): InstitutionalMarket | undefined {
  return INSTITUTIONAL_MARKETS.find((m) => m.symbol === symbol);
}

export function getDefaultSelectedMarket(): InstitutionalMarket {
  const byId = getInstitutionalMarketById(DEFAULT_INSTITUTIONAL_MARKET_ID);
  if (byId) return byId;
  const first = INSTITUTIONAL_MARKETS[0];
  if (first) return first;
  throw new Error("INSTITUTIONAL_MARKETS is empty");
}
