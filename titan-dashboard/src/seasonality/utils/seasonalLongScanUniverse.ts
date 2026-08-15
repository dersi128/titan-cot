/**
 * Home pulse “seasonal longs” scan universe — majors, crosses, indices, commodities.
 * Symbols resolve via cot-data-module Yahoo map (and XXXYYY → XXXYYY=X).
 */
export const SEASONAL_LONG_SCAN_MARKETS: readonly { id: string; label: string; dataSymbol: string }[] = [
  // FX majors
  { id: "EURUSD", label: "EURUSD", dataSymbol: "EURUSD" },
  { id: "GBPUSD", label: "GBPUSD", dataSymbol: "GBPUSD" },
  { id: "USDJPY", label: "USDJPY", dataSymbol: "USDJPY" },
  { id: "AUDUSD", label: "AUDUSD", dataSymbol: "AUDUSD" },
  { id: "USDCAD", label: "USDCAD", dataSymbol: "USDCAD" },
  { id: "USDCHF", label: "USDCHF", dataSymbol: "USDCHF" },
  { id: "NZDUSD", label: "NZDUSD", dataSymbol: "NZDUSD" },
  // Major crosses
  { id: "EURJPY", label: "EURJPY", dataSymbol: "EURJPY" },
  { id: "GBPJPY", label: "GBPJPY", dataSymbol: "GBPJPY" },
  { id: "AUDJPY", label: "AUDJPY", dataSymbol: "AUDJPY" },
  { id: "CADJPY", label: "CADJPY", dataSymbol: "CADJPY" },
  { id: "CHFJPY", label: "CHFJPY", dataSymbol: "CHFJPY" },
  { id: "EURGBP", label: "EURGBP", dataSymbol: "EURGBP" },
  { id: "EURCHF", label: "EURCHF", dataSymbol: "EURCHF" },
  { id: "EURAUD", label: "EURAUD", dataSymbol: "EURAUD" },
  { id: "GBPAUD", label: "GBPAUD", dataSymbol: "GBPAUD" },
  { id: "AUDCAD", label: "AUDCAD", dataSymbol: "AUDCAD" },
  { id: "AUDNZD", label: "AUDNZD", dataSymbol: "AUDNZD" },
  // Indices
  { id: "NAS100", label: "Nasdaq", dataSymbol: "NAS100" },
  { id: "SPX", label: "S&P 500", dataSymbol: "SPX" },
  { id: "DOW", label: "Dow", dataSymbol: "DOW" },
  { id: "RTY", label: "Russell", dataSymbol: "RTY" },
  // Commodities
  { id: "GOLD", label: "Gold", dataSymbol: "GOLD" },
  { id: "SILVER", label: "Silver", dataSymbol: "SILVER" },
  { id: "OIL", label: "Oil", dataSymbol: "OIL" },
  { id: "NATGAS", label: "Nat Gas", dataSymbol: "NATGAS" },
  { id: "COPPER", label: "Copper", dataSymbol: "COPPER" },
  { id: "PLATINUM", label: "Platinum", dataSymbol: "PLATINUM" },
  { id: "PALLADIUM", label: "Palladium", dataSymbol: "PALLADIUM" },
  { id: "COFFEE", label: "Coffee", dataSymbol: "COFFEE" },
  { id: "COCOA", label: "Cocoa", dataSymbol: "COCOA" },
  { id: "COTTON", label: "Cotton", dataSymbol: "COTTON" },
  { id: "SUGAR", label: "Sugar", dataSymbol: "SUGAR" },
  { id: "WHEAT", label: "Wheat", dataSymbol: "WHEAT" },
  { id: "CORN", label: "Corn", dataSymbol: "CORN" },
  { id: "SOYBEANS", label: "Soybeans", dataSymbol: "SOYBEANS" },
] as const;
