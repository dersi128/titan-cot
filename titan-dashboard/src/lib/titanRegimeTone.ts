import type { MarketRegimeId } from "./titanCommercialIndex";

/** Same band as COT NEUTRAL: |score| < 20. */
export const SCORE_NEUTRAL_ABS = 20;

export function regimePillClass(regime: MarketRegimeId, score?: number | null): string {
  if (regime === "trending") {
    if (score == null || !Number.isFinite(score) || Math.abs(score) < SCORE_NEUTRAL_ABS) {
      return "titan-regime-pill--neutral";
    }
    return score > 0 ? "titan-regime-pill--bull" : "titan-regime-pill--bear";
  }
  if (regime === "accumulation") return "titan-regime-pill--bull";
  if (regime === "distribution") return "titan-regime-pill--bear";
  if (regime === "exhaustion" || regime === "transition") return "titan-regime-pill--warn";
  return "titan-regime-pill--neutral";
}

export function regimeCardAccent(regime: MarketRegimeId): string {
  if (regime === "accumulation") return "titan-regime-card--bull";
  if (regime === "distribution") return "titan-regime-card--bear";
  if (regime === "exhaustion" || regime === "transition") return "titan-regime-card--warn";
  return "titan-regime-card--neutral";
}
