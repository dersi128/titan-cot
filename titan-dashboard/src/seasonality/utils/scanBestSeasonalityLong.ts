import { fetchSeasonalityAnalysisFromApi, shouldUseSeasonalityApi } from "../seasonalityApi";
import { fetchSeasonalityComparisonWithSource } from "../services/seasonalityService";
import type { SeasonalBias, SeasonalityResult, SeasonalStrength } from "../types";
import {
  presidentialPhaseForYear,
  type PresidentialCyclePhase,
} from "./presidentialCycle";
import { SEASONAL_LONG_SCAN_MARKETS } from "./seasonalLongScanUniverse";

export type SeasonalityOppPhase = "active" | "upcoming" | "next";

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
  /** Presidential cycle phase used for the seasonal average. */
  cyclePhase: PresidentialCyclePhase;
  /** active = inside · upcoming = before entry · next = after half of active */
  phase: SeasonalityOppPhase;
};

export const SEASONAL_OPP_TOP_N = 5;

const FETCH_TIMEOUT_MS = 55_000;
const CONCURRENCY = 4;
/** Home cycle ranking floor (thin presidential-cycle history). */
const MIN_SCORE = 45;
const MIN_SAMPLE_CYCLE = 4;
/** Show upcoming windows starting within this many trading days. */
const UPCOMING_HORIZON_TD = 10;
/** Mirror engine: don't treat ending/turn-date windows as actionable ACTIVE. */
const MIN_ACTIVE_DAYS_REMAINING = 3;

type ScanCache = {
  key: string;
  longs: SeasonalityOpportunity[];
  shorts: SeasonalityOpportunity[];
};

let cached: ScanCache | null = null;
let inflight: Promise<{ longs: SeasonalityOpportunity[]; shorts: SeasonalityOpportunity[] }> | null =
  null;

/** Current U.S. presidential cycle phase (by calendar year). */
export function currentPresidentialCyclePhase(asOf = new Date()): PresidentialCyclePhase {
  return presidentialPhaseForYear(asOf.getFullYear());
}

async function fetchOne(
  symbol: string,
  phases: PresidentialCyclePhase[],
): Promise<SeasonalityResult | null> {
  try {
    if (shouldUseSeasonalityApi()) {
      return await Promise.race([
        fetchSeasonalityAnalysisFromApi(symbol, 20, phases),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("timeout")), FETCH_TIMEOUT_MS);
        }),
      ]);
    }
    const { comparison } = await fetchSeasonalityComparisonWithSource(symbol, {
      presidentialPhases: phases,
    });
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

function activeProgress(we: NonNullable<SeasonalityResult["windowEngine"]>): number | null {
  const len = we.lengthTradingDays;
  if (!len || len <= 0) return null;
  if (we.daysRemaining < 0) return null;
  const elapsed = Math.max(0, Math.min(len, len - we.daysRemaining));
  return elapsed / len;
}

function makeOpp(
  m: { id: string; label: string; dataSymbol: string },
  cyclePhase: PresidentialCyclePhase,
  side: "LONG" | "SHORT",
  bias: SeasonalBias,
  strength: SeasonalStrength,
  score: number,
  winRatePct: number,
  avgReturn: number,
  alignmentLabel: string,
  windowLabel: string,
  daysUntilStart: number,
  phase: SeasonalityOppPhase,
): SeasonalityOpportunity {
  return {
    id: phase === "active" ? m.id : `${m.id}-${phase}`,
    label: m.label,
    dataSymbol: m.dataSymbol,
    side,
    bias,
    strength,
    score,
    winRate: winRatePct,
    avgReturn,
    alignmentLabel,
    windowLabel,
    daysUntilStart,
    cyclePhase,
    phase,
  };
}

/**
 * Build home-panel opportunities for one market:
 * - active window (if inside)
 * - upcoming within 10 TD (if not inside, or as "next" after half of active)
 */
function toOpps(
  m: { id: string; label: string; dataSymbol: string },
  result: SeasonalityResult,
  cyclePhase: PresidentialCyclePhase,
): SeasonalityOpportunity[] {
  const we = result.windowEngine;
  if (!we) return [];

  const out: SeasonalityOpportunity[] = [];

  const activeBull =
    we.status === "ACTIVE_BULLISH" &&
    result.seasonalBias === "BULLISH" &&
    we.score >= MIN_SCORE &&
    we.sampleSize >= MIN_SAMPLE_CYCLE &&
    we.daysRemaining >= MIN_ACTIVE_DAYS_REMAINING;
  const activeBear =
    we.status === "ACTIVE_BEARISH" &&
    result.seasonalBias === "BEARISH" &&
    we.score >= MIN_SCORE &&
    we.sampleSize >= MIN_SAMPLE_CYCLE &&
    we.daysRemaining >= MIN_ACTIVE_DAYS_REMAINING;

  if (activeBull) {
    out.push(
      makeOpp(
        m,
        cyclePhase,
        "LONG",
        "BULLISH",
        we.confidence,
        we.score,
        we.winRate * 100,
        we.avgReturn,
        we.alignmentLabel,
        we.windowLabel,
        0,
        "active",
      ),
    );
  }
  if (activeBear) {
    out.push(
      makeOpp(
        m,
        cyclePhase,
        "SHORT",
        "BEARISH",
        we.confidence,
        we.score,
        we.lossRate * 100,
        we.avgReturn,
        we.alignmentLabel,
        we.windowLabel,
        0,
        "active",
      ),
    );
  }

  const hasActive = activeBull || activeBear;
  const progress = hasActive ? activeProgress(we) : null;
  const pastHalf = progress != null && progress >= 0.5;

  const daysUntil = we.daysUntilStart ?? 0;
  const upcomingOk =
    (we.upcomingScore ?? 0) >= MIN_SCORE &&
    (we.upcomingSampleSize ?? 0) >= MIN_SAMPLE_CYCLE &&
    daysUntil >= 1 &&
    daysUntil <= UPCOMING_HORIZON_TD &&
    (we.upcomingSide === "BULLISH" || we.upcomingSide === "BEARISH") &&
    Boolean(we.upcomingLabel);

  if (!upcomingOk) return out;

  const upSide = we.upcomingSide === "BULLISH" ? "LONG" : "SHORT";
  const upBias: SeasonalBias = we.upcomingSide!;
  const upWr =
    upBias === "BULLISH"
      ? (we.upcomingWinRate ?? 0) * 100
      : (we.upcomingLossRate ?? we.upcomingWinRate ?? 0) * 100;

  // Before entry: show upcoming when no active (or status is UPCOMING_*).
  if (!hasActive) {
    out.push(
      makeOpp(
        m,
        cyclePhase,
        upSide,
        upBias,
        we.confidence,
        we.upcomingScore ?? we.score,
        upWr,
        we.upcomingAvgReturn ?? 0,
        we.alignmentLabel,
        we.upcomingLabel!,
        daysUntil,
        "upcoming",
      ),
    );
    return out;
  }

  // Past halfway of active: also surface the next window within 10 TD.
  if (pastHalf) {
    out.push(
      makeOpp(
        m,
        cyclePhase,
        upSide,
        upBias,
        we.confidence,
        we.upcomingScore ?? we.score,
        upWr,
        we.upcomingAvgReturn ?? 0,
        we.alignmentLabel,
        we.upcomingLabel!,
        daysUntil,
        "next",
      ),
    );
  }

  return out;
}

function rank(a: SeasonalityOpportunity, b: SeasonalityOpportunity): number {
  const phaseRank = (p: SeasonalityOppPhase) => (p === "active" ? 0 : p === "upcoming" ? 1 : 2);
  const align = (s: string) => {
    const m = s.match(/(\d+)\s*\/\s*(\d+)/);
    return m ? Number(m[1]) / Math.max(1, Number(m[2])) : 0;
  };
  return (
    phaseRank(a.phase) - phaseRank(b.phase) ||
    b.score - a.score ||
    align(b.alignmentLabel) - align(a.alignmentLabel) ||
    b.winRate - a.winRate ||
    Math.abs(b.avgReturn) - Math.abs(a.avgReturn)
  );
}

async function runScan(cyclePhase: PresidentialCyclePhase) {
  const phases: PresidentialCyclePhase[] = [cyclePhase];
  const settled = await mapPool(SEASONAL_LONG_SCAN_MARKETS, CONCURRENCY, async (m) => {
    const result = await fetchOne(m.dataSymbol, phases);
    if (!result?.windowEngine) return [] as SeasonalityOpportunity[];
    return toOpps(m, result, cyclePhase);
  });

  const all = settled.flat();
  const longs = all
    .filter((x) => x.side === "LONG")
    .sort(rank)
    .slice(0, SEASONAL_OPP_TOP_N);
  const shorts = all
    .filter((x) => x.side === "SHORT")
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

/**
 * Scan seasonal LONG/SHORT windows inside the current U.S. presidential cycle
 * (Election / Post / Midterm / Pre) — Seasonax-style year filter.
 */
export async function scanSeasonalOpportunities(): Promise<{
  longs: SeasonalityOpportunity[];
  shorts: SeasonalityOpportunity[];
}> {
  const cyclePhase = currentPresidentialCyclePhase();
  const key = `cycle:${cyclePhase}:v4-turn`;
  if (cached?.key === key) return { longs: cached.longs, shorts: cached.shorts };
  if (inflight) return inflight;
  inflight = runScan(cyclePhase)
    .then((rows) => {
      cached = { key, ...rows };
      return rows;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
