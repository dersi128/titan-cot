import type { CotDashboardData } from "../types";
import {
  buildDeltaFlow,
  evaluateTitanPositioning,
  type MarketRegimeId,
} from "./titanCommercialIndex";
import { horizonDeltas, horizonFlowTone } from "../components/titan/deltaFlowHorizon";

export const CONVICTION_MAX = 5;

export type ConvictionRead = {
  level: number;
  max: typeof CONVICTION_MAX;
};

function commercialZoneIsExtreme(zone: string): boolean {
  return zone === "extreme_short" || zone === "extreme_long";
}

function regimeConfirmsBias(score: number, regime: MarketRegimeId): boolean {
  if (score >= 35) return regime === "accumulation" || regime === "trending";
  if (score <= -35) return regime === "distribution" || regime === "exhaustion";
  if (score > 8) return regime === "accumulation" || regime === "trending" || regime === "neutral";
  if (score < -8) return regime === "distribution" || regime === "exhaustion" || regime === "rotation";
  return regime === "neutral" || regime === "rotation" || regime === "transition";
}

function deltaAlignsWithScore(data: CotDashboardData, score: number): boolean {
  const { w1, w4, w13 } = horizonDeltas(buildDeltaFlow(data));
  const tone = horizonFlowTone(w1, w4, w13);
  if (score > 0) return tone === "bull";
  if (score < 0) return tone === "bear";
  return tone === "mixed";
}

/**
 * Deterministic conviction layer (not ML): persistence, flow, regime, divergence, extremes.
 */
export function computeInstitutionalConviction(data: CotDashboardData, score: number): ConvictionRead {
  const read = evaluateTitanPositioning(data);
  if (!read) return { level: 0, max: CONVICTION_MAX };

  let level = 0;

  if (read.commercialPersistenceWeeks >= 3) level += 1;

  if (deltaAlignsWithScore(data, score)) level += 1;

  if (regimeConfirmsBias(score, read.regime)) level += 1;

  if (read.divergence === "aligned") level += 1;

  if (
    read.extremePositioning ||
    commercialZoneIsExtreme(read.commercialZone) ||
    read.commercialIndex <= 20 ||
    read.commercialIndex >= 80
  ) {
    level += 1;
  }

  return { level: Math.min(CONVICTION_MAX, level), max: CONVICTION_MAX };
}

/** Rank key for watchlists: magnitude × conviction × persistence. */
export function convictionRankScore(
  score: number,
  conviction: number,
  persistenceWeeks: number,
): number {
  return Math.abs(score) * (0.65 + conviction / CONVICTION_MAX) * (1 + Math.min(persistenceWeeks, 8) * 0.04);
}
