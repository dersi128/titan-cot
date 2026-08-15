/**
 * Curated seasonality search helpers — ticker + name for autocomplete.
 * Free-text Yahoo tickers still work even if not listed here.
 */

export type SeasonalitySymbolSuggestion = {
  symbol: string;
  name: string;
  kind: "stock" | "etf" | "index" | "fx" | "commodity" | "crypto";
};

export const SEASONALITY_SYMBOL_CATALOG: readonly SeasonalitySymbolSuggestion[] = [
  // US mega / popular stocks
  { symbol: "AAPL", name: "Apple", kind: "stock" },
  { symbol: "MSFT", name: "Microsoft", kind: "stock" },
  { symbol: "NVDA", name: "NVIDIA", kind: "stock" },
  { symbol: "GOOGL", name: "Alphabet", kind: "stock" },
  { symbol: "AMZN", name: "Amazon", kind: "stock" },
  { symbol: "META", name: "Meta Platforms", kind: "stock" },
  { symbol: "TSLA", name: "Tesla", kind: "stock" },
  { symbol: "BRK-B", name: "Berkshire Hathaway B", kind: "stock" },
  { symbol: "JPM", name: "JPMorgan Chase", kind: "stock" },
  { symbol: "V", name: "Visa", kind: "stock" },
  { symbol: "MA", name: "Mastercard", kind: "stock" },
  { symbol: "UNH", name: "UnitedHealth", kind: "stock" },
  { symbol: "XOM", name: "Exxon Mobil", kind: "stock" },
  { symbol: "JNJ", name: "Johnson & Johnson", kind: "stock" },
  { symbol: "WMT", name: "Walmart", kind: "stock" },
  { symbol: "PG", name: "Procter & Gamble", kind: "stock" },
  { symbol: "HD", name: "Home Depot", kind: "stock" },
  { symbol: "COST", name: "Costco", kind: "stock" },
  { symbol: "NFLX", name: "Netflix", kind: "stock" },
  { symbol: "AMD", name: "AMD", kind: "stock" },
  { symbol: "AVGO", name: "Broadcom", kind: "stock" },
  { symbol: "ORCL", name: "Oracle", kind: "stock" },
  { symbol: "CRM", name: "Salesforce", kind: "stock" },
  { symbol: "ADBE", name: "Adobe", kind: "stock" },
  { symbol: "INTC", name: "Intel", kind: "stock" },
  { symbol: "CSCO", name: "Cisco", kind: "stock" },
  { symbol: "PEP", name: "PepsiCo", kind: "stock" },
  { symbol: "KO", name: "Coca-Cola", kind: "stock" },
  { symbol: "DIS", name: "Disney", kind: "stock" },
  { symbol: "BAC", name: "Bank of America", kind: "stock" },
  { symbol: "GS", name: "Goldman Sachs", kind: "stock" },
  { symbol: "BA", name: "Boeing", kind: "stock" },
  { symbol: "CAT", name: "Caterpillar", kind: "stock" },
  { symbol: "GE", name: "GE Aerospace", kind: "stock" },
  { symbol: "UBER", name: "Uber", kind: "stock" },
  { symbol: "ABNB", name: "Airbnb", kind: "stock" },
  { symbol: "COIN", name: "Coinbase", kind: "stock" },
  { symbol: "PLTR", name: "Palantir", kind: "stock" },
  { symbol: "SHOP", name: "Shopify", kind: "stock" },
  { symbol: "SQ", name: "Block", kind: "stock" },
  { symbol: "PYPL", name: "PayPal", kind: "stock" },
  { symbol: "NKE", name: "Nike", kind: "stock" },
  { symbol: "SBUX", name: "Starbucks", kind: "stock" },
  { symbol: "MCD", name: "McDonald's", kind: "stock" },
  { symbol: "TSM", name: "TSMC", kind: "stock" },
  { symbol: "ASML", name: "ASML", kind: "stock" },
  { symbol: "SAP", name: "SAP", kind: "stock" },
  { symbol: "NVO", name: "Novo Nordisk", kind: "stock" },
  { symbol: "LLY", name: "Eli Lilly", kind: "stock" },
  { symbol: "MRK", name: "Merck", kind: "stock" },
  { symbol: "PFE", name: "Pfizer", kind: "stock" },
  { symbol: "CVX", name: "Chevron", kind: "stock" },
  { symbol: "COP", name: "ConocoPhillips", kind: "stock" },
  { symbol: "QCOM", name: "Qualcomm", kind: "stock" },
  { symbol: "TXN", name: "Texas Instruments", kind: "stock" },
  { symbol: "AMAT", name: "Applied Materials", kind: "stock" },
  { symbol: "MU", name: "Micron", kind: "stock" },
  { symbol: "IBM", name: "IBM", kind: "stock" },
  { symbol: "NOW", name: "ServiceNow", kind: "stock" },
  { symbol: "SNOW", name: "Snowflake", kind: "stock" },
  { symbol: "PANW", name: "Palo Alto Networks", kind: "stock" },
  { symbol: "CRWD", name: "CrowdStrike", kind: "stock" },
  // ETFs
  { symbol: "SPY", name: "SPDR S&P 500 ETF", kind: "etf" },
  { symbol: "QQQ", name: "Invesco QQQ", kind: "etf" },
  { symbol: "IWM", name: "iShares Russell 2000", kind: "etf" },
  { symbol: "DIA", name: "SPDR Dow Jones", kind: "etf" },
  { symbol: "GLD", name: "SPDR Gold Shares", kind: "etf" },
  { symbol: "SLV", name: "iShares Silver Trust", kind: "etf" },
  { symbol: "USO", name: "United States Oil Fund", kind: "etf" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury", kind: "etf" },
  { symbol: "HYG", name: "iShares High Yield Corp Bond", kind: "etf" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets", kind: "etf" },
  { symbol: "EWJ", name: "iShares MSCI Japan", kind: "etf" },
  { symbol: "FXI", name: "iShares China Large-Cap", kind: "etf" },
  // Indices / aliases used in app
  { symbol: "SPX", name: "S&P 500", kind: "index" },
  { symbol: "NAS100", name: "Nasdaq 100", kind: "index" },
  { symbol: "DOW", name: "Dow Jones", kind: "index" },
  { symbol: "RTY", name: "Russell 2000", kind: "index" },
  { symbol: "^GSPC", name: "S&P 500 (Yahoo)", kind: "index" },
  { symbol: "^IXIC", name: "Nasdaq Composite", kind: "index" },
  { symbol: "^DJI", name: "Dow Jones (Yahoo)", kind: "index" },
  // FX
  { symbol: "EURUSD", name: "Euro / US Dollar", kind: "fx" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", kind: "fx" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", kind: "fx" },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", kind: "fx" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", kind: "fx" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", kind: "fx" },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", kind: "fx" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", kind: "fx" },
  { symbol: "GBPJPY", name: "Pound / Japanese Yen", kind: "fx" },
  { symbol: "EURGBP", name: "Euro / Pound", kind: "fx" },
  // Commodities (app aliases)
  { symbol: "GOLD", name: "Gold", kind: "commodity" },
  { symbol: "SILVER", name: "Silver", kind: "commodity" },
  { symbol: "OIL", name: "WTI Crude Oil", kind: "commodity" },
  { symbol: "NATGAS", name: "Natural Gas", kind: "commodity" },
  { symbol: "COPPER", name: "Copper", kind: "commodity" },
  { symbol: "PLATINUM", name: "Platinum", kind: "commodity" },
  { symbol: "PALLADIUM", name: "Palladium", kind: "commodity" },
  { symbol: "COFFEE", name: "Coffee", kind: "commodity" },
  { symbol: "COCOA", name: "Cocoa", kind: "commodity" },
  { symbol: "SUGAR", name: "Sugar", kind: "commodity" },
  { symbol: "WHEAT", name: "Wheat", kind: "commodity" },
  { symbol: "CORN", name: "Corn", kind: "commodity" },
  { symbol: "SOYBEANS", name: "Soybeans", kind: "commodity" },
  // Crypto (Yahoo style)
  { symbol: "BTC-USD", name: "Bitcoin", kind: "crypto" },
  { symbol: "ETH-USD", name: "Ethereum", kind: "crypto" },
] as const;

function scoreMatch(q: string, item: SeasonalitySymbolSuggestion): number {
  const symbol = item.symbol.toUpperCase();
  const name = item.name.toUpperCase();
  if (symbol === q) return 100;
  if (symbol.startsWith(q)) return 90 - Math.min(symbol.length, 20);
  if (name.startsWith(q)) return 75;
  if (symbol.includes(q)) return 60;
  if (name.includes(q)) return 50;
  // multi-word name: match any word
  if (name.split(/\s+/).some((w) => w.startsWith(q))) return 55;
  return 0;
}

/** Ranked suggestions for autocomplete (empty query → []). */
export function searchSeasonalitySymbols(rawQuery: string, limit = 8): SeasonalitySymbolSuggestion[] {
  const q = rawQuery.trim().toUpperCase().replace(/\s+/g, " ");
  if (!q || q.length < 1) return [];

  const seen = new Set<string>();
  const scored: Array<{ item: SeasonalitySymbolSuggestion; score: number }> = [];

  for (const item of SEASONALITY_SYMBOL_CATALOG) {
    const score = scoreMatch(q, item);
    if (score <= 0) continue;
    if (seen.has(item.symbol)) continue;
    seen.add(item.symbol);
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score || a.item.symbol.localeCompare(b.item.symbol));
  return scored.slice(0, limit).map((s) => s.item);
}
