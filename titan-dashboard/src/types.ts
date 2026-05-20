export type CotVerdict =
  | "A+ INSTITUTIONAL LONG"
  | "B LONG"
  | "WEAK LONG"
  | "NEUTRAL"
  | "WEAK SHORT"
  | "B SHORT"
  | "A+ INSTITUTIONAL SHORT";

export type CotHistoryPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

export type CotDashboardData = {
  market: string;
  futuresSymbol: string;
  cftcMarketName: string;
  /** Same as futuresSymbol; kept for older UI paths. */
  symbol: string;
  reportDate: string;
  commercials: {
    net: number;
    index26w: number;
    index52w: number;
    weeklyChange: number;
    delta4w: number;
    delta13w: number;
    bias: "bullish" | "bearish" | "neutral";
  };
  nonCommercials: {
    net: number;
    index26w: number;
    index52w: number;
    weeklyChange: number;
    delta4w: number;
    delta13w: number;
    divergence: "bullish" | "bearish" | "none";
  };
  retail: {
    net: number;
    index26w: number;
    index52w: number;
    weeklyChange: number;
    delta4w: number;
    delta13w: number;
    contrarianSignal: "bullish" | "bearish" | "none";
  };
  cotScore: number;
  cotVerdict: CotVerdict;
  marketPhase?: string;
  plainEnglishExplanation: string;
  history: CotHistoryPoint[];
  /** Unified score breakdown (from API or client recompute). */
  scoreComponents?: {
    commercialPositioning: number;
    commercialFlow: number;
    persistence: number;
    ncDivergence: number;
    retailContrarian: number;
    openInterest: number;
  };
};
