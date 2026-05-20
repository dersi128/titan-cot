import type { BiasDriverId } from "./titanCotScoringCore";

/** Max absolute points per driver — for segmented bar scale only (not a cap in logic). */
export const DRIVER_POINTS_MAX_ABS: Record<BiasDriverId, number> = {
  commercialPositioning: 50,
  commercialDeltaFlow: 20,
  persistence: 15,
  ncDivergence: 10,
  retailCrowding: 20,
};

export type ImpactTone =
  | "strong_bear"
  | "bear"
  | "neutral"
  | "bull"
  | "strong_bull"
  | "contrarian_bear"
  | "contrarian_bull";

export function driverBarSegments(score: number, maxAbs: number): number {
  if (maxAbs <= 0 || score === 0) return 0;
  return Math.max(1, Math.min(10, Math.round((Math.abs(score) / maxAbs) * 10)));
}

/** UI accent for driver row — rule-based from points and driver id. */
export function impactToneForDriver(id: BiasDriverId, score: number): ImpactTone {
  if (score === 0) return "neutral";
  if (id === "retailCrowding") {
    if (score < 0) return "contrarian_bear";
    if (score > 0) return "contrarian_bull";
    return "neutral";
  }
  const abs = Math.abs(score);
  const strong = id === "commercialPositioning" ? abs >= 30 : id === "persistence" ? abs >= 10 : abs >= 8;
  if (score < 0) return strong ? "strong_bear" : "bear";
  return strong ? "strong_bull" : "bull";
}
