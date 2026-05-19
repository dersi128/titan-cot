/**
 * Maps TITAN futures roots (GC1!, 6A1!, …) to TradingView symbol IDs.
 * @see https://www.tradingview.com/widget/
 */
const FUTURES_TO_TRADINGVIEW: Record<string, string> = {
  "DX1!": "ICEUS:DX1!",
  "6E1!": "CME:6E1!",
  "6J1!": "CME:6J1!",
  "6B1!": "CME:6B1!",
  "6A1!": "CME:6A1!",
  "6C1!": "CME:6C1!",
  "6S1!": "CME:6S1!",
  "GC1!": "COMEX:GC1!",
  "SI1!": "COMEX:SI1!",
  "PL1!": "NYMEX:PL1!",
  "PA1!": "NYMEX:PA1!",
  "HG1!": "COMEX:HG1!",
  "CL1!": "NYMEX:CL1!",
  "NG1!": "NYMEX:NG1!",
  "ZC1!": "CBOT:ZC1!",
  "ZS1!": "CBOT:ZS1!",
  "ZW1!": "CBOT:ZW1!",
  "KC1!": "ICEUS:KC1!",
  "CC1!": "ICEUS:CC1!",
  "SB1!": "ICEUS:SB1!",
  "CT1!": "ICEUS:CT1!",
  "LE1!": "CME:LE1!",
  "HE1!": "CME:HE1!",
  "ES1!": "CME_MINI:ES1!",
  "NQ1!": "CME_MINI:NQ1!",
  "YM1!": "CBOT_MINI:YM1!",
  "RTY1!": "CME_MINI:RTY1!",
};

export function futuresToTradingViewSymbol(futuresSymbol: string): string {
  return FUTURES_TO_TRADINGVIEW[futuresSymbol] ?? `CME:${futuresSymbol}`;
}

export function tradingViewChartUrl(futuresSymbol: string): string {
  const tv = encodeURIComponent(futuresToTradingViewSymbol(futuresSymbol));
  return `https://www.tradingview.com/chart/?symbol=${tv}`;
}
