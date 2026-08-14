import type { SeasonalityComparison } from "./seasonality/services/seasonalityService.js";
import type { SeasonalityResult } from "./seasonality/types.js";
import type { YearsLookback } from "./seasonality/yearsLookback.js";

const TTL_MS = Number(process.env.SEASONALITY_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);

type CacheEntry<T> = { at: number; value: T };

const comparisonCache = new Map<string, CacheEntry<SeasonalityComparison>>();
const singleCache = new Map<string, CacheEntry<SeasonalityResult>>();

function cacheKey(
  symbol: string,
  lookback?: YearsLookback,
  compare?: boolean,
  cycleKey = "all",
): string {
  const base = compare ? `${symbol}:compare` : `${symbol}:${lookback ?? "10"}`;
  return `${base}:cyc:${cycleKey}`;
}

function getFresh<T>(map: Map<string, CacheEntry<T>>, key: string): T | null {
  const hit = map.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    map.delete(key);
    return null;
  }
  return hit.value;
}

function set<T>(map: Map<string, CacheEntry<T>>, key: string, value: T): void {
  map.set(key, { at: Date.now(), value });
}

export function getCachedComparison(
  symbol: string,
  cycleKey = "all",
): SeasonalityComparison | null {
  return getFresh(comparisonCache, cacheKey(symbol, undefined, true, cycleKey));
}

export function setCachedComparison(
  symbol: string,
  value: SeasonalityComparison,
  cycleKey = "all",
): void {
  set(comparisonCache, cacheKey(symbol, undefined, true, cycleKey), value);
}

export function getCachedSingle(
  symbol: string,
  lookback: YearsLookback,
  cycleKey = "all",
): SeasonalityResult | null {
  return getFresh(singleCache, cacheKey(symbol, lookback, false, cycleKey));
}

export function setCachedSingle(
  symbol: string,
  lookback: YearsLookback,
  value: SeasonalityResult,
  cycleKey = "all",
): void {
  set(singleCache, cacheKey(symbol, lookback, false, cycleKey), value);
}
