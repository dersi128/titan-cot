import { SEASONALITY_MARKETS } from "../markets";
import { fetchSeasonalityAnalysisFromApi, shouldUseSeasonalityApi } from "../seasonalityApi";
import { fetchSeasonalityComparisonWithSource } from "../services/seasonalityService";
import type { SeasonalBias, SeasonalityResult, SeasonalStrength } from "../types";
import { buildDashboardInsights } from "./dashboardInsights";

export type SeasonalityLongCandidate = {
  id: string;
  label: string;
  dataSymbol: string;
  /** Strict seasonal bias from engine (may be NEUTRAL with a long lean). */
  bias: SeasonalBias;
  strength: SeasonalStrength;
  score: number;
  winRate: number;
  avgReturnInWindow: number;
};

/** Same universe as the seasonality market menu (no extra off-menu symbols). */
const SCAN_MARKETS = SEASONALITY_MARKETS;

export const SEASONAL_LONG_TOP_N = 5;

const STRENGTH_FALLBACK: Record<SeasonalStrength, number> = {
  LOW: 28,
  MODERATE: 55,
  HIGH: 78,
  EXTREME: 92,
};

const FETCH_TIMEOUT_MS = 55_000;
const CONCURRENCY = 3;

let cachedLongs: SeasonalityLongCandidate[] | null = null;
let inflight: Promise<SeasonalityLongCandidate[]> | null = null;

function rankScore(result: SeasonalityResult): number {
  try {
    const insights = buildDashboardInsights(result, { 10: result });
    return insights.score;
  } catch {
    const base = STRENGTH_FALLBACK[result.seasonalStrength] ?? 40;
    const wrPull = (result.overallWinRate - 50) * 0.25;
    return Math.round(Math.max(5, Math.min(98, base + wrPull)));
  }
}

/** Long-leaning seasonal setups — not the same as COT “strongest longs”. */
function qualifiesAsSeasonalLong(result: SeasonalityResult, score: number): boolean {
  if (result.seasonalBias === "BEARISH") return false;
  if (result.seasonalBias === "BULLISH") return true;
  const avg = result.averageReturnInWindow;
  const wr = result.overallWinRate;
  if (avg > 0 && score >= 50) return true;
  if (avg > 0 && wr >= 52) return true;
  if (score >= 58) return true;
  return false;
}

async function fetchOne(symbol: string): Promise<SeasonalityResult | null> {
  try {
    if (shouldUseSeasonalityApi()) {
      return await Promise.race([
        fetchSeasonalityAnalysisFromApi(symbol, 10),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("timeout")), FETCH_TIMEOUT_MS);
        }),
      ]);
    }
    const { comparison } = await fetchSeasonalityComparisonWithSource(symbol);
    return comparison[10] ?? comparison[5] ?? Object.values(comparison)[0] ?? null;
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

async function runScan(): Promise<SeasonalityLongCandidate[]> {
  const settled = await mapPool(SCAN_MARKETS, CONCURRENCY, async (m) => {
    const result = await fetchOne(m.dataSymbol);
    if (!result) return null;
    const score = rankScore(result);
    if (!qualifiesAsSeasonalLong(result, score)) return null;
    const candidate: SeasonalityLongCandidate = {
      id: m.id,
      label: m.label,
      dataSymbol: m.dataSymbol,
      bias: result.seasonalBias,
      strength: result.seasonalStrength,
      score,
      winRate: result.overallWinRate,
      avgReturnInWindow: result.averageReturnInWindow,
    };
    return candidate;
  });

  return settled
    .filter((x): x is SeasonalityLongCandidate => x !== null)
    .sort((a, b) => {
      const bullBoost = (c: SeasonalityLongCandidate) => (c.bias === "BULLISH" ? 20 : 0);
      return b.score + bullBoost(b) - (a.score + bullBoost(a));
    })
    .slice(0, SEASONAL_LONG_TOP_N);
}

/** Parallel scan of seasonality presets; returns long-leaning setups ranked by score. */
export async function scanBestSeasonalityLongs(): Promise<SeasonalityLongCandidate[]> {
  if (cachedLongs) return cachedLongs;
  if (inflight) return inflight;
  inflight = runScan()
    .then((rows) => {
      cachedLongs = rows;
      return rows;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
