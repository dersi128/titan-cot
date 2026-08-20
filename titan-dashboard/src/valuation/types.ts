/** Cross-asset valuation types — statistical + macro fair-value overlay. */

export type ValuationAssetClass = "forex" | "metal" | "commodity" | "equity";

export type ValuationModel = "fx" | "usd_index" | "metal" | "commodity" | "equity";

export type ValuationConfidence = "LOW" | "MEDIUM" | "HIGH";

export type ValuationVerdict =
  | "EXTREME UNDERVALUED"
  | "UNDERVALUED"
  | "SLIGHTLY CHEAP"
  | "FAIR"
  | "SLIGHTLY RICH"
  | "OVERVALUED"
  | "EXTREME OVERVALUED";

export type ValuationComponentId =
  | "statistical"
  | "ppp"
  | "rateDiff"
  | "realPrice"
  | "macroModel"
  | "usd"
  | "buffett"
  | "trend";

export type DatedValue = {
  date: string;
  value: number;
};

export type ValuationMarket = {
  id: string;
  label: string;
  subtitle: string;
  assetClass: ValuationAssetClass;
  model: ValuationModel;
  /** Yahoo ticker or Titan alias resolved by `resolveYahooTicker`. */
  yahooSymbol: string;
  /** ISO currency of the FX base (price of 1 base in quote). */
  baseCcy?: string;
  quoteCcy?: string;
};

export type ValuationComponent = {
  id: ValuationComponentId;
  score: number;
  weight: number;
  available: boolean;
  label: string;
};

export type ValuationHistoryPoint = {
  date: string;
  price: number;
  fairValue: number | null;
  score: number | null;
};

export type ValuationSnapshot = {
  marketId: string;
  label: string;
  subtitle: string;
  assetClass: ValuationAssetClass;
  model: ValuationModel;
  asOf: string;
  price: number;
  fairValue: number | null;
  gapPct: number | null;
  score: number;
  verdict: ValuationVerdict;
  confidence: ValuationConfidence;
  components: ValuationComponent[];
  inputsUsed: string[];
  history: ValuationHistoryPoint[];
};

export type ValuationInput = {
  market: ValuationMarket;
  price: DatedValue[];
  cpiByCcy?: Partial<Record<string, DatedValue[]>>;
  policyByCcy?: Partial<Record<string, DatedValue[]>>;
  usdRealYield?: DatedValue[];
  usdIndex?: DatedValue[];
  equityBuffett?: DatedValue[];
  asOf?: string;
  withHistory?: boolean;
};

export type ValuationUniverseRow = {
  marketId: string;
  label: string;
  assetClass: ValuationAssetClass;
  asOf: string;
  price: number;
  fairValue: number | null;
  gapPct: number | null;
  score: number;
  verdict: ValuationVerdict;
  confidence: ValuationConfidence;
};
