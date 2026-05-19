import type { CotVerdict } from "../types";

/** Map API verdict to heat / CSS tone (not a trade signal). */
export function verdictTone(verdict: CotVerdict | "—"): "bull" | "bear" | "neutral" {
  if (verdict === "—") return "neutral";
  if (verdict === "A+ LONG" || verdict === "B LONG") return "bull";
  if (verdict === "A+ SHORT" || verdict === "B SHORT") return "bear";
  return "neutral";
}

/** Band the numeric COT score for header / cell emphasis. */
export function scoreHeatBand(score: number): "hi" | "lo" | "mid" {
  if (score >= 60) return "hi";
  if (score <= -60) return "lo";
  return "mid";
}
