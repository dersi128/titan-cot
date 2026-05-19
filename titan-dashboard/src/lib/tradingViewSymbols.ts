/**
 * TradingView symbol mapping.
 * Free embed widget blocks many CME/COMEX continuous futures (→ "only available on TradingView").
 * Embed uses liquid spot/index proxies; full futures open via tradingViewFuturesUrl().
 */

export type TradingViewSymbolMapping = {
  /** CFTC / TITAN futures root */
  futuresRoot: string;
  /** Full futures symbol on tradingview.com */
  futuresTv: string;
  /** Symbol allowed in free Advanced Chart embed */
  embedTv: string;
  /** Short note for UI (Czech) */
  embedNote: string;
};

const MAPPINGS: TradingViewSymbolMapping[] = [
  // Forex
  { futuresRoot: "DX1!", futuresTv: "ICEUS:DX1!", embedTv: "TVC:DXY", embedNote: "Embed: DXY index. Futures DX → Otevřít v TV." },
  { futuresRoot: "6E1!", futuresTv: "CME:6E1!", embedTv: "FX:EURUSD", embedNote: "Embed: EUR/USD spot. Futures 6E → Otevřít v TV." },
  { futuresRoot: "6J1!", futuresTv: "CME:6J1!", embedTv: "FX:USDJPY", embedNote: "Embed: USD/JPY spot. Futures 6J → Otevřít v TV." },
  { futuresRoot: "6B1!", futuresTv: "CME:6B1!", embedTv: "FX:GBPUSD", embedNote: "Embed: GBP/USD spot. Futures 6B → Otevřít v TV." },
  { futuresRoot: "6A1!", futuresTv: "CME:6A1!", embedTv: "FX:AUDUSD", embedNote: "Embed: AUD/USD spot. Futures 6A → Otevřít v TV." },
  { futuresRoot: "6C1!", futuresTv: "CME:6C1!", embedTv: "FX:USDCAD", embedNote: "Embed: USD/CAD spot. Futures 6C → Otevřít v TV." },
  { futuresRoot: "6S1!", futuresTv: "CME:6S1!", embedTv: "FX:USDCHF", embedNote: "Embed: USD/CHF spot. Futures 6S → Otevřít v TV." },
  // Metals
  { futuresRoot: "GC1!", futuresTv: "COMEX:GC1!", embedTv: "TVC:GOLD", embedNote: "Embed: gold spot index. Futures GC → Otevřít v TV." },
  { futuresRoot: "SI1!", futuresTv: "COMEX:SI1!", embedTv: "TVC:SILVER", embedNote: "Embed: silver spot index. Futures SI → Otevřít v TV." },
  { futuresRoot: "PL1!", futuresTv: "NYMEX:PL1!", embedTv: "TVC:PLATINUM", embedNote: "Embed: platinum index. Futures PL → Otevřít v TV." },
  { futuresRoot: "PA1!", futuresTv: "NYMEX:PA1!", embedTv: "TVC:PALLADIUM", embedNote: "Embed: palladium index. Futures PA → Otevřít v TV." },
  { futuresRoot: "HG1!", futuresTv: "COMEX:HG1!", embedTv: "TVC:COPPER", embedNote: "Embed: copper index. Futures HG → Otevřít v TV." },
  // Energy
  { futuresRoot: "CL1!", futuresTv: "NYMEX:CL1!", embedTv: "TVC:USOIL", embedNote: "Embed: WTI oil benchmark. Futures CL → Otevřít v TV." },
  { futuresRoot: "NG1!", futuresTv: "NYMEX:NG1!", embedTv: "TVC:NATURALGAS", embedNote: "Embed: nat gas benchmark. Futures NG → Otevřít v TV." },
  // Grains
  { futuresRoot: "ZC1!", futuresTv: "CBOT:ZC1!", embedTv: "CBOT:CORN1!", embedNote: "Embed může omezit data. Futures ZC → Otevřít v TV." },
  { futuresRoot: "ZS1!", futuresTv: "CBOT:ZS1!", embedTv: "CBOT:ZS1!", embedNote: "Futures soybeans — pokud embed selže, použij Otevřít v TV." },
  { futuresRoot: "ZW1!", futuresTv: "CBOT:ZW1!", embedTv: "CBOT:ZW1!", embedNote: "Futures wheat — pokud embed selže, použij Otevřít v TV." },
  // Softs
  { futuresRoot: "KC1!", futuresTv: "ICEUS:KC1!", embedTv: "ICEUS:KC1!", embedNote: "Coffee futures — pokud embed selže, použij Otevřít v TV." },
  { futuresRoot: "CC1!", futuresTv: "ICEUS:CC1!", embedTv: "ICEUS:CC1!", embedNote: "Cocoa futures — pokud embed selže, použij Otevřít v TV." },
  { futuresRoot: "SB1!", futuresTv: "ICEUS:SB1!", embedTv: "ICEUS:SB1!", embedNote: "Sugar futures — pokud embed selže, použij Otevřít v TV." },
  { futuresRoot: "CT1!", futuresTv: "ICEUS:CT1!", embedTv: "ICEUS:CT1!", embedNote: "Cotton futures — pokud embed selže, použij Otevřít v TV." },
  // Livestock
  { futuresRoot: "LE1!", futuresTv: "CME:LE1!", embedTv: "CME:LE1!", embedNote: "Live cattle — pokud embed selže, použij Otevřít v TV." },
  { futuresRoot: "HE1!", futuresTv: "CME:HE1!", embedTv: "CME:HE1!", embedNote: "Lean hogs — pokud embed selže, použij Otevřít v TV." },
  // Indices
  { futuresRoot: "ES1!", futuresTv: "CME_MINI:ES1!", embedTv: "SP:SPX", embedNote: "Embed: S&P 500 cash. Futures ES → Otevřít v TV." },
  { futuresRoot: "NQ1!", futuresTv: "CME_MINI:NQ1!", embedTv: "NASDAQ:NDX", embedNote: "Embed: Nasdaq 100 index. Futures NQ → Otevřít v TV." },
  { futuresRoot: "YM1!", futuresTv: "CBOT_MINI:YM1!", embedTv: "DJ:DJI", embedNote: "Embed: Dow Jones. Futures YM → Otevřít v TV." },
  { futuresRoot: "RTY1!", futuresTv: "CME_MINI:RTY1!", embedTv: "RUSSELL:RUT", embedNote: "Embed: Russell 2000. Futures RTY → Otevřít v TV." },
];

const BY_ROOT = new Map(MAPPINGS.map((m) => [m.futuresRoot, m]));

function fallback(futuresSymbol: string): TradingViewSymbolMapping {
  const futuresTv = `CME:${futuresSymbol}`;
  return {
    futuresRoot: futuresSymbol,
    futuresTv,
    embedTv: futuresTv,
    embedNote: "Futures v embed widgetu často nejsou dostupné — použij Otevřít v TV.",
  };
}

export function getTradingViewMapping(futuresSymbol: string): TradingViewSymbolMapping {
  return BY_ROOT.get(futuresSymbol) ?? fallback(futuresSymbol);
}

/** Full futures chart on tradingview.com (always correct contract). */
export function tradingViewFuturesUrl(futuresSymbol: string): string {
  const tv = encodeURIComponent(getTradingViewMapping(futuresSymbol).futuresTv);
  return `https://www.tradingview.com/chart/?symbol=${tv}`;
}

/** Symbol for free embed iframe (proxy when futures blocked). */
export function embedTradingViewSymbol(futuresSymbol: string): string {
  return getTradingViewMapping(futuresSymbol).embedTv;
}

/** @deprecated Use getTradingViewMapping().futuresTv */
export function futuresToTradingViewSymbol(futuresSymbol: string): string {
  return getTradingViewMapping(futuresSymbol).futuresTv;
}

/** @deprecated Use tradingViewFuturesUrl */
export function tradingViewChartUrl(futuresSymbol: string): string {
  return tradingViewFuturesUrl(futuresSymbol);
}
