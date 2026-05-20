import type { OhlcBar } from "./types";

export type YearsLookback = 5 | 10 | 15 | 20 | "ALL";

export const DEFAULT_YEARS_LOOKBACK: YearsLookback = 10;

/** Max years fetched from provider; lookback filters client-side. */
export const MAX_OHLC_FETCH_YEARS = 20;

export const YEARS_LOOKBACK_OPTIONS: readonly YearsLookback[] = [5, 10, 15, 20, "ALL"] as const;

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
