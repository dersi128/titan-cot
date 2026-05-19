import type { CotDashboardData } from "../types";

export type CotHistoryRangeWeeks = 26 | 52 | 156 | 260;

export type CotHistoryInsights = {
  commercialPctileNote: string;
  retailVsCommercialNote: string;
  nonCommDivergenceLabel: string;
};

function classifyRetailVsCommercial(data: CotDashboardData): string {
  const r = data.retail.index52w;
  const c = data.commercials.index52w;
  if (r >= 70 && c <= 35) return "Retail stretched long vs commercials lean short — classic contrarian setup.";
  if (r <= 30 && c >= 65) return "Retail stretched short vs commercials lean long.";
  return "Retail and commercials not at extreme opposition on 52w positioning.";
}

function formatDivergence(d: "bullish" | "bearish" | "none"): string {
  if (d === "bullish") {
    return "Weekly flow: commercial net up vs non-commercial net down (institutional divergence, positioning only).";
  }
  if (d === "bearish") {
    return "Weekly flow: commercial net down vs non-commercial net up (institutional divergence, positioning only).";
  }
  return "No clear weekly commercial vs non-commercial flow divergence.";
}

export function buildCotHistoryInsights(cotData: CotDashboardData): CotHistoryInsights {
  const c52 = cotData.commercials.index52w;
  let commercialPctileNote = `Commercials 52w index at ${c52.toFixed(0)}.`;
  if (c52 >= 80) commercialPctileNote += " Upper historical zone.";
  else if (c52 <= 20) commercialPctileNote += " Lower historical zone.";

  return {
    commercialPctileNote,
    retailVsCommercialNote: classifyRetailVsCommercial(cotData),
    nonCommDivergenceLabel: formatDivergence(cotData.nonCommercials.divergence),
  };
}

export function sliceHistoryByWeeks<T extends { reportDate: string }>(
  history: T[],
  weeks: CotHistoryRangeWeeks,
): T[] {
  if (history.length <= weeks) return history;
  return history.slice(-weeks);
}
