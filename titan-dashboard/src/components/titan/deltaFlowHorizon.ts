import type { DeltaFlowRow } from "../../lib/titanCommercialIndex";

export type HorizonFlowTone = "bull" | "bear" | "mixed";

export function horizonDeltas(rows: DeltaFlowRow[]): { w1: number; w4: number; w13: number } {
  const w1 = rows.find((r) => r.label === "1W")?.delta ?? rows[0]?.delta ?? 0;
  const w4 = rows.find((r) => r.label === "4W")?.delta ?? rows[1]?.delta ?? 0;
  const w13 = rows.find((r) => r.label === "13W")?.delta ?? rows[2]?.delta ?? 0;
  return { w1, w4, w13 };
}

/** Same alignment idea as COT bias engine: all horizons same sign vs mixed. */
export function horizonFlowTone(w1: number, w4: number, w13: number): HorizonFlowTone {
  if (w1 > 0 && w4 > 0 && w13 > 0) return "bull";
  if (w1 < 0 && w4 < 0 && w13 < 0) return "bear";
  return "mixed";
}

/** Deterministic strength from average |delta| when horizons are aligned. */
export function horizonFlowStrengthClass(
  tone: HorizonFlowTone,
  w1: number,
  w4: number,
  w13: number,
): "low" | "moderate" | "high" | "extreme" | "mixed" {
  if (tone === "mixed") return "mixed";
  const avg = (Math.abs(w1) + Math.abs(w4) + Math.abs(w13)) / 3;
  if (avg >= 40_000) return "extreme";
  if (avg >= 22_000) return "high";
  if (avg >= 9_000) return "moderate";
  return "low";
}
