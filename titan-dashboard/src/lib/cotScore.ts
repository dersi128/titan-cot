import type { CotVerdict } from "../types";
import { normalizeLegacyVerdict } from "./titanCotScoringCore";

/** Map verdict to heat / CSS tone (not a trade signal). */
export function verdictTone(verdict: CotVerdict | "—" | string): "bull" | "bear" | "neutral" {
  if (verdict === "—") return "neutral";
  const v = normalizeLegacyVerdict(verdict);
  if (
    v === "A+ EXTREME LONG" ||
    v === "A STRONG LONG" ||
    v === "B LONG" ||
    v === "WEAK LONG"
  ) {
    return "bull";
  }
  if (
    v === "A+ EXTREME SHORT" ||
    v === "A STRONG SHORT" ||
    v === "B SHORT" ||
    v === "WEAK SHORT"
  ) {
    return "bear";
  }
  return "neutral";
}

/** Band the numeric COT score for header / cell emphasis. */
export function scoreHeatBand(score: number): "hi" | "lo" | "mid" {
  if (score >= 65) return "hi";
  if (score <= -65) return "lo";
  if (score >= 40 || score <= -40) return "mid";
  return "mid";
}
