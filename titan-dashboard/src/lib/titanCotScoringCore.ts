/**
 * TITAN COT unified scoring — Legacy Futures Only.
 * Bias only, not execution. Shared logic for API + dashboard.
 *
 * Keep in sync: cot-data-module/src/titanCotScoringCore.ts
 */

export type CotVerdict =
  | "A+ INSTITUTIONAL LONG"
  | "B LONG"
  | "WEAK LONG"
  | "NEUTRAL"
  | "WEAK SHORT"
  | "B SHORT"
  | "A+ INSTITUTIONAL SHORT";

export type CommercialBias = "bullish" | "bearish" | "neutral";
export type InstitutionalDivergence = "bullish" | "bearish" | "none";
export type RetailContrarian = "bullish" | "bearish" | "none";

export type CotHistoryPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

export type OpenInterestSnapshot = {
  weeklyChange?: number;
  index26w?: number;
};

export type TitanCotScoringInput = {
  commercials: {
    index26w: number;
    index52w: number;
    weeklyChange: number;
    delta4w: number;
    delta13w: number;
    bias: CommercialBias;
  };
  nonCommercials: {
    weeklyChange: number;
    divergence: InstitutionalDivergence;
  };
  retail: {
    index26w: number;
    index52w: number;
    contrarianSignal: RetailContrarian;
  };
  history?: CotHistoryPoint[];
  openInterest?: OpenInterestSnapshot;
};

export type TitanCotScoringResult = {
  score: number;
  verdict: CotVerdict;
  marketPhase: string;
  components: {
    commercialPositioning: number;
    commercialFlow: number;
    persistence: number;
    ncDivergence: number;
    retailContrarian: number;
    openInterest: number;
  };
};

const IDX_HI = 80;
const IDX_LO = 20;
const BIAS_DISCLAIMER = "Bias only, not execution.";

export function calculateCotIndex(nets: number[], currentNet: number): number {
  if (nets.length === 0) return 50;
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (max === min) return 50;
  return Math.round(((currentNet - min) / (max - min)) * 10000) / 100;
}

export function clampScore(score: number): number {
  return Math.max(-100, Math.min(100, Math.round(score)));
}

export function scoreToCotVerdict(score: number): CotVerdict {
  const s = clampScore(score);
  if (s >= 85) return "A+ INSTITUTIONAL LONG";
  if (s >= 65) return "B LONG";
  if (s >= 40) return "WEAK LONG";
  if (s > -40 && s < 40) return "NEUTRAL";
  if (s <= -85) return "A+ INSTITUTIONAL SHORT";
  if (s <= -65) return "B SHORT";
  if (s <= -40) return "WEAK SHORT";
  return "NEUTRAL";
}

export function countCommercialExtremePersistence(
  history: CotHistoryPoint[] | undefined,
  side: "bull" | "bear",
): number {
  if (!history || history.length < 27) return 0;

  let streak = 0;
  for (let i = history.length - 1; i >= 26; i--) {
    const window = history.slice(i - 25, i + 1).map((h) => h.commercialNet);
    const idx = calculateCotIndex(window, window[window.length - 1]!);
    const inExtreme = side === "bull" ? idx > IDX_HI : idx < IDX_LO;
    if (inExtreme) streak += 1;
    else break;
  }
  return streak;
}

function persistencePoints(streak: number, sign: 1 | -1): number {
  if (streak <= 0) return 0;
  if (streak <= 2) return 4 * sign;
  if (streak <= 5) return 10 * sign;
  return 15 * sign;
}

function flowComponent(weekly: number, delta4w: number, delta13w: number): number {
  let s = 0;
  if (weekly > 0) s += 8;
  else if (weekly < 0) s -= 8;
  if (delta4w > 0) s += 6;
  else if (delta4w < 0) s -= 6;
  if (delta13w > 0) s += 6;
  else if (delta13w < 0) s -= 6;
  return s;
}

function openInterestComponent(
  oi: OpenInterestSnapshot | undefined,
  commercialWeekly: number,
): number {
  if (!oi?.weeklyChange) return 0;
  const oiUp = oi.weeklyChange > 0;
  const oiDown = oi.weeklyChange < 0;
  if (commercialWeekly > 0 && oiUp) return 7;
  if (commercialWeekly < 0 && oiDown) return -7;
  if (commercialWeekly > 0 && oiDown) return -3;
  if (commercialWeekly < 0 && oiUp) return 3;
  return 0;
}

export function deriveMarketPhase(input: TitanCotScoringInput, score: number): string {
  const c = input.commercials;
  const nc = input.nonCommercials;
  const bullPersist = countCommercialExtremePersistence(input.history, "bull");
  const bearPersist = countCommercialExtremePersistence(input.history, "bear");

  if (c.bias === "bullish" && bullPersist >= 4 && c.weeklyChange > 0) {
    return "Institutional accumulation phase — commercials extended long with sustained extreme persistence.";
  }
  if (c.bias === "bearish" && bearPersist >= 4 && c.weeklyChange < 0) {
    return "Institutional distribution phase — commercials extended short with sustained extreme persistence.";
  }
  if (c.bias === "bullish" && nc.divergence === "bullish") {
    return "Commercial long skew with bullish weekly flow divergence vs non-commercials.";
  }
  if (c.bias === "bearish" && nc.divergence === "bearish") {
    return "Commercial short skew with bearish weekly flow divergence vs non-commercials.";
  }
  if (score > -40 && score < 40) {
    return "Neutral / transition — commercials not in a clean dual-horizon extreme.";
  }
  if (score >= 40) {
    return "Long-bias positioning context — commercials leaning constructive on history.";
  }
  if (score <= -40) {
    return "Short-bias positioning context — commercials leaning defensive on history.";
  }
  return "Mixed institutional positioning — monitor flow and persistence.";
}

export function computeUnifiedCotScore(input: TitanCotScoringInput): TitanCotScoringResult {
  const c = input.commercials;
  const nc = input.nonCommercials;
  const r = input.retail;

  let commercialPositioning = 0;
  if (c.index26w > IDX_HI) commercialPositioning += 22;
  else if (c.index26w < IDX_LO) commercialPositioning -= 22;
  if (c.index52w > IDX_HI) commercialPositioning += 23;
  else if (c.index52w < IDX_LO) commercialPositioning -= 23;
  if (c.index26w > IDX_HI && c.index52w > IDX_HI) commercialPositioning += 5;
  if (c.index26w < IDX_LO && c.index52w < IDX_LO) commercialPositioning -= 5;

  const commercialFlow = flowComponent(c.weeklyChange, c.delta4w, c.delta13w);

  let persistence = 0;
  const bullStreak = countCommercialExtremePersistence(input.history, "bull");
  const bearStreak = countCommercialExtremePersistence(input.history, "bear");
  if (c.bias === "bullish" || (c.index26w > IDX_HI && c.index26w >= c.index52w - 10)) {
    persistence += persistencePoints(bullStreak, 1);
  } else if (c.bias === "bearish" || c.index26w < IDX_LO) {
    persistence += persistencePoints(bearStreak, -1);
  }

  let ncDivergence = 0;
  if (nc.divergence === "bullish") ncDivergence += 10;
  else if (nc.divergence === "bearish") ncDivergence -= 10;

  let retailContrarian = 0;
  if (r.contrarianSignal === "bullish") retailContrarian += 6;
  else if (r.contrarianSignal === "bearish") retailContrarian -= 6;
  else if (r.index26w < IDX_LO && c.bias === "bullish") retailContrarian += 4;
  else if (r.index26w > IDX_HI && c.bias === "bearish") retailContrarian -= 4;

  const openInterest = openInterestComponent(input.openInterest, c.weeklyChange);

  const raw =
    commercialPositioning +
    commercialFlow +
    persistence +
    ncDivergence +
    retailContrarian +
    openInterest;

  const score = clampScore(raw);
  const verdict = scoreToCotVerdict(score);
  const marketPhase = deriveMarketPhase(input, score);

  return {
    score,
    verdict,
    marketPhase,
    components: {
      commercialPositioning,
      commercialFlow,
      persistence,
      ncDivergence,
      retailContrarian,
      openInterest,
    },
  };
}

export function buildPlainEnglishExplanation(input: {
  marketLabel: string;
  futuresSymbol: string;
  reportDate: string;
  commercialBias: CommercialBias;
  retailContrarian: RetailContrarian;
  nonCommercialDivergence: InstitutionalDivergence;
  result: TitanCotScoringResult;
}): string {
  const { result } = input;
  const parts: string[] = [];

  parts.push(
    `${input.marketLabel} (${input.futuresSymbol}), CFTC Legacy Futures Only as of ${input.reportDate}. ` +
      `This is directional bias from positioning only — not a buy/sell entry signal. ${BIAS_DISCLAIMER} `,
  );

  parts.push(`${result.marketPhase} `);

  if (input.commercialBias === "bullish") {
    parts.push("Commercials show a strong long skew (26W and 52W indexes both above 80). ");
  } else if (input.commercialBias === "bearish") {
    parts.push("Commercials show a strong short skew (26W and 52W indexes both below 20). ");
  } else {
    parts.push("Commercials are not at a dual-horizon extreme (neutral / mixed bias). ");
  }

  if (input.retailContrarian === "bullish") {
    parts.push("Retail positioning offers mild bullish contrarian confirmation vs commercials. ");
  } else if (input.retailContrarian === "bearish") {
    parts.push("Retail positioning offers mild bearish contrarian confirmation vs commercials. ");
  }

  if (input.nonCommercialDivergence === "bullish") {
    parts.push("Non-commercial weekly flow diverges bullish vs commercials. ");
  } else if (input.nonCommercialDivergence === "bearish") {
    parts.push("Non-commercial weekly flow diverges bearish vs commercials. ");
  }

  if (result.components.openInterest !== 0) {
    parts.push("Open interest change aligns with the commercial flow read. ");
  } else {
    parts.push("Open interest confirmation is not applied (OI not in current Legacy feed). ");
  }

  parts.push(`TITAN COT score ${result.score} → ${result.verdict}. ${BIAS_DISCLAIMER}`);

  return parts.join("").trim();
}

export function buildInstitutionalNarrative(input: {
  market: string;
  futuresSymbol: string;
  reportDate: string;
  data: TitanCotScoringInput;
  result: TitanCotScoringResult;
}): string {
  const c = input.data.commercials;
  const nc = input.data.nonCommercials;
  const { result } = input;

  const head = `${input.market} (${input.futuresSymbol}) — CFTC Legacy Futures Only, report ${input.reportDate}. ${BIAS_DISCLAIMER} `;

  const phase = `Market phase: ${result.marketPhase} `;

  let comm = "";
  if (c.index26w > IDX_HI && c.index52w > IDX_HI) {
    comm = "Commercial positioning is the primary driver: dual-horizon extremes in the upper percentile band. ";
  } else if (c.index26w < IDX_LO && c.index52w < IDX_LO) {
    comm = "Commercial positioning is the primary driver: dual-horizon extremes in the lower percentile band. ";
  } else {
    comm = "Commercial positioning is mixed across 26W and 52W — bias is nuanced. ";
  }

  const flow =
    c.weeklyChange > 0
      ? `Commercial flow confirms with net +${c.weeklyChange.toLocaleString()} contracts (1W). `
      : c.weeklyChange < 0
        ? `Commercial flow confirms with net ${c.weeklyChange.toLocaleString()} contracts (1W). `
        : "Commercial flow is flat week-over-week. ";

  const persistWeeks = Math.max(
    countCommercialExtremePersistence(input.data.history, "bull"),
    countCommercialExtremePersistence(input.data.history, "bear"),
  );
  const persist =
    persistWeeks > 0
      ? `Persistence: commercials have held an extreme for ${persistWeeks} consecutive week(s) on rolling 26W measure. `
      : "Persistence: no extended multi-week commercial extreme streak detected. ";

  let div = "";
  if (nc.divergence === "bullish") {
    div = "Non-commercial divergence adds bullish confirmation on weekly flow. ";
  } else if (nc.divergence === "bearish") {
    div = "Non-commercial divergence adds bearish confirmation on weekly flow. ";
  }

  const tail = `Unified TITAN score ${result.score} → ${result.verdict}. ${BIAS_DISCLAIMER}`;

  return head + phase + comm + flow + persist + div + tail;
}

export function normalizeLegacyVerdict(verdict: string): CotVerdict {
  const map: Record<string, CotVerdict> = {
    "A+ LONG": "A+ INSTITUTIONAL LONG",
    "A+ LONG BIAS": "A+ INSTITUTIONAL LONG",
    "B LONG BIAS": "B LONG",
    "A+ SHORT": "A+ INSTITUTIONAL SHORT",
    "A+ SHORT BIAS": "A+ INSTITUTIONAL SHORT",
    "B SHORT BIAS": "B SHORT",
  };
  return (map[verdict] as CotVerdict | undefined) ?? (verdict as CotVerdict);
}
