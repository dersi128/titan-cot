import type { ValuationSnapshot, ValuationUniverseRow } from "./types.js";

const TTL_MS = Number(process.env.VALUATION_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);

type Entry<T> = { expiresAt: number; value: T };

const detail = new Map<string, Entry<ValuationSnapshot>>();
let universe: Entry<{ rows: ValuationUniverseRow[]; fredStatus: string; updatedAt: string }> | null = null;

export function getCachedDetail(id: string): ValuationSnapshot | null {
  const hit = detail.get(id);
  if (!hit || hit.expiresAt <= Date.now()) return null;
  return hit.value;
}

export function setCachedDetail(id: string, value: ValuationSnapshot): void {
  detail.set(id, { expiresAt: Date.now() + TTL_MS, value });
}

export function getCachedUniverse(): Entry<{
  rows: ValuationUniverseRow[];
  fredStatus: string;
  updatedAt: string;
}>["value"] | null {
  if (!universe || universe.expiresAt <= Date.now()) return null;
  return universe.value;
}

export function setCachedUniverse(value: {
  rows: ValuationUniverseRow[];
  fredStatus: string;
  updatedAt: string;
}): void {
  universe = { expiresAt: Date.now() + TTL_MS, value };
}

export function valuationCacheTtlMs(): number {
  return TTL_MS;
}
