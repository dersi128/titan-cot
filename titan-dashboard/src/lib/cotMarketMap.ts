export type CotMarketMapping = {
  futuresSymbol: string;
  displayName: string;
  apiSlug: string;
  aliases?: readonly string[];
};

/** Mirrors cot-data-module mappings (symbols the API can serve). */
export const COT_MARKET_MAPPINGS: CotMarketMapping[] = [
  { futuresSymbol: "GC1!", displayName: "GOLD", apiSlug: "gold" },
  { futuresSymbol: "SI1!", displayName: "SILVER", apiSlug: "silver" },
  { futuresSymbol: "PL1!", displayName: "PLATINUM", apiSlug: "platinum" },
  { futuresSymbol: "PA1!", displayName: "PALLADIUM", apiSlug: "palladium" },
  { futuresSymbol: "HG1!", displayName: "COPPER-GRADE #1", apiSlug: "copper" },
  { futuresSymbol: "CL1!", displayName: "CRUDE OIL, LIGHT SWEET", apiSlug: "crude-oil" },
  { futuresSymbol: "NG1!", displayName: "NATURAL GAS (HENRY HUB)", apiSlug: "natural-gas" },
  { futuresSymbol: "ZC1!", displayName: "CORN", apiSlug: "corn" },
  { futuresSymbol: "ZS1!", displayName: "SOYBEANS", apiSlug: "soybeans" },
  { futuresSymbol: "ZW1!", displayName: "WHEAT SRW (CBOT)", apiSlug: "wheat-srw" },
  { futuresSymbol: "KC1!", displayName: "COFFEE C", apiSlug: "coffee" },
  { futuresSymbol: "CT1!", displayName: "COTTON NO. 2", apiSlug: "cotton" },
  { futuresSymbol: "CC1!", displayName: "COCOA", apiSlug: "cocoa" },
  { futuresSymbol: "SB1!", displayName: "SUGAR NO. 11", apiSlug: "sugar" },
  { futuresSymbol: "LE1!", displayName: "LIVE CATTLE", apiSlug: "live-cattle" },
  { futuresSymbol: "HE1!", displayName: "LEAN HOGS", apiSlug: "lean-hogs" },
  {
    futuresSymbol: "NQ1!",
    displayName: "E-MINI NASDAQ-100",
    apiSlug: "nasdaq",
    aliases: ["nq", "nq1", "nq1!", "nas100", "nas-100", "nasdaq100", "ndx"],
  },
  {
    futuresSymbol: "ES1!",
    displayName: "E-MINI S&P 500",
    apiSlug: "sp500",
    aliases: ["es", "es1", "es1!", "sp-500", "s&p500"],
  },
  { futuresSymbol: "YM1!", displayName: "E-MINI DOW ($5)", apiSlug: "e-mini-dow" },
  { futuresSymbol: "RTY1!", displayName: "E-MINI RUSSELL 2000", apiSlug: "russell-2000" },
  { futuresSymbol: "DX1!", displayName: "U.S. DOLLAR INDEX", apiSlug: "usd-index" },
  { futuresSymbol: "6J1!", displayName: "JAPANESE YEN", apiSlug: "japanese-yen" },
  { futuresSymbol: "6E1!", displayName: "EURO FX", apiSlug: "euro-fx" },
  { futuresSymbol: "6B1!", displayName: "BRITISH POUND", apiSlug: "british-pound" },
  { futuresSymbol: "6A1!", displayName: "AUSTRALIAN DOLLAR", apiSlug: "australian-dollar" },
  { futuresSymbol: "6C1!", displayName: "CANADIAN DOLLAR", apiSlug: "canadian-dollar" },
  { futuresSymbol: "6S1!", displayName: "SWISS FRANC", apiSlug: "swiss-franc" },
];

export function getCotMarketMapping(symbolOrSlug: string): CotMarketMapping | undefined {
  const raw = decodeURIComponent(symbolOrSlug).trim();
  const upper = raw.toUpperCase();
  const slug = raw.toLowerCase();

  return COT_MARKET_MAPPINGS.find((mapping) => {
    if (mapping.futuresSymbol.toUpperCase() === upper) return true;
    if (mapping.apiSlug.toLowerCase() === slug) return true;
    if (mapping.aliases?.some((a) => a.toLowerCase() === slug)) return true;
    if (mapping.displayName.toUpperCase() === upper) return true;
    return false;
  });
}
