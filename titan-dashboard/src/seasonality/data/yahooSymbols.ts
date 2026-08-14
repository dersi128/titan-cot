/** Internal / alias → Yahoo Finance ticker (free delayed quotes). */
export const YAHOO_TICKERS: Record<string, string> = {
  GOLD: "GC=F",
  SILVER: "SI=F",
  OIL: "CL=F",
  NATGAS: "NG=F",
  COCOA: "CC=F",
  COFFEE: "KC=F",
  COTTON: "CT=F",
  NAS100: "MNQ=F",
  NQ: "NQ=F",
  SPX: "^GSPC",
  SP500: "^GSPC",
  ES: "ES=F",
  AUD: "AUDUSD=X",
  EUR: "EURUSD=X",
  EURUSD: "EURUSD=X",
  GBP: "GBPUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "USDJPY=X",
  JPY: "USDJPY=X",
  EURJPY: "EURJPY=X",
  EURGBP: "EURGBP=X",
  AUDUSD: "AUDUSD=X",
  USDCAD: "USDCAD=X",
  USDCHF: "USDCHF=X",
  NZDUSD: "NZDUSD=X",
  APPLE: "AAPL",
  AAPL: "AAPL",
  MSFT: "MSFT",
  NVDA: "NVDA",
  TSLA: "TSLA",
  AMZN: "AMZN",
  META: "META",
  GOOG: "GOOG",
  GOOGL: "GOOGL",
  BTC: "BTC-USD",
  BTCUSD: "BTC-USD",
  ETH: "ETH-USD",
};

const FX_PAIR = /^[A-Z]{6}$/;

export function resolveYahooTicker(symbol: string): string {
  const key = symbol.trim().toUpperCase();
  if (YAHOO_TICKERS[key]) return YAHOO_TICKERS[key];
  // EURJPY → EURJPY=X
  if (FX_PAIR.test(key) && !key.includes("=")) return `${key}=X`;
  return key;
}
