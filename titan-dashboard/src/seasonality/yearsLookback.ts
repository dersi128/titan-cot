import type { OhlcBar } from "./types";

export type YearsLookback = 5 | 10 | 15 | 20 | "ALL";

export const DEFAULT_YEARS_LOOKBACK: YearsLookback = 10;

/** Max years fetched from provider; lookback filters client-side. */
export const MAX_OHLC_FETCH_YEARS = 20;

export const YEARS_LOOKBACK_OPTIONS: readonly YearsLookback[] = [5, 10, 15, 20, "ALL"] as const;

/** All windows rendered together on the seasonal chart. */
export const CHART_COMPARISON_LOOKBACKS: readonly YearsLookback[] = YEARS_LOOKBACK_OPTIONS;

/** Recharts dataKey per lookback window. */
export const LOOKBACK_CHART_KEYS: Record<YearsLookback, string> = {
  5: "curve5Y",
  10: "curve10Y",
  15: "curve15Y",
  20: "curve20Y",
  ALL: "curveAll",
};

/** Stroke colors — primary lookback uses full opacity via chart component. */
export const LOOKBACK_CHART_COLORS: Record<YearsLookback, string> = {
  5: "#57534e",
  10: "#d4af37",
  15: "#a8a29e",
  20: "#9ca3af",
  ALL: "#f0d060",
};

export function lookbackLabel(lookback: YearsLookback): string {
  return lookback === "ALL" ? "ALL" : `${lookback}Y`;
}

/** Restrict daily OHLC to the selected historical window (inclusive of cutoff date). */
export function filterBarsByLookback(
  bars: OhlcBar[],
  lookback: YearsLookback,
  asOfDate?: string,
): OhlcBar[] {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  if (lookback === "ALL" || sorted.length === 0) return sorted;

  const asOf = asOfDate ?? sorted[sorted.length - 1].date;
  const [y, m, d] = asOf.split("-").map(Number);
  const cutoff = new Date(y, m - 1, d);
  cutoff.setFullYear(cutoff.getFullYear() - lookback);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  return sorted.filter((bar) => bar.date >= cutoffIso);
}
