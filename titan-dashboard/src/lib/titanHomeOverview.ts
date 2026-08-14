import type { InstitutionalMarket } from "../config/institutionalMarkets";
import type { CotDashboardData } from "../types";
import {
  commercialIndexZone,
  evaluateTitanPositioning,
  type CommercialZoneId,
  type MarketRegimeId,
} from "./titanCommercialIndex";
import { convictionRankScore } from "./titanConviction";

export type HomeScannerRow = {
  market: InstitutionalMarket;
  score: number;
  conviction: number;
  persistenceWeeks: number;
  regime: MarketRegimeId;
  status: "live" | "loading" | "error";
};

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

export type WatchlistEntry = {
  market: InstitutionalMarket;
  score: number;
  conviction: number;
  regime: MarketRegimeId;
  rank: number;
};

export type HomeDmeSnapshot = {
  available: boolean;
  regime: MarketRegimeId | null;
  score: number | null;
  commercial26w: number | null;
};

export type HomeFlowSnapshot = {
  avgCommercialWeeklyChange: number | null;
  bullishMarkets: number;
  bearishMarkets: number;
};

export type HomeBreadthSnapshot = {
  bullish: number;
  bearish: number;
  neutral: number;
  liveCount: number;
  longSkewPct: number;
};

export type HomeRegimeShift = {
  market: InstitutionalMarket;
  from: CommercialZoneId;
  to: CommercialZoneId;
  tone: "bull" | "bear" | "warn";
};

export type HomeOverviewStats = {
  liveCount: number;
  totalMarkets: number;
  regimeCards: RegimeOverviewCard[];
  commercialDominancePct: number;
  extremeMarketsCount: number;
  strongestLongs: WatchlistEntry[];
  strongestShorts: WatchlistEntry[];
  dme: HomeDmeSnapshot;
  flow: HomeFlowSnapshot;
  breadth: HomeBreadthSnapshot;
  regimeShifts: HomeRegimeShift[];
};

const EMPTY_DME: HomeDmeSnapshot = {
  available: false,
  regime: null,
  score: null,
  commercial26w: null,
};

const EMPTY_FLOW: HomeFlowSnapshot = {
  avgCommercialWeeklyChange: null,
  bullishMarkets: 0,
  bearishMarkets: 0,
};

function emptyBreadth(liveCount = 0): HomeBreadthSnapshot {
  return {
    bullish: 0,
    bearish: 0,
    neutral: 0,
    liveCount,
    longSkewPct: 0,
  };
}

function isCommercial26wExtreme(index26w: number): boolean {
  const z = commercialIndexZone(index26w);
  return z === "extreme_short" || z === "extreme_long" || index26w <= 20 || index26w >= 80;
}

function zoneSide(zone: CommercialZoneId): "bull" | "bear" | "mid" {
  if (zone === "extreme_long" || zone === "strong_long" || zone === "bullish") return "bull";
  if (zone === "extreme_short" || zone === "strong_short" || zone === "bearish") return "bear";
  return "mid";
}

function isExtremeZone(zone: CommercialZoneId): boolean {
  return zone === "extreme_long" || zone === "extreme_short";
}

function shiftTone(from: CommercialZoneId, to: CommercialZoneId): "bull" | "bear" | "warn" {
  const fromSide = zoneSide(from);
  const toSide = zoneSide(to);
  if (toSide === "bull" && fromSide !== "bull") return "bull";
  if (toSide === "bear" && fromSide !== "bear") return "bear";
  return "warn";
}

function buildDmeSnapshot(bundle: Record<string, CotDashboardData>): HomeDmeSnapshot {
  const dxy = bundle["DX1!"];
  if (!dxy) return EMPTY_DME;
  const read = evaluateTitanPositioning(dxy);
  return {
    available: true,
    regime: read?.regime ?? "neutral",
    score: Number.isFinite(dxy.cotScore) ? Math.round(dxy.cotScore) : null,
    commercial26w: Number.isFinite(dxy.commercials.index26w)
      ? Math.round(dxy.commercials.index26w)
      : null,
  };
}

function buildFlowSnapshot(
  liveRows: HomeScannerRow[],
  bundle: Record<string, CotDashboardData>,
): HomeFlowSnapshot {
  const deltas: number[] = [];
  let bullishMarkets = 0;
  let bearishMarkets = 0;

  for (const row of liveRows) {
    if (row.score > 0) bullishMarkets += 1;
    else if (row.score < 0) bearishMarkets += 1;

    const delta = bundle[row.market.symbol]?.commercials.weeklyChange;
    if (typeof delta === "number" && Number.isFinite(delta)) deltas.push(delta);
  }

  return {
    avgCommercialWeeklyChange:
      deltas.length > 0
        ? Math.round(deltas.reduce((sum, v) => sum + v, 0) / deltas.length)
        : null,
    bullishMarkets,
    bearishMarkets,
  };
}

function buildBreadthSnapshot(liveRows: HomeScannerRow[]): HomeBreadthSnapshot {
  let bullish = 0;
  let bearish = 0;
  let neutral = 0;
  for (const row of liveRows) {
    if (row.score > 0) bullish += 1;
    else if (row.score < 0) bearish += 1;
    else neutral += 1;
  }
  const liveCount = liveRows.length;
  return {
    bullish,
    bearish,
    neutral,
    liveCount,
    longSkewPct: liveCount > 0 ? Math.round((bullish / liveCount) * 100) : 0,
  };
}

function buildRegimeShifts(
  liveRows: HomeScannerRow[],
  bundle: Record<string, CotDashboardData>,
): HomeRegimeShift[] {
  const shifts: Array<HomeRegimeShift & { rank: number }> = [];

  for (const row of liveRows) {
    const data = bundle[row.market.symbol];
    if (!data) continue;
    const read = evaluateTitanPositioning(data);
    if (!read || read.prevCommercialIndex === null) continue;

    const from = commercialIndexZone(read.prevCommercialIndex);
    const to = read.commercialZone;
    if (from === to) continue;

    const crossedSides = zoneSide(from) !== zoneSide(to);
    const extremeFlip = isExtremeZone(from) !== isExtremeZone(to);
    if (!crossedSides && !extremeFlip) continue;

    shifts.push({
      market: row.market,
      from,
      to,
      tone: shiftTone(from, to),
      rank: Math.abs(row.score) + row.conviction * 4,
    });
  }

  return shifts
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 4)
    .map(({ market, from, to, tone }) => ({ market, from, to, tone }));
}

/** Format commercial weekly Δ for overview cards. */
export function formatHomeFlowDelta(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const body =
    abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : String(Math.round(abs));
  if (value > 0) return `+${body}`;
  if (value < 0) return `−${body}`;
  return "0";
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
    dme: EMPTY_DME,
    flow: EMPTY_FLOW,
    breadth: emptyBreadth(),
    regimeShifts: [],
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
    dme: buildDmeSnapshot(bundle),
    flow: buildFlowSnapshot(liveRows, bundle),
    breadth: buildBreadthSnapshot(liveRows),
    regimeShifts: buildRegimeShifts(liveRows, bundle),
  };
}
