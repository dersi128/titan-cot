/** FRED series used by the valuation engine. */

export const CPI_FRED: Record<string, string> = {
  USD: "CPIAUCSL",
  EUR: "CP0000EZ19M086NEST",
  GBP: "GBRCPIALLMINMEI",
  JPY: "JPNCPIALLMINMEI",
  AUD: "AUSCPIALLMINMEI",
  CAD: "CANCPIALLMINMEI",
  CHF: "CHECPIALLMINMEI",
  NZD: "NZLCPIALLMINMEI",
};

export const POLICY_FRED: Record<string, string> = {
  USD: "FEDFUNDS",
  EUR: "ECBDFR",
  GBP: "IRSTCI01GBM156N",
  JPY: "IRSTCI01JPM156N",
  AUD: "IRSTCI01AUM156N",
  CAD: "IRSTCI01CAM156N",
  CHF: "IRSTCI01CHM156N",
  NZD: "IRSTCI01NZM156N",
};

export const USD_REAL_YIELD_FRED = "DFII10";
export const USD_BROAD_INDEX_FRED = "DTWEXBGS";
export const WILSHIRE_FRED = "WILL5000PR";
export const GDP_FRED = "GDP";

export const VALUATION_FRED_IDS: string[] = [
  ...new Set([
    ...Object.values(CPI_FRED),
    ...Object.values(POLICY_FRED),
    USD_REAL_YIELD_FRED,
    USD_BROAD_INDEX_FRED,
    WILSHIRE_FRED,
    GDP_FRED,
  ]),
];
