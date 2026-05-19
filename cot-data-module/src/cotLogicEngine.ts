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

/** 26W-only bias label (52W ignored — display field only). */
export function getCommercialBias(index26w: number, _index52w?: number): CommercialBias {
  if (index26w > IDX_HI) return "bullish";
  if (index26w < IDX_LO) return "bearish";
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
  _retailIndex52w?: number,
): RetailContrarian {
  if (commercialBias === "bullish" && retailIndex26w < IDX_LO) return "bullish";
  if (commercialBias === "bearish" && retailIndex26w > IDX_HI) return "bearish";
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
      index26w: input.nonCommercials.index26w,
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
