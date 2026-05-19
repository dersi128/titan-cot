/**
 * TITAN COT Logic Engine — Legacy Futures Only.
 * Thin layer over titanCotScoringCore (unified API + dashboard scoring).
 */

export type {
  CommercialBias,
  CotVerdict,
  InstitutionalDivergence,
  RetailContrarian,
  TitanCotScoringInput,
  TitanCotScoringResult,
} from "./titanCotScoringCore.js";

export {
  buildInstitutionalNarrative,
  buildPlainEnglishExplanation,
  calculateCotIndex,
  clampScore,
  computeUnifiedCotScore,
  countCommercialExtremePersistence,
  deriveMarketPhase,
  normalizeLegacyVerdict,
  scoreToCotVerdict,
} from "./titanCotScoringCore.js";

import type { CommercialBias, InstitutionalDivergence, RetailContrarian } from "./titanCotScoringCore.js";
import {
  computeUnifiedCotScore,
  type TitanCotScoringInput,
} from "./titanCotScoringCore.js";

const IDX_HI = 80;
const IDX_LO = 20;

export type GroupIndexSnapshot = {
  net: number;
  index26w: number;
  index52w: number;
  weeklyChange: number;
  delta4w: number;
  delta13w: number;
};

/** @deprecated Use TitanCotScoringInput — kept for existing call sites. */
export type CotEngineInput = {
  commercials: GroupIndexSnapshot;
  nonCommercials: GroupIndexSnapshot;
  retail: GroupIndexSnapshot;
  commercialBias: CommercialBias;
  nonCommercialDivergence: InstitutionalDivergence;
};

export function getCommercialBias(index26w: number, index52w: number): CommercialBias {
  if (index26w > IDX_HI && index52w > IDX_HI) return "bullish";
  if (index26w < IDX_LO && index52w < IDX_LO) return "bearish";
  return "neutral";
}

export function getInstitutionalDivergence(
  commercialWeeklyChange: number,
  nonCommercialWeeklyChange: number,
): InstitutionalDivergence {
  if (commercialWeeklyChange > 0 && nonCommercialWeeklyChange < 0) return "bullish";
  if (commercialWeeklyChange < 0 && nonCommercialWeeklyChange > 0) return "bearish";
  return "none";
}

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

/** Unified score — wraps legacy CotEngineInput shape. */
export function computeCotScore(input: CotEngineInput): number {
  return computeUnifiedCotScore(engineInputToScoring(input)).score;
}

function engineInputToScoring(input: CotEngineInput): TitanCotScoringInput {
  return {
    commercials: {
      index26w: input.commercials.index26w,
      index52w: input.commercials.index52w,
      weeklyChange: input.commercials.weeklyChange,
      delta4w: input.commercials.delta4w,
      delta13w: input.commercials.delta13w,
      bias: input.commercialBias,
    },
    nonCommercials: {
      weeklyChange: input.nonCommercials.weeklyChange,
      divergence: input.nonCommercialDivergence,
    },
    retail: {
      index26w: input.retail.index26w,
      index52w: input.retail.index52w,
      contrarianSignal: getRetailContrarianSignal(
        input.commercialBias,
        input.retail.index26w,
        input.retail.index52w,
      ),
    },
  };
}
