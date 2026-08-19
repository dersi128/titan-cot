import type { OhlcBar } from "../types.js";

export function listYearsFromBars(bars: readonly OhlcBar[]): number[] {
  const set = new Set<number>();
  for (const bar of bars) {
    const y = Number(bar.date.slice(0, 4));
    if (Number.isFinite(y)) set.add(y);
  }
  return [...set].sort((a, b) => b - a);
}

export function hasExcludedYears(excluded: readonly number[] | null | undefined): boolean {
  return Array.isArray(excluded) && excluded.length > 0;
}

export function normalizeExcludedYears(excluded: readonly number[] | null | undefined): number[] {
  if (!hasExcludedYears(excluded)) return [];
  return [...new Set(excluded!.filter((y) => Number.isFinite(y)))].sort((a, b) => b - a);
}

export function excludedYearsCacheKey(excluded: readonly number[] | null | undefined): string {
  const n = normalizeExcludedYears(excluded);
  return n.length ? n.join(",") : "all";
}

export function filterBarsByExcludedYears(
  bars: OhlcBar[],
  excludedYears: readonly number[] | null | undefined,
): OhlcBar[] {
  const excluded = normalizeExcludedYears(excludedYears);
  if (!excluded.length) return bars;
  const ban = new Set(excluded);
  return bars.filter((bar) => {
    const y = Number(bar.date.slice(0, 4));
    return !ban.has(y);
  });
}

export function parseExcludedYearsQuery(raw: unknown): number[] | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const out: number[] = [];
  for (const part of raw.split(",")) {
    const y = Number(part.trim());
    if (Number.isInteger(y) && y >= 1970 && y <= 2100 && !out.includes(y)) out.push(y);
  }
  return out.length ? out.sort((a, b) => b - a) : null;
}
