import type { CotDashboardOutput } from "./cotGold.js";
import { fetchCotDashboardData } from "./cotGold.js";

const TTL_MS = Number(process.env.COT_CACHE_TTL_MS ?? 15 * 60 * 1000);

type CacheEntry = {
  expiresAt: number;
  data: CotDashboardOutput;
};

const cache = new Map<string, CacheEntry>();

export function clearCotCache(): void {
  cache.clear();
}

export async function getCachedCotDashboard(symbol: string): Promise<CotDashboardOutput> {
  const key = symbol.toUpperCase();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.data;
  }

  const data = await fetchCotDashboardData(symbol);
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS });
  return data;
}
