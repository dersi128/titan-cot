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
  { futuresSymbol: "NG1!", displayName: "NATURAL GAS", apiSlug: "natural-gas" },
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
  {
    futuresSymbol: "6N1!",
    displayName: "NEW ZEALAND DOLLAR",
    apiSlug: "new-zealand-dollar",
    aliases: ["nzd", "6n", "6n1", "6n1!"],
  },
  {
    futuresSymbol: "6M1!",
    displayName: "MEXICAN PESO",
    apiSlug: "mexican-peso",
    aliases: ["mxn", "6m", "6m1", "6m1!", "peso"],
  },
  {
    futuresSymbol: "ZF1!",
    displayName: "UST 5Y NOTE",
    apiSlug: "ust-5y",
    aliases: ["5y", "zf", "zf1", "zf1!", "us5y", "fv"],
  },
  {
    futuresSymbol: "ZN1!",
    displayName: "UST 10Y NOTE",
    apiSlug: "ust-10y",
    aliases: ["10y", "zn", "zn1", "zn1!", "us10y", "ty"],
  },
  {
    futuresSymbol: "ZB1!",
    displayName: "UST BOND",
    apiSlug: "ust-30y",
    aliases: ["30y", "zb", "zb1", "zb1!", "us30y", "us-bond", "t-bond"],
  },
  {
    futuresSymbol: "RB1!",
    displayName: "GASOLINE RBOB",
    apiSlug: "gasoline",
    aliases: ["rb", "rb1", "rb1!", "rbob"],
  },
  {
    futuresSymbol: "HO1!",
    displayName: "NY HARBOR ULSD",
    apiSlug: "heating-oil",
    aliases: ["ho", "ho1", "ho1!", "ulsd", "heatingoil"],
  },
  {
    futuresSymbol: "ZM1!",
    displayName: "SOYBEAN MEAL",
    apiSlug: "soybean-meal",
    aliases: ["zm", "zm1", "zm1!", "meal", "soymeal"],
  },
  {
    futuresSymbol: "ZL1!",
    displayName: "SOYBEAN OIL",
    apiSlug: "soybean-oil",
    aliases: ["zl", "zl1", "zl1!", "soyoil", "boil"],
  },
  {
    futuresSymbol: "ZR1!",
    displayName: "ROUGH RICE",
    apiSlug: "rough-rice",
    aliases: ["zr", "zr1", "zr1!", "rice"],
  },
  {
    futuresSymbol: "OJ1!",
    displayName: "FRZN CONCENTRATED ORANGE JUICE",
    apiSlug: "orange-juice",
    aliases: ["oj", "oj1", "oj1!", "fcoj"],
  },
  {
    futuresSymbol: "GF1!",
    displayName: "FEEDER CATTLE",
    apiSlug: "feeder-cattle",
    aliases: ["gf", "gf1", "gf1!", "feeder"],
  },
  {
    futuresSymbol: "BTC1!",
    displayName: "BITCOIN",
    apiSlug: "bitcoin",
    aliases: ["btc", "btc1", "btc1!"],
  },
  {
    futuresSymbol: "ETH1!",
    displayName: "ETHER CASH SETTLED",
    apiSlug: "ether",
    aliases: ["eth", "eth1", "eth1!", "ethereum"],
  },
  {
    futuresSymbol: "VX1!",
    displayName: "VIX FUTURES",
    apiSlug: "vix",
    aliases: ["vx", "vx1", "vx1!", "vix-futures"],
  },
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
