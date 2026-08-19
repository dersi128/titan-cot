import type { Request, Response } from "express";

import { SEASONALITY_MARKETS, resolveSeasonalitySymbol } from "./seasonality/markets.js";
import { getConfiguredOhlcProviderId } from "./seasonality/data/ohlcProviderConfig.js";
import {
  fetchSeasonalityAnalysis,
  fetchSeasonalityComparison,
} from "./seasonality/services/seasonalityService.js";
import type { YearsLookback } from "./seasonality/yearsLookback.js";
import { YEARS_LOOKBACK_OPTIONS } from "./seasonality/yearsLookback.js";
import {
  parsePresidentialPhasesQuery,
  presidentialPhasesCacheKey,
  PRESIDENTIAL_CYCLE_PHASES,
} from "./seasonality/utils/presidentialCycle.js";
import {
  excludedYearsCacheKey,
  parseExcludedYearsQuery,
} from "./seasonality/utils/yearSelection.js";
import {
  getCachedComparison,
  getCachedSingle,
  setCachedComparison,
  setCachedSingle,
} from "./seasonalityCache.js";

const LOOKBACK_SET = new Set<string>(YEARS_LOOKBACK_OPTIONS.map(String));

function filterCacheKey(phases: ReturnType<typeof parsePresidentialPhasesQuery>, excluded: number[] | null): string {
  return `${presidentialPhasesCacheKey(phases)}|y:${excludedYearsCacheKey(excluded)}`;
}

function parseLookback(raw: unknown): YearsLookback | null {
  const v = typeof raw === "string" ? raw.toUpperCase() : "";
  if (v === "ALL") return "ALL";
  const n = Number(v);
  if (n === 5 || n === 10 || n === 15 || n === 20) return n;
  return null;
}

function resolveSymbol(param: string | string[] | undefined): string | null {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return null;
  return resolveSeasonalitySymbol(raw);
}

export async function handleSeasonalityMarkets(_req: Request, res: Response): Promise<void> {
  res.json({
    markets: SEASONALITY_MARKETS,
    lookbacks: YEARS_LOOKBACK_OPTIONS,
    presidentialCycles: PRESIDENTIAL_CYCLE_PHASES,
    dataSource: getConfiguredOhlcProviderId(),
    cacheTtlMs: Number(process.env.SEASONALITY_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000),
  });
}

export async function handleSeasonalityBundle(req: Request, res: Response): Promise<void> {
  const symbol = resolveSymbol(req.params.symbol);
  if (!symbol) {
    res.status(404).json({ error: "Unknown seasonality market.", markets: SEASONALITY_MARKETS });
    return;
  }

  const phases = parsePresidentialPhasesQuery(req.query.cycles);
  const excluded = parseExcludedYearsQuery(req.query.excludeYears);
  const cycleKey = filterCacheKey(phases, excluded);

  const cached = getCachedComparison(symbol, cycleKey);
  if (cached) {
    res.json({
      symbol,
      cached: true,
      cycles: presidentialPhasesCacheKey(phases),
      excludeYears: excludedYearsCacheKey(excluded),
      comparison: cached,
    });
    return;
  }

  const comparison = await fetchSeasonalityComparison(symbol, {
    presidentialPhases: phases,
    excludedYears: excluded,
  });
  setCachedComparison(symbol, comparison, cycleKey);
  res.json({
    symbol,
    cached: false,
    cycles: presidentialPhasesCacheKey(phases),
    excludeYears: excludedYearsCacheKey(excluded),
    comparison,
  });
}

export async function handleSeasonalitySingle(req: Request, res: Response): Promise<void> {
  const symbol = resolveSymbol(req.params.symbol);
  if (!symbol) {
    res.status(404).json({ error: "Unknown seasonality market.", markets: SEASONALITY_MARKETS });
    return;
  }

  const lookback = parseLookback(req.query.lookback) ?? 10;
  if (!LOOKBACK_SET.has(String(lookback))) {
    res.status(400).json({ error: "Invalid lookback. Use 5, 10, 15, 20, or ALL." });
    return;
  }

  const phases = parsePresidentialPhasesQuery(req.query.cycles);
  const excluded = parseExcludedYearsQuery(req.query.excludeYears);
  const cycleKey = filterCacheKey(phases, excluded);

  const cached = getCachedSingle(symbol, lookback, cycleKey);
  if (cached) {
    res.json({
      symbol,
      lookback,
      cached: true,
      cycles: presidentialPhasesCacheKey(phases),
      excludeYears: excludedYearsCacheKey(excluded),
      result: cached,
    });
    return;
  }

  const result = await fetchSeasonalityAnalysis(symbol, {
    yearsLookback: lookback,
    presidentialPhases: phases,
    excludedYears: excluded,
  });
  setCachedSingle(symbol, lookback, result, cycleKey);
  res.json({
    symbol,
    lookback,
    cached: false,
    cycles: presidentialPhasesCacheKey(phases),
    excludeYears: excludedYearsCacheKey(excluded),
    result,
  });
}
