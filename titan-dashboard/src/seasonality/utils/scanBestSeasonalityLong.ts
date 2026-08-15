import { fetchSeasonalityAnalysisFromApi, shouldUseSeasonalityApi } from "../seasonalityApi";
import { fetchSeasonalityComparisonWithSource } from "../services/seasonalityService";
import type { SeasonalBias, SeasonalityResult, SeasonalStrength } from "../types";
import { SEASONAL_LONG_SCAN_MARKETS } from "./seasonalLongScanUniverse";

export type SeasonalityOpportunity = {
  id: string;
  label: string;
  dataSymbol: string;
  side: "LONG" | "SHORT";
  bias: SeasonalBias;
  strength: SeasonalStrength;
  score: number;
  winRate: number;
  avgReturn: number;
  alignmentLabel: string;
  windowLabel: string;
  daysUntilStart: number;
};

export const SEASONAL_OPP_TOP_N = 5;

const FETCH_TIMEOUT_MS = 55_000;
const CONCURRENCY = 4;
const MIN_SCORE = 65;
const MIN_WR = 60;

let cached: { longs: SeasonalityOpportunity[]; shorts: SeasonalityOpportunity[] } | null = null;
let inflight: Promise<{ longs: SeasonalityOpportunity[]; shorts: SeasonalityOpportunity[] }> | null =
  null;

async function fetchOne(symbol: string): Promise<SeasonalityResult | null> {
  try {
    if (shouldUseSeasonalityApi()) {
      return await Promise.race([
        fetchSeasonalityAnalysisFromApi(symbol, 20),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("timeout")), FETCH_TIMEOUT_MS);
        }),
      ]);
    }
    const { comparison } = await fetchSeasonalityComparisonWithSource(symbol);
    return comparison[20] ?? comparison[15] ?? comparison[10] ?? Object.values(comparison)[0] ?? null;
  } catch {
    return null;
  }
}

async function mapPool<T, R>(items: readonly T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

function toOpp(
  m: { id: string; label: string; dataSymbol: string },
  result: SeasonalityResult,
  side: "LONG" | "SHORT",
): SeasonalityOpportunity | null {
  const we = result.windowEngine;
  if (!we) return null;

  const want: SeasonalBias = side === "LONG" ? "BULLISH" : "BEARISH";
  const active =
    result.seasonalBias === want &&
    we.score >= MIN_SCORE &&
    we.sampleSize >= 8 &&
    (side === "LONG" ? we.winRate * 100 >= MIN_WR : we.winRate * 100 <= 40);

  const upcoming =
    we.upcomingSide === want &&
    (we.upcomingScore ?? 0) >= MIN_SCORE &&
    (we.daysUntilStart ?? 99) >= 1 &&
    (we.daysUntilStart ?? 99) <= 5 &&
    we.sampleSize >= 8;

  if (!active && !upcoming) return null;

  const score = active ? we.score : (we.upcomingScore ?? we.score);
  const windowLabel = active
    ? we.windowLabel
    : (we.upcomingLabel ?? we.windowLabel);

  return {
    id: m.id,
    label: m.label,
    dataSymbol: m.dataSymbol,
    side,
    bias: want,
    strength: we.confidence,
    score,
    winRate: we.winRate * 100,
    avgReturn: we.avgReturn,
    alignmentLabel: we.alignmentLabel,
    windowLabel,
    daysUntilStart: active ? 0 : (we.daysUntilStart ?? 1),
  };
}

function rank(a: SeasonalityOpportunity, b: SeasonalityOpportunity): number {
  const align = (s: string) => {
    const m = s.match(/(\d+)\s*\/\s*(\d+)/);
    return m ? Number(m[1]) / Math.max(1, Number(m[2])) : 0;
  };
  return (
    b.score - a.score ||
    align(b.alignmentLabel) - align(a.alignmentLabel) ||
    b.winRate - a.winRate ||
    Math.abs(b.avgReturn) - Math.abs(a.avgReturn)
  );
}

async function runScan() {
  const settled = await mapPool(SEASONAL_LONG_SCAN_MARKETS, CONCURRENCY, async (m) => {
    const result = await fetchOne(m.dataSymbol);
    if (!result || result.engineVersion !== "window-v2") {
      // still try if windowEngine present
      if (!result?.windowEngine) return { long: null, short: null };
    }
    return {
      long: toOpp(m, result!, "LONG"),
      short: toOpp(m, result!, "SHORT"),
    };
  });

  const longs = settled
    .map((x) => x.long)
    .filter((x): x is SeasonalityOpportunity => x !== null)
    .sort(rank)
    .slice(0, SEASONAL_OPP_TOP_N);
  const shorts = settled
    .map((x) => x.short)
    .filter((x): x is SeasonalityOpportunity => x !== null)
    .sort(rank)
    .slice(0, SEASONAL_OPP_TOP_N);

  return { longs, shorts };
}

/** @deprecated use scanSeasonalOpportunities */
export type SeasonalityLongCandidate = SeasonalityOpportunity;

export async function scanBestSeasonalityLongs(): Promise<SeasonalityOpportunity[]> {
  const { longs } = await scanSeasonalOpportunities();
  return longs;
}

export async function scanSeasonalOpportunities(): Promise<{
  longs: SeasonalityOpportunity[];
  shorts: SeasonalityOpportunity[];
}> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = runScan()
    .then((rows) => {
      cached = rows;
      return rows;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
