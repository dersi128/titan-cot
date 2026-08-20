/** Generic FRED observations fetch with per-series cache. */

export type FredPoint = {
  date: string;
  value: number;
};

type FredObservation = {
  date: string;
  value: string;
};

type FredObservationsPayload = {
  observations?: FredObservation[];
  error_code?: number;
  error_message?: string;
};

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";
const CACHE_TTL_MS = Number(process.env.FRED_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);
const DEFAULT_YEARS = 20;

type CacheEntry = { expiresAt: number; points: FredPoint[] };

const cache = new Map<string, CacheEntry>();

export function isFredConfigured(): boolean {
  return Boolean(process.env.FRED_API_KEY?.trim());
}

function parsePoints(raw: FredObservation[]): FredPoint[] {
  const out: FredPoint[] = [];
  for (const row of raw) {
    if (!row?.date || row.value === "." || row.value === "") continue;
    const value = Number(row.value);
    if (!Number.isFinite(value)) continue;
    out.push({ date: row.date, value });
  }
  return out;
}

export async function fetchFredSeriesPoints(seriesId: string, years = DEFAULT_YEARS): Promise<FredPoint[]> {
  const apiKey = process.env.FRED_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("FRED_API_KEY is not set");
  }

  const cacheKey = `${seriesId}:${years}`;
  const hit = cache.get(cacheKey);
  const now = Date.now();
  if (hit && hit.expiresAt > now) return hit.points;

  const observationStart = new Date();
  observationStart.setFullYear(observationStart.getFullYear() - years);

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: "asc",
    observation_start: observationStart.toISOString().slice(0, 10),
  });

  const response = await fetch(`${FRED_BASE}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`FRED ${seriesId} HTTP ${response.status}`);
  }
  const payload = (await response.json()) as FredObservationsPayload;
  if (payload.error_message) {
    throw new Error(`FRED ${seriesId}: ${payload.error_message}`);
  }
  const points = parsePoints(payload.observations ?? []);
  cache.set(cacheKey, { expiresAt: now + CACHE_TTL_MS, points });
  return points;
}

export async function fetchFredSeriesMany(
  seriesIds: string[],
  years = DEFAULT_YEARS,
): Promise<Record<string, FredPoint[]>> {
  const unique = [...new Set(seriesIds.filter(Boolean))];
  const settled = await Promise.allSettled(unique.map((id) => fetchFredSeriesPoints(id, years)));
  const out: Record<string, FredPoint[]> = {};
  unique.forEach((id, i) => {
    const result = settled[i];
    if (result?.status === "fulfilled" && result.value.length > 0) {
      out[id] = result.value;
    } else if (result?.status === "rejected") {
      console.warn(`[valuation] FRED ${id}:`, result.reason);
    }
  });
  return out;
}
