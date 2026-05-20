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

export type { TitanCotScoringResult } from "./titanCotScoringCore";

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

/**
 * Single source of truth: score + verdict + components from COT fields
 * via the same logic as the API (titanCotScoringCore).
 */
export function evaluateTitanCot(data: CotDashboardData): TitanCotScoringResult {
  return computeUnifiedCotScore(dashboardToScoringInput(data));
}

/** Reconcile API payload so score, verdict, and breakdown always match. */
export function normalizeCotDashboardData(data: CotDashboardData): CotDashboardData {
  try {
    const read = evaluateTitanCot(data);
    return {
      ...data,
      cotScore: read.score,
      cotVerdict: read.verdict,
      marketPhase: read.market_regime,
      scoreComponents: read.components,
    };
  } catch (err) {
    console.error("[TITAN] normalizeCotDashboardData failed", err);
    return data;
  }
}

export function getTitanCotRead(data: CotDashboardData): TitanCotScoringResult {
  return evaluateTitanCot(data);
}

export function computeTitanDashboardScore(data: CotDashboardData): number {
  return getTitanCotRead(data).score;
}

export function resolveTitanVerdict(data: CotDashboardData): TitanBiasVerdict {
  return getTitanCotRead(data).verdict;
}

export function scoreToTitanBiasVerdict(score: number): TitanBiasVerdict {
  return scoreToCotVerdict(score);
}

export function commercialTrend(data: CotDashboardData): PositioningTrend {
  const w = data.commercials?.weeklyChange;
  if (w === undefined || !Number.isFinite(w)) return "flat";
  if (w > 0) return "accumulation";
  if (w < 0) return "distribution";
  return "flat";
}

export function buildInstitutionalNarrative(
  data: CotDashboardData,
  score: number,
  verdict: TitanBiasVerdict,
): string {
  const result = getTitanCotRead(data);
  return buildInstitutionalNarrativeCore({
    market: data.market,
    futuresSymbol: data.futuresSymbol,
    reportDate: data.reportDate,
    data: dashboardToScoringInput(data),
    result: { ...result, score, verdict },
  });
}

export function verdictAccentClass(verdict: TitanBiasVerdict): string {
  if (verdict === "A+ EXTREME LONG" || verdict === "A STRONG LONG") return "text-emerald-400/95";
  if (verdict === "B LONG") return "text-emerald-400/90";
  if (verdict === "WEAK LONG") return "text-emerald-300/75";
  if (verdict === "A+ EXTREME SHORT" || verdict === "A STRONG SHORT") return "text-rose-400/95";
  if (verdict === "B SHORT") return "text-rose-400/90";
  if (verdict === "WEAK SHORT") return "text-rose-300/75";
  return "text-stone-400";
}

export function scoreHeatClass(score: number): string {
  if (score >= 65) return "titan-score-glow-bull";
  if (score >= 40) return "text-titan-bull/90";
  if (score <= -65) return "titan-score-glow-bear";
  if (score <= -40) return "text-titan-bear/90";
  return "text-titan-text";
}

export function scoreRowAccentClass(score: number): string {
  if (score >= 75) return "titan-scanner-row--strong-bull";
  if (score <= -75) return "titan-scanner-row--strong-bear";
  return "";
}
