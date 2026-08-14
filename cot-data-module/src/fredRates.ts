/** Stable US rates from FRED (St. Louis Fed) — requires FRED_API_KEY. */

export type FredSeriesPoint = {
  date: string;
  value: number;
};

export type FredSeriesSnapshot = {
  seriesId: string;
  label: string;
  unit: "%";
  latest: FredSeriesPoint | null;
  previous: FredSeriesPoint | null;
  change: number | null;
  spark: number[];
};

export type MacroRatesResponse = {
  status: "ok" | "unconfigured" | "error";
  source: "fred";
  updatedAt: string | null;
  message?: string;
  fedFunds: FredSeriesSnapshot | null;
  yield2y: FredSeriesSnapshot | null;
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
const SPARK_POINTS = 60;

type CacheEntry = {
  expiresAt: number;
  payload: MacroRatesResponse;
};

let cache: CacheEntry | null = null;

function parseNumericObservations(raw: FredObservation[]): FredSeriesPoint[] {
  const out: FredSeriesPoint[] = [];
  for (const row of raw) {
    if (!row?.date || row.value === "." || row.value === "") continue;
    const value = Number(row.value);
    if (!Number.isFinite(value)) continue;
    out.push({ date: row.date, value });
  }
  return out;
}

async function fetchFredSeries(seriesId: string, apiKey: string): Promise<FredSeriesPoint[]> {
  const observationStart = new Date();
  observationStart.setFullYear(observationStart.getFullYear() - 2);

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

  return parseNumericObservations(payload.observations ?? []);
}

function toSnapshot(
  seriesId: string,
  label: string,
  points: FredSeriesPoint[],
): FredSeriesSnapshot {
  const latest = points.length > 0 ? points[points.length - 1]! : null;
  const previous = points.length > 1 ? points[points.length - 2]! : null;
  const change =
    latest && previous ? Number((latest.value - previous.value).toFixed(3)) : null;
  const spark = points.slice(-SPARK_POINTS).map((p) => p.value);

  return {
    seriesId,
    label,
    unit: "%",
    latest,
    previous,
    change,
    spark,
  };
}

export function isFredConfigured(): boolean {
  return Boolean(process.env.FRED_API_KEY?.trim());
}

export async function getMacroRates(): Promise<MacroRatesResponse> {
  const apiKey = process.env.FRED_API_KEY?.trim();
  if (!apiKey) {
    return {
      status: "unconfigured",
      source: "fred",
      updatedAt: null,
      message: "Set FRED_API_KEY on the API host (free key from fred.stlouisfed.org).",
      fedFunds: null,
      yield2y: null,
    };
  }

  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.payload;
  }

  try {
    const [dff, dgs2] = await Promise.all([
      fetchFredSeries("DFF", apiKey),
      fetchFredSeries("DGS2", apiKey),
    ]);

    const payload: MacroRatesResponse = {
      status: "ok",
      source: "fred",
      updatedAt: new Date().toISOString(),
      fedFunds: toSnapshot("DFF", "Fed funds (effective)", dff),
      yield2y: toSnapshot("DGS2", "US 2Y Treasury", dgs2),
    };

    cache = { expiresAt: now + CACHE_TTL_MS, payload };
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : "FRED fetch failed";
    if (cache?.payload.status === "ok") {
      return {
        ...cache.payload,
        message: `Stale cache · ${message}`,
      };
    }
    return {
      status: "error",
      source: "fred",
      updatedAt: null,
      message,
      fedFunds: null,
      yield2y: null,
    };
  }
}
