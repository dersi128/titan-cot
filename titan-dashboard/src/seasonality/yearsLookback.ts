import type { OhlcBar } from "./types";

export type YearsLookback = 5 | 10 | 15 | 20 | "ALL";

/** Lookbacks drawn on the multi-window seasonal chart (excludes ALL). */
export type ChartLookbackYears = 5 | 10 | 15 | 20;

export const DEFAULT_YEARS_LOOKBACK: YearsLookback = 10;

/** Max years fetched from provider; lookback filters client-side. */
export const MAX_OHLC_FETCH_YEARS = 20;

export const YEARS_LOOKBACK_OPTIONS: readonly YearsLookback[] = [5, 10, 15, 20, "ALL"] as const;

/** Historical windows shown together on the seasonal chart (no ALL). */
export const CHART_COMPARISON_LOOKBACKS: readonly ChartLookbackYears[] = [5, 10, 15, 20];

/** Recharts dataKey per lookback window. */
export const LOOKBACK_CHART_KEYS: Record<YearsLookback, string> = {
  5: "curve5Y",
  10: "curve10Y",
  15: "curve15Y",
  20: "curve20Y",
  ALL: "curveAll",
};

/** Chart line colors — multi-window comparison. */
export const LOOKBACK_CHART_COLORS: Record<YearsLookback, string> = {
  5: "#22D3EE",
  10: "#D4AF37",
  15: "#B48CFF",
  20: "#5B9BD5",
  ALL: "#78716c",
};

export function lookbackColor(lookback: YearsLookback): string {
  return LOOKBACK_CHART_COLORS[lookback];
}

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
