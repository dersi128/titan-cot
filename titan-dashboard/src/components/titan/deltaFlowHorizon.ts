import type { DeltaFlowRow } from "../../lib/titanCommercialIndex";

export type HorizonFlowTone = "bull" | "bear" | "mixed";

/** Panel-level horizon momentum (positioning context — not a trade signal). */
export type DeltaPanelTrend =
  | "bearish_accel"
  | "bullish_accel"
  | "weakening_bear"
  | "weakening_bull"
  | "mixed_flow";

export function horizonDeltas(rows: DeltaFlowRow[]): { w1: number; w4: number; w13: number } {
  const w1 = rows.find((r) => r.label === "1W")?.delta ?? rows[0]?.delta ?? 0;
  const w4 = rows.find((r) => r.label === "4W")?.delta ?? rows[1]?.delta ?? 0;
  const w13 = rows.find((r) => r.label === "13W")?.delta ?? rows[2]?.delta ?? 0;
  return { w1, w4, w13 };
}

/** Strict sign alignment across 1W · 4W · 13W commercial deltas. */
export function horizonFlowTone(w1: number, w4: number, w13: number): HorizonFlowTone {
  if (w1 > 0 && w4 > 0 && w13 > 0) return "bull";
  if (w1 < 0 && w4 < 0 && w13 < 0) return "bear";
  return "mixed";
}

/** `moreNeg` is strictly more negative than `lessNeg` (both &lt; 0), by a meaningful step. */
function significantlyMoreNegative(moreNeg: number, lessNeg: number): boolean {
  if (!(moreNeg < 0 && lessNeg < 0 && moreNeg < lessNeg)) return false;
  const diff = lessNeg - moreNeg;
  const scale = Math.max(Math.abs(moreNeg), Math.abs(lessNeg), 500);
  return diff >= Math.max(scale * 0.045, 400);
}

/** `morePos` is strictly more positive than `lessPos` (both &gt; 0). */
function significantlyMorePositive(morePos: number, lessPos: number): boolean {
  if (!(lessPos > 0 && morePos > 0 && morePos > lessPos)) return false;
  const diff = morePos - lessPos;
  const scale = Math.max(morePos, lessPos, 500);
  return diff >= Math.max(scale * 0.045, 400);
}

/**
 * Compares 1W vs 4W vs 13W levels (not week-over-week velocity): building vs fading imbalance.
 */
export function horizonPanelTrend(w1: number, w4: number, w13: number): DeltaPanelTrend {
  const tone = horizonFlowTone(w1, w4, w13);
  if (tone === "mixed") return "mixed_flow";

  if (tone === "bear") {
    const accel = significantlyMoreNegative(w13, w4) && significantlyMoreNegative(w4, w1);
    const weakening = significantlyMoreNegative(w1, w4) && significantlyMoreNegative(w4, w13);
    if (accel && !weakening) return "bearish_accel";
    if (weakening && !accel) return "weakening_bear";
    return "mixed_flow";
  }

  const accel = significantlyMorePositive(w4, w1) && significantlyMorePositive(w13, w4);
  const weakening = significantlyMorePositive(w4, w13) && significantlyMorePositive(w1, w4);
  if (accel && !weakening) return "bullish_accel";
  if (weakening && !accel) return "weakening_bull";
  return "mixed_flow";
}

/**
 * Strength from |delta| scale when horizons share direction; tier rises when magnitudes are coherent
 * (tight spread = strongly aligned imbalance).
 */
export function horizonFlowStrengthClass(
  tone: HorizonFlowTone,
  w1: number,
  w4: number,
  w13: number,
): "low" | "moderate" | "high" | "extreme" | "mixed" {
  if (tone === "mixed") return "mixed";
  const absVals = [Math.abs(w1), Math.abs(w4), Math.abs(w13)];
  const avg = (absVals[0]! + absVals[1]! + absVals[2]!) / 3;
  const max = Math.max(...absVals);
  const min = Math.min(...absVals);
  const spreadRatio = max > 0 ? (max - min) / max : 0;
  const coherent = spreadRatio <= 0.55;

  let tier: "low" | "moderate" | "high" | "extreme" = "low";
  if (avg >= 40_000) tier = "extreme";
  else if (avg >= 22_000) tier = "high";
  else if (avg >= 9_000) tier = "moderate";

  if (coherent && avg >= 14_000 && tier === "moderate") tier = "high";
  if (coherent && avg >= 30_000 && tier === "high") tier = "extreme";

  if (!coherent) {
    if (tier === "extreme") tier = "high";
    if (tier === "high" && avg < 32_000) tier = "moderate";
  }

  return tier;
}
