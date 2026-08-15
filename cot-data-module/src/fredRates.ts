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
  /** Approx 1W change in percentage points */
  change1w: number | null;
  /** Approx 1M change in percentage points */
  change1m: number | null;
  /** Approx 1Y change in percentage points */
  change1y: number | null;
  spark: number[];
  /** Dated history for charts (up to ~5Y, weekly-sampled when denser) */
  history: FredSeriesPoint[];
};

export type MacroRatesResponse = {
  status: "ok" | "unconfigured" | "error";
  source: "fred";
  updatedAt: string | null;
  message?: string;
  fedFunds: FredSeriesSnapshot | null;
  yield2y: FredSeriesSnapshot | null;
  yield5y: FredSeriesSnapshot | null;
  yield10y: FredSeriesSnapshot | null;
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
/** How far back to pull from FRED */
const HISTORY_YEARS = Number(process.env.FRED_HISTORY_YEARS ?? 10);
/** Points kept for sparkline strip */
const SPARK_POINTS = 126;
/** Max dated points returned for UI charts (~weekly over 5Y) */
const CHART_POINTS = 260;

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
  observationStart.setFullYear(observationStart.getFullYear() - HISTORY_YEARS);

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

function sampleForChart(points: FredSeriesPoint[], maxPoints: number): FredSeriesPoint[] {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  const sampled: FredSeriesPoint[] = [];
  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]!);
  }
  const last = points[points.length - 1]!;
  if (sampled[sampled.length - 1]?.date !== last.date) {
    sampled.push(last);
  }
  return sampled;
}

function findClosestBefore(
  points: FredSeriesPoint[],
  targetIso: string,
): FredSeriesPoint | null {
  for (let i = points.length - 1; i >= 0; i -= 1) {
    const p = points[i]!;
    if (p.date <= targetIso) return p;
  }
  return null;
}

function changeVsDaysAgo(points: FredSeriesPoint[], latest: FredSeriesPoint, days: number): number | null {
  const target = new Date(`${latest.date}T00:00:00Z`);
  target.setUTCDate(target.getUTCDate() - days);
  const prior = findClosestBefore(points, target.toISOString().slice(0, 10));
  if (!prior) return null;
  return Number((latest.value - prior.value).toFixed(3));
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

  let change1w: number | null = null;
  let change1m: number | null = null;
  let change1y: number | null = null;
  if (latest) {
    change1w = changeVsDaysAgo(points, latest, 7);
    change1m = changeVsDaysAgo(points, latest, 30);
    change1y = changeVsDaysAgo(points, latest, 365);
  }

  return {
    seriesId,
    label,
    unit: "%",
    latest,
    previous,
    change,
    change1w,
    change1m,
    change1y,
    spark: points.slice(-SPARK_POINTS).map((p) => p.value),
    history: sampleForChart(points, CHART_POINTS),
  };
}

function emptyRates(status: MacroRatesResponse["status"], message?: string): MacroRatesResponse {
  return {
    status,
    source: "fred",
    updatedAt: null,
    message,
    fedFunds: null,
    yield2y: null,
    yield5y: null,
    yield10y: null,
  };
}

export function isFredConfigured(): boolean {
  return Boolean(process.env.FRED_API_KEY?.trim());
}

export async function getMacroRates(): Promise<MacroRatesResponse> {
  const apiKey = process.env.FRED_API_KEY?.trim();
  if (!apiKey) {
    return emptyRates(
      "unconfigured",
      "Set FRED_API_KEY on the API host (free key from fred.stlouisfed.org).",
    );
  }

  const now = Date.now();
  if (cache && cache.expiresAt > now) {
    return cache.payload;
  }

  try {
    const [dff, dgs2, dgs5, dgs10] = await Promise.all([
      fetchFredSeries("DFF", apiKey),
      fetchFredSeries("DGS2", apiKey),
      fetchFredSeries("DGS5", apiKey),
      fetchFredSeries("DGS10", apiKey),
    ]);

    const payload: MacroRatesResponse = {
      status: "ok",
      source: "fred",
      updatedAt: new Date().toISOString(),
      fedFunds: toSnapshot("DFF", "Fed funds (effective)", dff),
      yield2y: toSnapshot("DGS2", "US 2Y Treasury", dgs2),
      yield5y: toSnapshot("DGS5", "US 5Y Treasury", dgs5),
      yield10y: toSnapshot("DGS10", "US 10Y Treasury", dgs10),
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
    return emptyRates("error", message);
  }
}
