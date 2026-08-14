/** Internal symbol → Yahoo Finance ticker (free delayed quotes). */
export const YAHOO_TICKERS: Record<string, string> = {
  GOLD: "GC=F",
  SILVER: "SI=F",
  OIL: "CL=F",
  NATGAS: "NG=F",
  COCOA: "CC=F",
  COFFEE: "KC=F",
  COTTON: "CT=F",
  /** Micro E-mini Nasdaq-100 futures (CME delayed). */
  NAS100: "MNQ=F",
  AUD: "AUDUSD=X",
  EUR: "EURUSD=X",
};

export function resolveYahooTicker(symbol: string): string {
  const key = symbol.toUpperCase();
  return YAHOO_TICKERS[key] ?? symbol;
}
