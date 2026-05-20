import type { Request, Response } from "express";

import { SEASONALITY_MARKETS, getSeasonalityMarket } from "./seasonality/markets.js";
import {
  fetchSeasonalityAnalysis,
  fetchSeasonalityComparison,
} from "./seasonality/services/seasonalityService.js";
import type { YearsLookback } from "./seasonality/yearsLookback.js";
import { YEARS_LOOKBACK_OPTIONS } from "./seasonality/yearsLookback.js";
import {
  getCachedComparison,
  getCachedSingle,
  setCachedComparison,
  setCachedSingle,
} from "./seasonalityCache.js";

const LOOKBACK_SET = new Set<string>(YEARS_LOOKBACK_OPTIONS.map(String));

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
  const upper = raw.toUpperCase();
  const market = getSeasonalityMarket(upper) ?? SEASONALITY_MARKETS.find((m) => m.dataSymbol === upper);
  return market?.dataSymbol ?? null;
}

export async function handleSeasonalityMarkets(_req: Request, res: Response): Promise<void> {
  res.json({
    markets: SEASONALITY_MARKETS,
    lookbacks: YEARS_LOOKBACK_OPTIONS,
    dataSource: process.env.SEASONALITY_OHLC_PROVIDER ?? "mock",
    cacheTtlMs: Number(process.env.SEASONALITY_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000),
  });
}

export async function handleSeasonalityBundle(req: Request, res: Response): Promise<void> {
  const symbol = resolveSymbol(req.params.symbol);
  if (!symbol) {
    res.status(404).json({ error: "Unknown seasonality market.", markets: SEASONALITY_MARKETS });
    return;
  }

  const cached = getCachedComparison(symbol);
  if (cached) {
    res.json({ symbol, cached: true, comparison: cached });
    return;
  }

  const comparison = await fetchSeasonalityComparison(symbol);
  setCachedComparison(symbol, comparison);
  res.json({ symbol, cached: false, comparison });
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

  const cached = getCachedSingle(symbol, lookback);
  if (cached) {
    res.json({ symbol, lookback, cached: true, result: cached });
    return;
  }

  const result = await fetchSeasonalityAnalysis(symbol, { yearsLookback: lookback });
  setCachedSingle(symbol, lookback, result);
  res.json({ symbol, lookback, cached: false, result });
}
