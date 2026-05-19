import type { CotDashboardData } from "../types";

export type TitanBiasVerdict =
  | "A+ LONG BIAS"
  | "B LONG BIAS"
  | "NEUTRAL"
  | "B SHORT BIAS"
  | "A+ SHORT BIAS";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * TITAN COT composite for the institutional dashboard (swing bias only — not entries).
 * Mirrors bullish / bearish components per dashboard specification.
 */
export function computeTitanDashboardScore(data: CotDashboardData): number {
  let s = 0;
  const c = data.commercials;
  const r = data.retail;
  const nc = data.nonCommercials;

  if (c.index26w > 80) s += 40;
  else if (c.index26w < 20) s -= 40;

  if (c.index52w > 80) s += 20;
  else if (c.index52w < 20) s -= 20;

  if (r.index26w < 20) s += 15;
  if (r.index26w > 80) s -= 15;

  if (c.weeklyChange > 0) s += 10;
  else if (c.weeklyChange < 0) s -= 10;

  if (nc.divergence === "bullish") s += 15;
  else if (nc.divergence === "bearish") s -= 15;

  return clamp(s, -100, 100);
}

export function scoreToTitanBiasVerdict(score: number): TitanBiasVerdict {
  if (score >= 80) return "A+ LONG BIAS";
  if (score >= 60) return "B LONG BIAS";
  if (score <= -80) return "A+ SHORT BIAS";
  if (score <= -60) return "B SHORT BIAS";
  return "NEUTRAL";
}

export type PositioningTrend = "accumulation" | "distribution" | "flat";

export function commercialTrend(data: CotDashboardData): PositioningTrend {
  if (data.commercials.weeklyChange > 0) return "accumulation";
  if (data.commercials.weeklyChange < 0) return "distribution";
  return "flat";
}

export function buildInstitutionalNarrative(
  data: CotDashboardData,
  score: number,
  verdict: TitanBiasVerdict,
): string {
  const c = data.commercials;
  const r = data.retail;
  const nc = data.nonCommercials;

  const head = `${data.market} (${data.futuresSymbol}) — CFTC Legacy Futures Only, report ${data.reportDate}. `;

  let comm = "";
  if (c.index26w > 80 && c.index52w > 80) {
    comm =
      "Commercials occupy the upper percentile band on both 26-week and 52-week windows, consistent with a strong long-bias institutional skew. ";
  } else if (c.index26w < 20 && c.index52w < 20) {
    comm =
      "Commercials sit in the lower percentile band on both horizons — a defensive / distribution-leaning institutional posture. ";
  } else {
    comm =
      "Commercial positioning is mixed across 26-week and 52-week measures — bias is nuanced rather than at dual extremes. ";
  }

  let ret = "";
  if (r.index26w < 20) {
    ret =
      "Non-reportable positioning is stretched short on a 26-week basis, a classic crowded-retail backdrop that can reinforce bullish contrarian context when commercials lean long. ";
  } else if (r.index26w > 80) {
    ret =
      "Non-reportable interest is extended long on a 26-week basis — a vulnerability profile when commercial hedgers are distributing. ";
  } else {
    ret = "Retail positioning is mid-range versus its rolling history — fewer clean sentiment extremes. ";
  }

  let div = "";
  if (nc.divergence === "bullish") {
    div =
      "Weekly flow shows commercial net rising while non-commercial net is fading — institutional-style bullish divergence on positioning alone. ";
  } else if (nc.divergence === "bearish") {
    div =
      "Weekly flow shows commercial net easing while non-commercial net is building — bearish institutional divergence on positioning. ";
  } else {
    div = "No pronounced weekly commercial vs non-commercial flow split is evident. ";
  }

  const wk =
    c.weeklyChange > 0
      ? `Commercial net rose ${c.weeklyChange.toLocaleString()} contracts week-over-week. `
      : c.weeklyChange < 0
        ? `Commercial net fell ${Math.abs(c.weeklyChange).toLocaleString()} contracts week-over-week. `
        : "Commercial net was little changed week-over-week. ";

  const tail = `Composite TITAN COT score ${score.toFixed(0)} maps to ${verdict}. This panel describes bias and smart-money context only — not buy or sell timing.`;

  return head + comm + ret + div + wk + tail;
}

export function verdictAccentClass(verdict: TitanBiasVerdict): string {
  if (verdict === "A+ LONG BIAS" || verdict === "B LONG BIAS") return "text-emerald-400/95";
  if (verdict === "A+ SHORT BIAS" || verdict === "B SHORT BIAS") return "text-rose-400/95";
  return "text-stone-400";
}

export function scoreHeatClass(score: number): string {
  if (score >= 60) return "text-emerald-400";
  if (score <= -60) return "text-rose-400";
  return "text-stone-300";
}
