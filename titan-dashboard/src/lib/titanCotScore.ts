import type { CotDashboardData } from "../types";
import {
  buildInstitutionalNarrative as buildInstitutionalNarrativeCore,
  computeUnifiedCotScore,
  scoreToCotVerdict,
  type CotVerdict,
  type TitanCotScoringInput,
  type TitanCotScoringResult,
} from "./titanCotScoringCore";

/** Unified verdict (same as API). */
export type TitanBiasVerdict = CotVerdict;

export type PositioningTrend = "accumulation" | "distribution" | "flat";

function dashboardToScoringInput(data: CotDashboardData): TitanCotScoringInput {
  return {
    commercials: {
      index26w: data.commercials.index26w,
      index52w: data.commercials.index52w,
      weeklyChange: data.commercials.weeklyChange,
      delta4w: data.commercials.delta4w,
      delta13w: data.commercials.delta13w,
      bias: data.commercials.bias,
    },
    nonCommercials: {
      index26w: data.nonCommercials.index26w,
      index52w: data.nonCommercials.index52w,
      weeklyChange: data.nonCommercials.weeklyChange,
      divergence: data.nonCommercials.divergence,
    },
    retail: {
      index26w: data.retail.index26w,
      index52w: data.retail.index52w,
      contrarianSignal: data.retail.contrarianSignal,
    },
    history: data.history,
  };
}

export function evaluateTitanCot(data: CotDashboardData): TitanCotScoringResult {
  return computeUnifiedCotScore(dashboardToScoringInput(data));
}

export function computeTitanDashboardScore(data: CotDashboardData): number {
  if (Number.isFinite(data.cotScore)) return data.cotScore;
  return evaluateTitanCot(data).score;
}

export function resolveTitanVerdict(data: CotDashboardData): TitanBiasVerdict {
  if (data.cotVerdict) return data.cotVerdict;
  return scoreToTitanBiasVerdict(computeTitanDashboardScore(data));
}

export function scoreToTitanBiasVerdict(score: number): TitanBiasVerdict {
  return scoreToCotVerdict(score);
}

export function commercialTrend(data: CotDashboardData): PositioningTrend {
  if (data.commercials.weeklyChange > 0) return "accumulation";
  if (data.commercials.weeklyChange < 0) return "distribution";
  return "flat";
}

export function buildInstitutionalNarrative(
  data: CotDashboardData,
  score: number,
  verdict: TitanBiasVerdict,
): string {
  const result = evaluateTitanCot(data);
  return buildInstitutionalNarrativeCore({
    market: data.market,
    futuresSymbol: data.futuresSymbol,
    reportDate: data.reportDate,
    data: dashboardToScoringInput(data),
    result: { ...result, score, verdict },
  });
}

export function verdictAccentClass(verdict: TitanBiasVerdict): string {
  if (verdict === "A+ INSTITUTIONAL LONG" || verdict === "B LONG") return "text-emerald-400/95";
  if (verdict === "WEAK LONG") return "text-emerald-300/75";
  if (verdict === "A+ INSTITUTIONAL SHORT" || verdict === "B SHORT") return "text-rose-400/95";
  if (verdict === "WEAK SHORT") return "text-rose-300/75";
  return "text-stone-400";
}

export function scoreHeatClass(score: number): string {
  if (score >= 65) return "text-emerald-400";
  if (score >= 40) return "text-emerald-300/85";
  if (score <= -65) return "text-rose-400";
  if (score <= -40) return "text-rose-300/85";
  return "text-stone-300";
}
