import type { Request, Response } from "express";

import { getValuationMarket, VALUATION_MARKETS } from "./valuation/markets.js";
import { computeMarketValuation, computeValuationUniverse, loadValuationMacro } from "./valuation/valuationService.js";
import { valuationCacheTtlMs } from "./valuation/valuationCache.js";

export async function handleValuationMarkets(_req: Request, res: Response): Promise<void> {
  const macro = await loadValuationMacro();
  res.json({
    markets: VALUATION_MARKETS,
    fredStatus: macro.status,
    cacheTtlMs: valuationCacheTtlMs(),
  });
}

export async function handleValuationUniverse(_req: Request, res: Response): Promise<void> {
  const payload = await computeValuationUniverse();
  res.json(payload);
}

export async function handleValuationDetail(req: Request, res: Response): Promise<void> {
  const raw = req.params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id || !getValuationMarket(id)) {
    res.status(404).json({ error: "Unknown valuation market.", markets: VALUATION_MARKETS.map((m) => m.id) });
    return;
  }
  const snapshot = await computeMarketValuation(id);
  const macro = await loadValuationMacro();
  res.json({ snapshot, fredStatus: macro.status });
}
