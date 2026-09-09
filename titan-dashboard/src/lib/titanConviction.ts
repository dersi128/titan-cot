import type { CotDashboardData } from "../types";
import {
  buildDeltaFlow,
  evaluateTitanPositioning,
  type MarketRegimeId,
} from "./titanCommercialIndex";
import { IDX_HI, IDX_LO } from "./titanCotScoringCore";
import { horizonDeltas, horizonFlowTone } from "../components/titan/deltaFlowHorizon";

export const CONVICTION_MAX = 5;
export type ConvictionRead = { level: number; max: typeof CONVICTION_MAX };

export function regimeConfirmsBias(score: number, regime: MarketRegimeId): boolean {
  if (score >= 20) return regime === "accumulation" || regime === "trending";
  if (score <= -20) return regime === "distribution" || regime === "trending";
  return false;
}

function deltaAlignsWithScore(data: CotDashboardData, score: number): boolean {
  const { w1, w4, w13 } = horizonDeltas(buildDeltaFlow(data));
  const tone = horizonFlowTone(w1, w4, w13);
  if (score >= 20) return tone === "bull";
  if (score <= -20) return tone === "bear";
  return false;
}

/** Rule agreement, not an estimated probability of a profitable trade. */
export function computeInstitutionalConviction(data: CotDashboardData, score: number): ConvictionRead {
  // Match the unified verdict's neutral interval (-20, +20).
  if (!Number.isFinite(score) || Math.abs(score) < 20) return { level: 0, max: CONVICTION_MAX };
  const read = evaluateTitanPositioning(data);
  if (!read) return { level: 0, max: CONVICTION_MAX };
  const extremeAligned = score > 0 ? read.commercialIndex > IDX_HI : read.commercialIndex < IDX_LO;
  let level = 0;
  if (extremeAligned && read.commercialPersistenceWeeks >= 3) level += 1;
  if (deltaAlignsWithScore(data, score)) level += 1;
  if (regimeConfirmsBias(score, read.regime)) level += 1;
  if (read.divergence === "aligned") level += 1;
  if (extremeAligned) level += 1;
  return { level: Math.min(CONVICTION_MAX, level), max: CONVICTION_MAX };
}

/** Rank key for watchlists: magnitude × conviction × persistence. */
export function convictionRankScore(score: number, conviction: number, persistenceWeeks: number): number {
  return Math.abs(score) * (0.65 + conviction / CONVICTION_MAX) * (1 + Math.min(persistenceWeeks, 8) * 0.04);
}
