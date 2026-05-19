/**
 * TITAN COT Logic Engine — Legacy Futures Only.
 * Directional bias only; not entry timing.
 */

export type CommercialBias = "bullish" | "bearish" | "neutral";
/** Positioning-only: commercials vs non-commercials weekly flow. */
export type InstitutionalDivergence = "bullish" | "bearish" | "none";
export type RetailContrarian = "bullish" | "bearish" | "none";

export type CotVerdict = "A+ LONG" | "B LONG" | "NEUTRAL" | "B SHORT" | "A+ SHORT";

export type GroupIndexSnapshot = {
  net: number;
  index26w: number;
  index52w: number;
  weeklyChange: number;
  delta4w: number;
  delta13w: number;
};

export type CotEngineInput = {
  commercials: GroupIndexSnapshot;
  nonCommercials: GroupIndexSnapshot;
  retail: GroupIndexSnapshot;
  commercialBias: CommercialBias;
  nonCommercialDivergence: InstitutionalDivergence;
};

const IDX_HI = 80;
const IDX_LO = 20;
const IDX_MID_HI = 70;
const IDX_MID_LO = 30;

/** COT Index = (Current Net − Period Low) / (Period High − Period Low) × 100 */
export function calculateCotIndex(
  nets: number[],
  currentNet: number,
): number {
  if (nets.length === 0) return 50;
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  if (max === min) return 50;
  return Math.round(((currentNet - min) / (max - min)) * 10000) / 100;
}

export function getCommercialBias(index26w: number, index52w: number): CommercialBias {
  if (index26w > IDX_HI && index52w > IDX_HI) return "bullish";
  if (index26w < IDX_LO && index52w < IDX_LO) return "bearish";
  return "neutral";
}

/** No price: bullish if Δ commercial > 0 and Δ non-commercial < 0 (same week). */
export function getInstitutionalDivergence(
  commercialWeeklyChange: number,
  nonCommercialWeeklyChange: number,
): InstitutionalDivergence {
  if (commercialWeeklyChange > 0 && nonCommercialWeeklyChange < 0) return "bullish";
  if (commercialWeeklyChange < 0 && nonCommercialWeeklyChange > 0) return "bearish";
  return "none";
}

/**
 * Retail contrarian confirmation vs strong commercial skew.
 * Aligned retail + commercials → none (weaker / no contrarian confirmation).
 */
export function getRetailContrarianSignal(
  commercialBias: CommercialBias,
  retailIndex26w: number,
  retailIndex52w: number,
): RetailContrarian {
  const retailLow = retailIndex26w < IDX_LO && retailIndex52w < IDX_LO;
  const retailHigh = retailIndex26w > IDX_HI && retailIndex52w > IDX_HI;

  if (commercialBias === "bullish" && retailLow) return "bullish";
  if (commercialBias === "bearish" && retailHigh) return "bearish";
  return "none";
}

export function computeCotScore(input: CotEngineInput): number {
  const c = input.commercials;
  const nc = input.nonCommercials;
  const r = input.retail;

  let score = 0;

  const i26 = c.index26w;
  const i52 = c.index52w;

  if (i26 > IDX_HI && i52 > IDX_HI) score += 35;
  else if (i26 > IDX_MID_HI && i52 > IDX_MID_HI) score += 20;

  if (i26 < IDX_LO && i52 < IDX_LO) score -= 35;
  else if (i26 < IDX_MID_LO && i52 < IDX_MID_LO) score -= 20;

  if (input.commercialBias === "bullish" && r.index26w < IDX_LO && r.index52w < IDX_LO) {
    score += 15;
  }

  if (input.commercialBias === "bearish" && r.index26w > IDX_HI && r.index52w > IDX_HI) {
    score -= 15;
  }

  if (c.weeklyChange > 0) score += 10;
  else if (c.weeklyChange < 0) score -= 10;

  if (c.delta4w > 0) score += 10;
  else if (c.delta4w < 0) score -= 10;

  if (c.delta13w > 0) score += 10;
  else if (c.delta13w < 0) score -= 10;

  if (input.nonCommercialDivergence === "bullish") score += 10;
  else if (input.nonCommercialDivergence === "bearish") score -= 10;

  return Math.max(-100, Math.min(100, score));
}

export function scoreToCotVerdict(score: number): CotVerdict {
  if (score >= 80) return "A+ LONG";
  if (score >= 60) return "B LONG";
  if (score <= -80) return "A+ SHORT";
  if (score <= -60) return "B SHORT";
  return "NEUTRAL";
}

export function buildPlainEnglishExplanation(input: {
  marketLabel: string;
  futuresSymbol: string;
  reportDate: string;
  commercialBias: CommercialBias;
  retailContrarian: RetailContrarian;
  nonCommercialDivergence: InstitutionalDivergence;
  cotScore: number;
  cotVerdict: CotVerdict;
}): string {
  const parts: string[] = [];

  parts.push(
    `${input.marketLabel} (${input.futuresSymbol}), CFTC Legacy Futures Only as of ${input.reportDate}. ` +
      "This is directional bias from positioning only — not a buy/sell entry signal.",
  );

  if (input.commercialBias === "bullish") {
    parts.push("Commercials show a strong bullish skew (26W and 52W indexes both above 80). ");
  } else if (input.commercialBias === "bearish") {
    parts.push("Commercials show a strong bearish skew (26W and 52W indexes both below 20). ");
  } else {
    parts.push(
      "Commercials are not at an extreme: 26W/52W indexes sit between the 20 and 80 zones (neutral / weak bias). ",
    );
  }

  if (input.retailContrarian === "bullish") {
    parts.push(
      "Retail (non-reportable) is stretched the other way vs strong commercial bulls — classic bullish contrarian confirmation. ",
    );
  } else if (input.retailContrarian === "bearish") {
    parts.push(
      "Retail is stretched the other way vs strong commercial bears — bearish contrarian confirmation. ",
    );
  } else {
    parts.push(
      "Retail is not giving a clean contrarian extreme versus commercials (aligned or mid-range — typically a weaker contrarian read). ",
    );
  }

  if (input.nonCommercialDivergence === "bullish") {
    parts.push(
      "Non-commercials diverge in a bullish institutional way (commercial net up vs non-commercial net down this week). ",
    );
  } else if (input.nonCommercialDivergence === "bearish") {
    parts.push(
      "Non-commercials diverge in a bearish institutional way (commercial net down vs non-commercial net up this week). ",
    );
  } else {
    parts.push("Non-commercials show no clear weekly positioning divergence vs commercials. ");
  }

  parts.push(
    `TITAN COT score ${input.cotScore} maps to ${input.cotVerdict} — use only as context for bias, not execution.`,
  );

  return parts.join("").trim();
}
