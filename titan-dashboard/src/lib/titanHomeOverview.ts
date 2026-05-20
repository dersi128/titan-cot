import type { InstitutionalMarket } from "../config/institutionalMarkets";
import type { CotDashboardData } from "../types";
export type HomeScannerRow = {
  market: InstitutionalMarket;
  score: number;
  conviction: number;
  persistenceWeeks: number;
  regime: MarketRegimeId;
  status: "live" | "loading" | "error";
};
import { commercialIndexZone, type MarketRegimeId } from "./titanCommercialIndex";
import { convictionRankScore } from "./titanConviction";

export const REGIME_OVERVIEW_ORDER: MarketRegimeId[] = [
  "distribution",
  "accumulation",
  "trending",
  "transition",
  "neutral",
  "rotation",
  "exhaustion",
];

export type RegimeOverviewCard = {
  regime: MarketRegimeId;
  count: number;
  pct: number;
  spark: number[];
};

export type HomeOverviewStats = {
  liveCount: number;
  totalMarkets: number;
  regimeCards: RegimeOverviewCard[];
  commercialDominancePct: number;
  extremeMarketsCount: number;
  strongestLongs: WatchlistEntry[];
  strongestShorts: WatchlistEntry[];
};

export type WatchlistEntry = {
  market: InstitutionalMarket;
  score: number;
  conviction: number;
  regime: MarketRegimeId;
  rank: number;
};

function isCommercial26wExtreme(index26w: number): boolean {
  const z = commercialIndexZone(index26w);
  return z === "extreme_short" || z === "extreme_long" || index26w <= 20 || index26w >= 80;
}

export function emptyHomeOverviewStats(totalMarkets: number): HomeOverviewStats {
  return {
    liveCount: 0,
    totalMarkets,
    regimeCards: REGIME_OVERVIEW_ORDER.map((regime) => ({
      regime,
      count: 0,
      pct: 0,
      spark: [0, 0, 0, 0, 0, 0, 0, 0],
    })),
    commercialDominancePct: 0,
    extremeMarketsCount: 0,
    strongestLongs: [],
    strongestShorts: [],
  };
}

export function buildHomeOverviewStats(
  markets: readonly InstitutionalMarket[],
  bundle: Record<string, CotDashboardData>,
  rows: HomeScannerRow[],
): HomeOverviewStats {
  const liveRows = rows.filter((r) => r.status === "live");
  const liveCount = liveRows.length;
  const totalMarkets = markets.length;

  const regimeCounts = Object.fromEntries(
    REGIME_OVERVIEW_ORDER.map((r) => [r, 0]),
  ) as Record<MarketRegimeId, number>;

  let extremeCount = 0;

  for (const row of liveRows) {
    regimeCounts[row.regime] = (regimeCounts[row.regime] ?? 0) + 1;
    const data = bundle[row.market.symbol];
    if (data && isCommercial26wExtreme(data.commercials.index26w)) {
      extremeCount += 1;
    }
  }

  const maxRegimeCount = Math.max(1, ...Object.values(regimeCounts));

  const regimeCards: RegimeOverviewCard[] = REGIME_OVERVIEW_ORDER.map((regime) => {
    const count = regimeCounts[regime] ?? 0;
    const pct = liveCount > 0 ? Math.round((count / liveCount) * 100) : 0;
    const spark = Array.from({ length: 8 }, (_, i) => {
      const t = (i + 1) / 8;
      return Math.round((count / maxRegimeCount) * (0.35 + t * 0.65) * 100) / 100;
    });
    return { regime, count, pct, spark };
  });

  const commercialDominancePct =
    liveCount > 0 ? Math.round((extremeCount / liveCount) * 100) : 0;

  const enriched = liveRows
    .map((row) => {
      const data = bundle[row.market.symbol]!;
      const read = evaluateTitanPositioning(data);
      const conviction = row.conviction;
      const rank = convictionRankScore(row.score, conviction, row.persistenceWeeks);
      return { row, rank, conviction };
    })
    .filter((e) => e.row.status === "live");

  const strongestLongs = enriched
    .filter((e) => e.row.score > 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 5)
    .map((e, i) => ({
      market: e.row.market,
      score: e.row.score,
      conviction: e.conviction,
      regime: e.row.regime,
      rank: i + 1,
    }));

  const strongestShorts = enriched
    .filter((e) => e.row.score < 0)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 5)
    .map((e, i) => ({
      market: e.row.market,
      score: e.row.score,
      conviction: e.conviction,
      regime: e.row.regime,
      rank: i + 1,
    }));

  return {
    liveCount,
    totalMarkets,
    regimeCards,
    commercialDominancePct,
    extremeMarketsCount: extremeCount,
    strongestLongs,
    strongestShorts,
  };
}
