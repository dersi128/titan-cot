import type { CotDashboardData } from "../../types";

export type UsdBiasLabel = "BULLISH" | "BEARISH" | "NEUTRAL";

/** Map DXY COT score (−100…+100) → USD pulse 0–100. */
export function dxyScoreToUsd100(dxyScore: number | null | undefined): number | null {
  if (typeof dxyScore !== "number" || !Number.isFinite(dxyScore)) return null;
  return Math.round((Math.max(-100, Math.min(100, dxyScore)) + 100) / 2);
}

export function usdBiasFromScore100(score: number | null): UsdBiasLabel {
  if (score === null) return "NEUTRAL";
  if (score >= 60) return "BULLISH";
  if (score <= 40) return "BEARISH";
  return "NEUTRAL";
}

export function usdPulseFromBundle(bundle: Record<string, CotDashboardData>): {
  score100: number | null;
  bias: UsdBiasLabel;
  dxyScore: number | null;
} {
  const dxy = bundle["DX1!"];
  const dxyScore =
    dxy && Number.isFinite(dxy.cotScore) ? Math.round(dxy.cotScore) : null;
  const score100 = dxyScoreToUsd100(dxyScore);
  return { score100, bias: usdBiasFromScore100(score100), dxyScore };
}
