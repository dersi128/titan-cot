export type CotMarketMapping = {
  futuresSymbol: string;
  /** User-facing label in API JSON (`market`) / UI */
  displayName: string;
  apiSlug: string;
  /** Path aliases, e.g. `/api/cot/nq` → NQ1! */
  aliases?: readonly string[];
  /**
   * Exact CFTC Legacy Futures Only `cftc_contract_market_code`.
   * This is the query key — names on Socrata can drift.
   */
  cftcContractMarketCode: string;
  /** CFTC `contract_market_name` for display only. */
  socrataContractMarketName?: string;
  /** CFTC `commodity_name` for display only. */
  socrataCommodityName?: string;
};

/**
 * Futures roots → CFTC Legacy Futures Only (`6dca-aqww`) by unique contract code.
 */
export const COT_MARKET_MAPPINGS: CotMarketMapping[] = [
  {
    futuresSymbol: "GC1!",
    displayName: "GOLD",
    apiSlug: "gold",
    cftcContractMarketCode: "088691",
    socrataCommodityName: "GOLD",
    socrataContractMarketName: "GOLD",
  },
  {
    futuresSymbol: "SI1!",
    displayName: "SILVER",
    apiSlug: "silver",
    cftcContractMarketCode: "084691",
    socrataCommodityName: "SILVER",
    socrataContractMarketName: "SILVER",
  },
  {
    futuresSymbol: "HG1!",
    displayName: "COPPER-GRADE #1",
    apiSlug: "copper",
    cftcContractMarketCode: "085692",
    socrataCommodityName: "COPPER",
    socrataContractMarketName: "COPPER- #1",
  },
  {
    futuresSymbol: "CL1!",
    displayName: "CRUDE OIL, LIGHT SWEET",
    apiSlug: "crude-oil",
    cftcContractMarketCode: "067651",
    socrataCommodityName: "CRUDE OIL",
    socrataContractMarketName: "WTI-PHYSICAL",
  },
  {
    futuresSymbol: "NG1!",
    displayName: "NATURAL GAS",
    apiSlug: "natural-gas",
    cftcContractMarketCode: "023651",
    socrataCommodityName: "NATURAL GAS",
    socrataContractMarketName: "NAT GAS NYME",
  },
  {
    futuresSymbol: "ZW1!",
    displayName: "WHEAT SRW (CBOT)",
    apiSlug: "wheat-srw",
    cftcContractMarketCode: "001602",
    socrataCommodityName: "WHEAT",
    socrataContractMarketName: "WHEAT-SRW",
  },
  {
    futuresSymbol: "NQ1!",
    displayName: "E-MINI NASDAQ-100",
    apiSlug: "nasdaq",
    aliases: ["nq", "nq1", "nq1!", "nas100", "nas-100", "nasdaq100", "ndx"],
    cftcContractMarketCode: "209742",
    socrataCommodityName: "NASDAQ  BROADBASED INDICES",
    socrataContractMarketName: "NASDAQ MINI",
  },
  {
    futuresSymbol: "ES1!",
    displayName: "E-MINI S&P 500",
    apiSlug: "sp500",
    aliases: ["es", "es1", "es1!", "sp-500", "sp500", "s&p500"],
    cftcContractMarketCode: "13874A",
    socrataCommodityName: "S&P BROAD BASED STOCK INDICES",
    socrataContractMarketName: "E-MINI S&P 500",
  },
  {
    futuresSymbol: "YM1!",
    displayName: "E-MINI DOW ($5)",
    apiSlug: "e-mini-dow",
    cftcContractMarketCode: "124603",
    socrataCommodityName: "DOW JONES BROAD BASED INDICES",
    socrataContractMarketName: "DJIA x $5",
  },
  {
    futuresSymbol: "RTY1!",
    displayName: "E-MINI RUSSELL 2000",
    apiSlug: "russell-2000",
    cftcContractMarketCode: "239742",
    socrataCommodityName: "RUSSELL INDEX",
    socrataContractMarketName: "RUSSELL E-MINI",
  },
  {
    futuresSymbol: "DX1!",
    displayName: "U.S. DOLLAR INDEX",
    apiSlug: "usd-index",
    cftcContractMarketCode: "098662",
    socrataCommodityName: "U.S. DOLLAR INDEX",
    socrataContractMarketName: "USD INDEX",
  },
  {
    futuresSymbol: "6J1!",
    displayName: "JAPANESE YEN",
    apiSlug: "japanese-yen",
    cftcContractMarketCode: "097741",
    socrataCommodityName: "JAPANESE YEN",
    socrataContractMarketName: "JAPANESE YEN",
  },
  {
    futuresSymbol: "6E1!",
    displayName: "EURO FX",
    apiSlug: "euro-fx",
    cftcContractMarketCode: "099741",
    socrataCommodityName: "EUROPEAN CURRENCY UNIT",
    socrataContractMarketName: "EURO FX",
  },
  {
    futuresSymbol: "6B1!",
    displayName: "BRITISH POUND",
    apiSlug: "british-pound",
    cftcContractMarketCode: "096742",
    socrataCommodityName: "POUND STERLING",
    socrataContractMarketName: "BRITISH POUND",
  },
  {
    futuresSymbol: "6A1!",
    displayName: "AUSTRALIAN DOLLAR",
    apiSlug: "australian-dollar",
    cftcContractMarketCode: "232741",
    socrataCommodityName: "AUSTRALIAN DOLLAR",
    socrataContractMarketName: "AUSTRALIAN DOLLAR",
  },
  {
    futuresSymbol: "6C1!",
    displayName: "CANADIAN DOLLAR",
    apiSlug: "canadian-dollar",
    cftcContractMarketCode: "090741",
    socrataCommodityName: "CANADIAN DOLLAR",
    socrataContractMarketName: "CANADIAN DOLLAR",
  },
  {
    futuresSymbol: "6S1!",
    displayName: "SWISS FRANC",
    apiSlug: "swiss-franc",
    cftcContractMarketCode: "092741",
    socrataCommodityName: "SWISS FRANC",
    socrataContractMarketName: "SWISS FRANC",
  },
  {
    futuresSymbol: "6N1!",
    displayName: "NEW ZEALAND DOLLAR",
    apiSlug: "new-zealand-dollar",
    aliases: ["nzd", "6n", "6n1", "6n1!"],
    cftcContractMarketCode: "112741",
    socrataCommodityName: "NEW ZEALAND DOLLAR",
    socrataContractMarketName: "NZ DOLLAR",
  },
  {
    futuresSymbol: "CC1!",
    displayName: "COCOA",
    apiSlug: "cocoa",
    cftcContractMarketCode: "073732",
    socrataCommodityName: "COCOA",
    socrataContractMarketName: "COCOA",
  },
  {
    futuresSymbol: "SB1!",
    displayName: "SUGAR NO. 11",
    apiSlug: "sugar",
    cftcContractMarketCode: "080732",
    socrataCommodityName: "SUGAR",
    socrataContractMarketName: "SUGAR NO. 11",
  },
  {
    futuresSymbol: "PL1!",
    displayName: "PLATINUM",
    apiSlug: "platinum",
    cftcContractMarketCode: "076651",
    socrataCommodityName: "PLATINUM",
    socrataContractMarketName: "PLATINUM",
  },
  {
    futuresSymbol: "PA1!",
    displayName: "PALLADIUM",
    apiSlug: "palladium",
    cftcContractMarketCode: "075651",
    socrataCommodityName: "PALLADIUM",
    socrataContractMarketName: "PALLADIUM",
  },
  {
    futuresSymbol: "ZC1!",
    displayName: "CORN",
    apiSlug: "corn",
    cftcContractMarketCode: "002602",
    socrataCommodityName: "CORN",
    socrataContractMarketName: "CORN",
  },
  {
    futuresSymbol: "ZS1!",
    displayName: "SOYBEANS",
    apiSlug: "soybeans",
    cftcContractMarketCode: "005602",
    socrataCommodityName: "SOYBEANS",
    socrataContractMarketName: "SOYBEANS",
  },
  {
    futuresSymbol: "KC1!",
    displayName: "COFFEE C",
    apiSlug: "coffee",
    cftcContractMarketCode: "083731",
    socrataCommodityName: "COFFEE",
    socrataContractMarketName: "COFFEE C",
  },
  {
    futuresSymbol: "CT1!",
    displayName: "COTTON NO. 2",
    apiSlug: "cotton",
    cftcContractMarketCode: "033661",
    socrataCommodityName: "COTTON",
    socrataContractMarketName: "COTTON NO. 2",
  },
  {
    futuresSymbol: "LE1!",
    displayName: "LIVE CATTLE",
    apiSlug: "live-cattle",
    cftcContractMarketCode: "057642",
    socrataCommodityName: "LIVE CATTLE",
    socrataContractMarketName: "LIVE CATTLE",
  },
  {
    futuresSymbol: "HE1!",
    displayName: "LEAN HOGS",
    apiSlug: "lean-hogs",
    cftcContractMarketCode: "054642",
    socrataCommodityName: "LEAN HOGS",
    socrataContractMarketName: "LEAN HOGS",
  },
  {
    futuresSymbol: "ZF1!",
    displayName: "UST 5Y NOTE",
    apiSlug: "ust-5y",
    aliases: ["5y", "zf", "zf1", "zf1!", "us5y", "fv"],
    cftcContractMarketCode: "044601",
    socrataCommodityName: "T-NOTES, 4-6 YEAR",
    socrataContractMarketName: "UST 5Y NOTE",
  },
  {
    futuresSymbol: "ZN1!",
    displayName: "UST 10Y NOTE",
    apiSlug: "ust-10y",
    aliases: ["10y", "zn", "zn1", "zn1!", "us10y", "ty"],
    cftcContractMarketCode: "043602",
    socrataCommodityName: "T-NOTES, 6.5-10 YEAR",
    socrataContractMarketName: "UST 10Y NOTE",
  },
  {
    futuresSymbol: "ZB1!",
    displayName: "UST BOND",
    apiSlug: "ust-30y",
    aliases: ["30y", "zb", "zb1", "zb1!", "us30y", "us-bond", "t-bond"],
    cftcContractMarketCode: "020601",
    socrataCommodityName: "T-BONDS",
    socrataContractMarketName: "UST BOND",
  },
  {
    futuresSymbol: "RB1!",
    displayName: "GASOLINE RBOB",
    apiSlug: "gasoline",
    aliases: ["rb", "rb1", "rb1!", "rbob"],
    cftcContractMarketCode: "111659",
    socrataCommodityName: "GASOLINE",
    socrataContractMarketName: "GASOLINE RBOB",
  },
  {
    futuresSymbol: "HO1!",
    displayName: "NY HARBOR ULSD",
    apiSlug: "heating-oil",
    aliases: ["ho", "ho1", "ho1!", "ulsd", "heatingoil"],
    cftcContractMarketCode: "022651",
    socrataCommodityName: "HEATING OIL-DIESEL-GASOIL",
    socrataContractMarketName: "NY HARBOR ULSD",
  },
  {
    futuresSymbol: "ZM1!",
    displayName: "SOYBEAN MEAL",
    apiSlug: "soybean-meal",
    aliases: ["zm", "zm1", "zm1!", "meal", "soymeal"],
    cftcContractMarketCode: "026603",
    socrataCommodityName: "SOYBEAN MEAL",
    socrataContractMarketName: "SOYBEAN MEAL",
  },
  {
    futuresSymbol: "ZL1!",
    displayName: "SOYBEAN OIL",
    apiSlug: "soybean-oil",
    aliases: ["zl", "zl1", "zl1!", "soyoil", "boil"],
    cftcContractMarketCode: "007601",
    socrataCommodityName: "SOYBEAN OIL",
    socrataContractMarketName: "SOYBEAN OIL",
  },
  {
    futuresSymbol: "ZR1!",
    displayName: "ROUGH RICE",
    apiSlug: "rough-rice",
    aliases: ["zr", "zr1", "zr1!", "rice"],
    cftcContractMarketCode: "039601",
    socrataCommodityName: "RICE",
    socrataContractMarketName: "ROUGH RICE",
  },
  {
    futuresSymbol: "OJ1!",
    displayName: "FRZN CONCENTRATED ORANGE JUICE",
    apiSlug: "orange-juice",
    aliases: ["oj", "oj1", "oj1!", "fcoj"],
    cftcContractMarketCode: "040701",
    socrataCommodityName: "FROZEN CONCENTRATED ORANGE JUICE",
    socrataContractMarketName: "FRZN CONCENTRATED ORANGE JUICE",
  },
  {
    futuresSymbol: "GF1!",
    displayName: "FEEDER CATTLE",
    apiSlug: "feeder-cattle",
    aliases: ["gf", "gf1", "gf1!", "feeder"],
    cftcContractMarketCode: "061641",
    socrataCommodityName: "FEEDER CATTLE",
    socrataContractMarketName: "FEEDER CATTLE",
  },
  {
    futuresSymbol: "6M1!",
    displayName: "MEXICAN PESO",
    apiSlug: "mexican-peso",
    aliases: ["mxn", "6m", "6m1", "6m1!", "peso"],
    cftcContractMarketCode: "095741",
    socrataCommodityName: "MEXICAN PESO",
    socrataContractMarketName: "MEXICAN PESO",
  },
  {
    futuresSymbol: "BTC1!",
    displayName: "BITCOIN",
    apiSlug: "bitcoin",
    aliases: ["btc", "btc1", "btc1!"],
    cftcContractMarketCode: "133741",
    socrataCommodityName: "BITCOIN",
    socrataContractMarketName: "BITCOIN",
  },
  {
    futuresSymbol: "ETH1!",
    displayName: "ETHER CASH SETTLED",
    apiSlug: "ether",
    aliases: ["eth", "eth1", "eth1!", "ethereum"],
    cftcContractMarketCode: "146021",
    socrataCommodityName: "ETHEREUM (ETHER)",
    socrataContractMarketName: "ETHER CASH SETTLED",
  },
  {
    futuresSymbol: "VX1!",
    displayName: "VIX FUTURES",
    apiSlug: "vix",
    aliases: ["vx", "vx1", "vx1!", "vix-futures"],
    cftcContractMarketCode: "1170E1",
    socrataCommodityName: "VOLATILITY/VARIANCE INDEX",
    socrataContractMarketName: "VIX FUTURES",
  },
];

function escapeSoqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export function buildLegacyFuturesWhereClause(mapping: CotMarketMapping): string {
  const code = escapeSoqlString(mapping.cftcContractMarketCode);
  return `cftc_contract_market_code='${code}'`;
}

export function getCotMarketMapping(symbolOrSlug: string): CotMarketMapping | undefined {
  const raw = decodeURIComponent(symbolOrSlug).trim();
  const upper = raw.toUpperCase();
  const slug = raw.toLowerCase();

  return COT_MARKET_MAPPINGS.find((mapping) => {
    if (mapping.futuresSymbol.toUpperCase() === upper) return true;
    if (mapping.apiSlug.toLowerCase() === slug) return true;
    if (mapping.aliases?.some((a) => a.toLowerCase() === slug)) return true;
    if (mapping.displayName.toUpperCase() === upper) return true;
    if (mapping.cftcContractMarketCode === raw) return true;
    if (mapping.socrataCommodityName?.toUpperCase() === upper) return true;
    if (mapping.socrataContractMarketName?.toUpperCase() === upper) return true;
    return false;
  });
}
