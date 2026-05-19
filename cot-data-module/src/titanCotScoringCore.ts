/**
 * TITAN COT unified scoring — Legacy Futures Only.
 * Swing institutional positioning · 26W-driven (no 52W in score).
 * Bias only, not execution.
 *
 * Keep in sync: titan-dashboard/src/lib/titanCotScoringCore.ts
 */

export type CotVerdict =
  | "A+ INSTITUTIONAL LONG"
  | "B LONG"
  | "WEAK LONG"
  | "NEUTRAL"
  | "WEAK SHORT"
  | "B SHORT"
  | "A+ INSTITUTIONAL SHORT";

export type MarketPhase =
  | "Accumulation"
  | "Distribution"
  | "Bullish Exhaustion"
  | "Bearish Exhaustion"
  | "Crowded Long"
  | "Crowded Short"
  | "Neutral";

export type CommercialPositioningLabel =
  | "Extreme Long"
  | "Strong Bullish"
  | "Bullish"
  | "Neutral"
  | "Bearish"
  | "Strong Bearish"
  | "Extreme Short";

export type FlowLabel =
  | "Strong Accumulation"
  | "Accumulation"
  | "Flat"
  | "Distribution"
  | "Aggressive Distribution";

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
  /** Week-over-week change in open interest (contracts). */
  weeklyChange?: number;
  /** 4-week change in open interest — used for OI confirmation. */
  delta4w?: number;
};

export type TitanCotScoringInput = {
  commercials: {
    index26w: number;
    /** Retained for API/UI display only — not used in score. */
    index52w?: number;
    weeklyChange: number;
    delta4w: number;
    delta13w: number;
    bias?: CommercialBias;
  };
  nonCommercials: {
    index26w: number;
    index52w?: number;
    weeklyChange: number;
    divergence?: InstitutionalDivergence;
  };
  retail: {
    index26w: number;
    index52w?: number;
    contrarianSignal?: RetailContrarian;
  };
  history?: CotHistoryPoint[];
  openInterest?: OpenInterestSnapshot;
};

export type TitanCotScoringResult = {
  score: number;
  verdict: CotVerdict;
  marketPhase: MarketPhase;
  commercialPositioningLabel: CommercialPositioningLabel;
  flowLabel: FlowLabel;
  persistenceWeeks: number;
  persistenceSide: "bull" | "bear" | "none";
  components: {
    commercialPositioning: number;
    commercialFlow: number;
    persistence: number;
    ncDivergence: number;
    retailContrarian: number;
    openInterest: number;
  };
};

const BIAS_DISCLAIMER = "Bias only, not execution.";
const PERSIST_BULL_THRESHOLD = 80;
const PERSIST_BEAR_THRESHOLD = 20;

function safeNum(n: number | undefined | null): number {
  if (n === undefined || n === null || Number.isNaN(n)) return 0;
  return n;
}

export function calculateCotIndex(nets: number[], currentNet: number): number {
  if (nets.length === 0) return 50;
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (max === min) return 50;
  return Math.round(((currentNet - min) / (max - min)) * 10000) / 100;
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
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

/** Commercial 26W positioning score and label (no 52W). */
export function commercialPositioningScore(index26w: number): {
  points: number;
  label: CommercialPositioningLabel;
} {
  const idx = safeNum(index26w);

  if (idx > 90) return { points: 45, label: "Extreme Long" };
  if (idx > 75) return { points: 30, label: "Strong Bullish" };
  if (idx > 60) return { points: 15, label: "Bullish" };
  if (idx >= 40 && idx <= 60) return { points: 0, label: "Neutral" };
  if (idx < 10) return { points: -45, label: "Extreme Short" };
  if (idx < 25) return { points: -30, label: "Strong Bearish" };
  if (idx < 40) return { points: -15, label: "Bearish" };
  return { points: 0, label: "Neutral" };
}

export function commercialFlowScore(
  weeklyChange: number,
  delta4w: number,
  delta13w: number,
): { points: number; label: FlowLabel } {
  const d1 = safeNum(weeklyChange);
  const d4 = safeNum(delta4w);
  const d13 = safeNum(delta13w);

  let points = 0;
  if (d1 > 0) points += 5;
  else if (d1 < 0) points -= 5;
  if (d4 > 0) points += 7;
  else if (d4 < 0) points -= 7;
  if (d13 > 0) points += 8;
  else if (d13 < 0) points -= 8;

  let label: FlowLabel = "Flat";
  if (d13 > 0 && d4 > 0 && d1 > 0) label = "Strong Accumulation";
  else if (d13 > 0 || d4 > 0) label = "Accumulation";
  else if (d13 < 0 && d4 < 0 && d1 < 0) label = "Aggressive Distribution";
  else if (d13 < 0 || d4 < 0) label = "Distribution";

  return { points, label };
}

/** Consecutive weeks with commercial 26W > 80 (bull) or < 20 (bear). */
export function countCommercialExtremePersistence(
  history: CotHistoryPoint[] | undefined,
  side: "bull" | "bear",
): number {
  if (!history || history.length < 27) return 0;

  let streak = 0;
  for (let i = history.length - 1; i >= 26; i--) {
    const window = history.slice(i - 25, i + 1).map((h) => h.commercialNet);
    const idx = calculateCotIndex(window, window[window.length - 1]!);
    const inExtreme =
      side === "bull" ? idx > PERSIST_BULL_THRESHOLD : idx < PERSIST_BEAR_THRESHOLD;
    if (inExtreme) streak += 1;
    else break;
  }
  return streak;
}

function persistenceScore(
  history: CotHistoryPoint[] | undefined,
  index26w: number,
): { points: number; weeks: number; side: "bull" | "bear" | "none" } {
  const idx = safeNum(index26w);
  const bullWeeks = countCommercialExtremePersistence(history, "bull");
  const bearWeeks = countCommercialExtremePersistence(history, "bear");

  if (idx > PERSIST_BULL_THRESHOLD && bullWeeks > 0) {
    if (bullWeeks <= 2) return { points: 3, weeks: bullWeeks, side: "bull" };
    if (bullWeeks <= 6) return { points: 7, weeks: bullWeeks, side: "bull" };
    return { points: 15, weeks: bullWeeks, side: "bull" };
  }

  if (idx < PERSIST_BEAR_THRESHOLD && bearWeeks > 0) {
    if (bearWeeks <= 2) return { points: -3, weeks: bearWeeks, side: "bear" };
    if (bearWeeks <= 6) return { points: -7, weeks: bearWeeks, side: "bear" };
    return { points: -15, weeks: bearWeeks, side: "bear" };
  }

  return { points: 0, weeks: 0, side: "none" };
}

function ncDivergenceScore(commercialWeekly: number, ncWeekly: number): number {
  const c = safeNum(commercialWeekly);
  const n = safeNum(ncWeekly);
  if (c > 0 && n < 0) return 10;
  if (c < 0 && n > 0) return -10;
  return 0;
}

function retailContrarianScore(commercial26w: number, retail26w: number): number {
  const c = safeNum(commercial26w);
  const r = safeNum(retail26w);
  if (c > 70 && r < 20) return 5;
  if (c < 30 && r > 80) return -5;
  return 0;
}

function openInterestScore(commercialDelta4w: number, oi?: OpenInterestSnapshot): number {
  const c4 = safeNum(commercialDelta4w);
  const oi4 = safeNum(oi?.delta4w ?? oi?.weeklyChange);
  if (oi4 === 0 && oi?.delta4w === undefined && oi?.weeklyChange === undefined) return 0;

  if (c4 > 0 && oi4 > 0) return 5;
  if (c4 < 0 && oi4 > 0) return -5;
  if (c4 > 0 && oi4 < 0) return -2;
  if (c4 < 0 && oi4 < 0) return 2;
  return 0;
}

export function deriveMarketPhase(input: TitanCotScoringInput): MarketPhase {
  const c = input.commercials;
  const nc = input.nonCommercials;
  const r = input.retail;

  const c26 = safeNum(c.index26w);
  const nc26 = safeNum(nc.index26w);
  const r26 = safeNum(r.index26w);
  const d1 = safeNum(c.weeklyChange);
  const d4 = safeNum(c.delta4w);
  const d13 = safeNum(c.delta13w);

  if (nc26 > 80 && r26 > 80 && c26 < 30) return "Crowded Long";
  if (nc26 < 20 && r26 < 20 && c26 > 70) return "Crowded Short";

  if (c26 > 85 && d1 < 0) return "Bullish Exhaustion";
  if (c26 < 15 && d1 > 0) return "Bearish Exhaustion";

  if (c26 > 60 && d4 > 0 && d13 > 0) return "Accumulation";
  if (c26 < 40 && d4 < 0 && d13 < 0) return "Distribution";

  return "Neutral";
}

function hasInsufficientData(input: TitanCotScoringInput): boolean {
  const c26 = input.commercials.index26w;
  return c26 === undefined || c26 === null || Number.isNaN(c26);
}

export function computeUnifiedCotScore(input: TitanCotScoringInput): TitanCotScoringResult {
  if (hasInsufficientData(input)) {
    return {
      score: 0,
      verdict: "NEUTRAL",
      marketPhase: "Neutral",
      commercialPositioningLabel: "Neutral",
      flowLabel: "Flat",
      persistenceWeeks: 0,
      persistenceSide: "none",
      components: {
        commercialPositioning: 0,
        commercialFlow: 0,
        persistence: 0,
        ncDivergence: 0,
        retailContrarian: 0,
        openInterest: 0,
      },
    };
  }

  const positioning = commercialPositioningScore(input.commercials.index26w);
  const flow = commercialFlowScore(
    input.commercials.weeklyChange,
    input.commercials.delta4w,
    input.commercials.delta13w,
  );
  const persist = persistenceScore(input.history, input.commercials.index26w);
  const ncDiv = ncDivergenceScore(
    input.commercials.weeklyChange,
    input.nonCommercials.weeklyChange,
  );
  const retail = retailContrarianScore(input.commercials.index26w, input.retail.index26w);
  const oi = openInterestScore(input.commercials.delta4w, input.openInterest);

  const raw =
    positioning.points + flow.points + persist.points + ncDiv + retail + oi;

  const score = clampScore(raw);
  const verdict = scoreToCotVerdict(score);
  const marketPhase = deriveMarketPhase(input);

  return {
    score,
    verdict,
    marketPhase,
    commercialPositioningLabel: positioning.label,
    flowLabel: flow.label,
    persistenceWeeks: persist.weeks,
    persistenceSide: persist.side,
    components: {
      commercialPositioning: positioning.points,
      commercialFlow: flow.points,
      persistence: persist.points,
      ncDivergence: ncDiv,
      retailContrarian: retail,
      openInterest: oi,
    },
  };
}

function persistenceNarrative(weeks: number, side: "bull" | "bear" | "none"): string {
  if (weeks <= 0 || side === "none") {
    return "Persistence is limited — commercials have not held a sustained 26W extreme.";
  }
  const dir = side === "bull" ? "bullish" : "bearish";
  return `Commercials have remained in extreme ${dir} positioning for ${weeks} consecutive weeks.`;
}

export function buildPlainEnglishExplanation(input: {
  marketLabel: string;
  futuresSymbol: string;
  reportDate: string;
  result: TitanCotScoringResult;
}): string {
  const { result } = input;

  return [
    `${input.marketLabel} (${input.futuresSymbol}), CFTC Legacy Futures Only as of ${input.reportDate}. `,
    `Institutional positioning read (26W-led, no 52W in score): ${result.commercialPositioningLabel}. `,
    `Flow: ${result.flowLabel}. `,
    persistenceNarrative(result.persistenceWeeks, result.persistenceSide),
    ` Market phase: ${result.marketPhase}. `,
    `TITAN score ${result.score} → ${result.verdict}. ${BIAS_DISCLAIMER}`,
  ].join("");
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

  const ncDiv = ncDivergenceScore(c.weeklyChange, nc.weeklyChange);

  let div = "";
  if (ncDiv > 0) {
    div =
      "Weekly institutional divergence favors the long side — commercials added net exposure while non-commercials reduced. ";
  } else if (ncDiv < 0) {
    div =
      "Weekly institutional divergence favors the short side — commercials reduced net exposure while non-commercials added. ";
  } else {
    div = "Non-commercial flow is not diverging materially from commercials on a weekly basis. ";
  }

  const positioning =
    result.commercialPositioningLabel === "Extreme Long" ||
    result.commercialPositioningLabel === "Extreme Short"
      ? `Commercial positioning remains in ${result.commercialPositioningLabel.toLowerCase()} territory on the 26-week window. `
      : `Commercial positioning reads ${result.commercialPositioningLabel} on the 26-week window. `;

  const flow =
    result.flowLabel === "Aggressive Distribution"
      ? "Flow confirms aggressive institutional distribution across 1W, 4W, and 13W deltas. "
      : result.flowLabel === "Strong Accumulation"
        ? "Flow confirms strong accumulation across 1W, 4W, and 13W deltas. "
        : `Flow is classified as ${result.flowLabel}. `;

  const persist = `${persistenceNarrative(result.persistenceWeeks, result.persistenceSide)} `;

  const phase = `Market phase: ${result.marketPhase}. `;

  const tail = `Composite score ${result.score} → ${result.verdict}. ${BIAS_DISCLAIMER}`;

  return `${input.market} (${input.futuresSymbol}) — ${positioning}${flow}${persist}${div}${phase}${tail}`;
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
