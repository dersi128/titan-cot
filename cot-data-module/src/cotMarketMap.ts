export type CotMarketMapping = {
  futuresSymbol: string;
  /** User-facing label in API JSON (`market`) / UI */
  displayName: string;
  apiSlug: string;
  /** Path aliases, e.g. `/api/cot/nq` → NQ1! */
  aliases?: readonly string[];
  /**
   * Exact `commodity_name` + `contract_market_name` in Legacy Futures Only (`6dca-aqww`).
   * Omit when using `cftcContractMarketCode` only (e.g. Nasdaq).
   */
  socrataCommodityName?: string;
  socrataContractMarketName?: string;
  /**
   * When set, `$where` is **only** `cftc_contract_market_code='…'` (no commodity/contract filter).
   */
  cftcContractMarketCode?: string;
};

/**
 * Futures roots map to Legacy Futures Only rows. Use `cftcContractMarketCode` when CFTC
 * names are unstable (e.g. Nasdaq); otherwise use the Socrata name pair.
 */
export const COT_MARKET_MAPPINGS: CotMarketMapping[] = [
  {
    futuresSymbol: "GC1!",
    displayName: "GOLD",
    apiSlug: "gold",
    socrataCommodityName: "GOLD",
    socrataContractMarketName: "GOLD",
  },
  {
    futuresSymbol: "SI1!",
    displayName: "SILVER",
    apiSlug: "silver",
    socrataCommodityName: "SILVER",
    socrataContractMarketName: "SILVER",
  },
  {
    futuresSymbol: "HG1!",
    displayName: "COPPER-GRADE #1",
    apiSlug: "copper",
    socrataCommodityName: "COPPER",
    socrataContractMarketName: "COPPER- #1",
  },
  {
    futuresSymbol: "CL1!",
    displayName: "CRUDE OIL, LIGHT SWEET",
    apiSlug: "crude-oil",
    socrataCommodityName: "CRUDE OIL",
    socrataContractMarketName: "CRUDE OIL, LIGHT SWEET-WTI",
  },
  {
    futuresSymbol: "NG1!",
    displayName: "NATURAL GAS (HENRY HUB)",
    apiSlug: "natural-gas",
    socrataCommodityName: "NATURAL GAS",
    socrataContractMarketName: "HENRY HUB",
  },
  {
    futuresSymbol: "ZW1!",
    displayName: "WHEAT SRW (CBOT)",
    apiSlug: "wheat-srw",
    socrataCommodityName: "WHEAT",
    socrataContractMarketName: "WHEAT-SRW",
  },
  {
    futuresSymbol: "NQ1!",
    displayName: "E-MINI NASDAQ-100",
    apiSlug: "nasdaq",
    aliases: ["nq", "nq1", "nq1!", "nas100", "nas-100", "nasdaq100", "ndx"],
    cftcContractMarketCode: "209742",
  },
  {
    futuresSymbol: "ES1!",
    displayName: "E-MINI S&P 500",
    apiSlug: "sp500",
    aliases: ["es", "es1", "es1!", "sp-500", "sp500", "s&p500"],
    socrataCommodityName: "S&P BROAD BASED STOCK INDICES",
    socrataContractMarketName: "E-MINI S&P 500",
  },
  {
    futuresSymbol: "YM1!",
    displayName: "E-MINI DOW ($5)",
    apiSlug: "e-mini-dow",
    socrataCommodityName: "DOW JONES BROAD BASED INDICES",
    socrataContractMarketName: "DJIA x $5",
  },
  {
    futuresSymbol: "RTY1!",
    displayName: "E-MINI RUSSELL 2000",
    apiSlug: "russell-2000",
    socrataCommodityName: "RUSSELL INDEX",
    socrataContractMarketName: "RUSSELL E-MINI",
  },
  {
    futuresSymbol: "DX1!",
    displayName: "U.S. DOLLAR INDEX",
    apiSlug: "usd-index",
    socrataCommodityName: "U.S. DOLLAR INDEX",
    socrataContractMarketName: "USD INDEX",
  },
  {
    futuresSymbol: "6J1!",
    displayName: "JAPANESE YEN",
    apiSlug: "japanese-yen",
    socrataCommodityName: "JAPANESE YEN",
    socrataContractMarketName: "JAPANESE YEN",
  },
  {
    futuresSymbol: "6E1!",
    displayName: "EURO FX",
    apiSlug: "euro-fx",
    socrataCommodityName: "EUROPEAN CURRENCY UNIT",
    socrataContractMarketName: "EURO FX",
  },
  {
    futuresSymbol: "6B1!",
    displayName: "BRITISH POUND",
    apiSlug: "british-pound",
    socrataCommodityName: "POUND STERLING",
    socrataContractMarketName: "BRITISH POUND",
  },
  {
    futuresSymbol: "6A1!",
    displayName: "AUSTRALIAN DOLLAR",
    apiSlug: "australian-dollar",
    socrataCommodityName: "AUSTRALIAN DOLLAR",
    socrataContractMarketName: "AUSTRALIAN DOLLAR",
  },
  {
    futuresSymbol: "6C1!",
    displayName: "CANADIAN DOLLAR",
    apiSlug: "canadian-dollar",
    socrataCommodityName: "CANADIAN DOLLAR",
    socrataContractMarketName: "CANADIAN DOLLAR",
  },
  {
    futuresSymbol: "6S1!",
    displayName: "SWISS FRANC",
    apiSlug: "swiss-franc",
    cftcContractMarketCode: "092741",
  },
  {
    futuresSymbol: "CC1!",
    displayName: "COCOA",
    apiSlug: "cocoa",
    socrataCommodityName: "COCOA",
    socrataContractMarketName: "COCOA",
  },
  {
    futuresSymbol: "SB1!",
    displayName: "SUGAR NO. 11",
    apiSlug: "sugar",
    socrataCommodityName: "SUGAR",
    socrataContractMarketName: "SUGAR NO. 11",
  },
  {
    futuresSymbol: "PL1!",
    displayName: "PLATINUM",
    apiSlug: "platinum",
    cftcContractMarketCode: "076651",
  },
  {
    futuresSymbol: "PA1!",
    displayName: "PALLADIUM",
    apiSlug: "palladium",
    cftcContractMarketCode: "075651",
  },
  {
    futuresSymbol: "ZC1!",
    displayName: "CORN",
    apiSlug: "corn",
    cftcContractMarketCode: "002602",
  },
  {
    futuresSymbol: "ZS1!",
    displayName: "SOYBEANS",
    apiSlug: "soybeans",
    cftcContractMarketCode: "005602",
  },
  {
    futuresSymbol: "KC1!",
    displayName: "COFFEE C",
    apiSlug: "coffee",
    cftcContractMarketCode: "083731",
  },
  {
    futuresSymbol: "CT1!",
    displayName: "COTTON NO. 2",
    apiSlug: "cotton",
    cftcContractMarketCode: "033661",
  },
  {
    futuresSymbol: "LE1!",
    displayName: "LIVE CATTLE",
    apiSlug: "live-cattle",
    cftcContractMarketCode: "057642",
  },
  {
    futuresSymbol: "HE1!",
    displayName: "LEAN HOGS",
    apiSlug: "lean-hogs",
    cftcContractMarketCode: "054642",
  },
];

function escapeSoqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export function buildLegacyFuturesWhereClause(mapping: CotMarketMapping): string {
  if (mapping.cftcContractMarketCode) {
    const code = escapeSoqlString(mapping.cftcContractMarketCode);
    return `cftc_contract_market_code='${code}'`;
  }

  const commodity = mapping.socrataCommodityName;
  const contract = mapping.socrataContractMarketName;
  if (!commodity || !contract) {
    throw new Error(`Missing Socrata commodity/contract for ${mapping.displayName}.`);
  }

  return `commodity_name = '${escapeSoqlString(commodity)}' AND contract_market_name = '${escapeSoqlString(contract)}'`;
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
    if (mapping.socrataCommodityName?.toUpperCase() === upper) return true;
    if (mapping.socrataContractMarketName?.toUpperCase() === upper) return true;
    return false;
  });
}
