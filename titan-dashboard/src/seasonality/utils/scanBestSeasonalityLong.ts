import { SEASONALITY_MARKETS } from "../markets";
import { fetchSeasonalityAnalysisFromApi, shouldUseSeasonalityApi } from "../seasonalityApi";
import { fetchSeasonalityComparisonWithSource } from "../services/seasonalityService";
import type { SeasonalityResult, SeasonalStrength } from "../types";
import { buildDashboardInsights } from "./dashboardInsights";

export type SeasonalityLongCandidate = {
  id: string;
  label: string;
  dataSymbol: string;
  bias: SeasonalityResult["seasonalBias"];
  strength: SeasonalStrength;
  score: number;
  winRate: number;
  avgReturnInWindow: number;
};

const STRENGTH_FALLBACK: Record<SeasonalStrength, number> = {
  LOW: 28,
  MODERATE: 55,
  HIGH: 78,
  EXTREME: 92,
};

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

async function fetchOne(symbol: string): Promise<SeasonalityResult | null> {
  try {
    if (shouldUseSeasonalityApi()) {
      return await Promise.race([
        fetchSeasonalityAnalysisFromApi(symbol, 10),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("timeout")), 45_000);
        }),
      ]);
    }
    const { comparison } = await fetchSeasonalityComparisonWithSource(symbol);
    return comparison[10] ?? comparison[5] ?? Object.values(comparison)[0] ?? null;
  } catch {
    return null;
  }
}

/** Parallel scan of seasonality presets; returns BULLISH longs ranked by score. */
export async function scanBestSeasonalityLongs(): Promise<SeasonalityLongCandidate[]> {
  const settled = await Promise.all(
    SEASONALITY_MARKETS.map(async (m) => {
      const result = await fetchOne(m.dataSymbol);
      if (!result || result.seasonalBias !== "BULLISH") return null;
      return {
        id: m.id,
        label: m.label,
        dataSymbol: m.dataSymbol,
        bias: result.seasonalBias,
        strength: result.seasonalStrength,
        score: rankScore(result),
        winRate: result.overallWinRate,
        avgReturnInWindow: result.averageReturnInWindow,
      } satisfies SeasonalityLongCandidate;
    }),
  );

  return settled
    .filter((x): x is SeasonalityLongCandidate => x !== null)
    .sort((a, b) => b.score - a.score);
}
