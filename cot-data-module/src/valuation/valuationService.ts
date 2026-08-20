import { fetchYahooDailyOHLC } from "../seasonality/data/yahooOhlcProvider.js";
import { fetchFredSeriesMany, isFredConfigured } from "../fredSeries.js";
import { computeValuation, toUniverseRow } from "./engine.js";
import {
  CPI_FRED,
  GDP_FRED,
  POLICY_FRED,
  USD_BROAD_INDEX_FRED,
  USD_REAL_YIELD_FRED,
  VALUATION_FRED_IDS,
  WILSHIRE_FRED,
} from "./fredCatalog.js";
import { getValuationMarket, VALUATION_MARKETS } from "./markets.js";
import type { DatedValue, ValuationInput, ValuationSnapshot, ValuationUniverseRow } from "./types.js";
import {
  getCachedDetail,
  getCachedUniverse,
  setCachedDetail,
  setCachedUniverse,
} from "./valuationCache.js";

export type MacroStatus = "ok" | "unconfigured" | "error";

export type ValuationMacro = {
  status: MacroStatus;
  cpiByCcy: Record<string, DatedValue[]>;
  policyByCcy: Record<string, DatedValue[]>;
  usdRealYield: DatedValue[];
  usdIndex: DatedValue[];
  equityBuffett: DatedValue[];
};

let macroCache: { expiresAt: number; value: ValuationMacro } | null = null;
const MACRO_TTL_MS = Number(process.env.FRED_CACHE_TTL_MS ?? 6 * 60 * 60 * 1000);

function invertCcyMap(map: Record<string, string>, series: Record<string, DatedValue[]>): Record<string, DatedValue[]> {
  const out: Record<string, DatedValue[]> = {};
  for (const [ccy, id] of Object.entries(map)) {
    const pts = series[id];
    if (pts?.length) out[ccy] = pts;
  }
  return out;
}

function buffettFromWilshireGdp(wilshire: DatedValue[], gdp: DatedValue[]): DatedValue[] {
  if (!wilshire.length || !gdp.length) return [];
  const out: DatedValue[] = [];
  let gi = 0;
  for (const w of wilshire) {
    while (gi + 1 < gdp.length && gdp[gi + 1]!.date <= w.date) gi += 1;
    const g = gdp[gi];
    if (!g || g.value <= 0 || w.value <= 0) continue;
    out.push({ date: w.date, value: w.value / g.value });
  }
  return out;
}

export async function loadValuationMacro(): Promise<ValuationMacro> {
  const now = Date.now();
  if (macroCache && macroCache.expiresAt > now) return macroCache.value;

  if (!isFredConfigured()) {
    const empty: ValuationMacro = {
      status: "unconfigured",
      cpiByCcy: {},
      policyByCcy: {},
      usdRealYield: [],
      usdIndex: [],
      equityBuffett: [],
    };
    macroCache = { expiresAt: now + MACRO_TTL_MS, value: empty };
    return empty;
  }

  try {
    const series = await fetchFredSeriesMany(VALUATION_FRED_IDS, 20);
    const value: ValuationMacro = {
      status: "ok",
      cpiByCcy: invertCcyMap(CPI_FRED, series),
      policyByCcy: invertCcyMap(POLICY_FRED, series),
      usdRealYield: series[USD_REAL_YIELD_FRED] ?? [],
      usdIndex: series[USD_BROAD_INDEX_FRED] ?? [],
      equityBuffett: buffettFromWilshireGdp(series[WILSHIRE_FRED] ?? [], series[GDP_FRED] ?? []),
    };
    macroCache = { expiresAt: now + MACRO_TTL_MS, value };
    return value;
  } catch (err) {
    console.warn("[valuation] macro load failed", err);
    const value: ValuationMacro = {
      status: "error",
      cpiByCcy: {},
      policyByCcy: {},
      usdRealYield: [],
      usdIndex: [],
      equityBuffett: [],
    };
    macroCache = { expiresAt: now + 15 * 60 * 1000, value };
    return value;
  }
}

const yahooPriceCache = new Map<string, { expiresAt: number; price: DatedValue[] }>();

async function loadPrice(yahooSymbol: string): Promise<DatedValue[]> {
  const hit = yahooPriceCache.get(yahooSymbol);
  const now = Date.now();
  if (hit && hit.expiresAt > now) return hit.price;
  const bars = await fetchYahooDailyOHLC(yahooSymbol, 20);
  const price = bars.map((b) => ({ date: b.date, value: b.close }));
  yahooPriceCache.set(yahooSymbol, { expiresAt: now + MACRO_TTL_MS, price });
  return price;
}

function toInput(market: NonNullable<ReturnType<typeof getValuationMarket>>, price: DatedValue[], macro: ValuationMacro): ValuationInput {
  return {
    market,
    price,
    cpiByCcy: macro.cpiByCcy,
    policyByCcy: macro.policyByCcy,
    usdRealYield: macro.usdRealYield,
    usdIndex: macro.usdIndex,
    equityBuffett: market.assetClass === "equity" ? macro.equityBuffett : undefined,
    withHistory: true,
  };
}

export async function computeMarketValuation(id: string): Promise<ValuationSnapshot> {
  const market = getValuationMarket(id);
  if (!market) throw new Error(`Unknown valuation market: ${id}`);
  const cached = getCachedDetail(market.id);
  if (cached) return cached;
  const [price, macro] = await Promise.all([loadPrice(market.yahooSymbol), loadValuationMacro()]);
  const snap = computeValuation(toInput(market, price, macro));
  setCachedDetail(market.id, snap);
  return snap;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i;
      i += 1;
      out[idx] = await fn(items[idx]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return out;
}

export async function computeValuationUniverse(): Promise<{
  rows: ValuationUniverseRow[];
  fredStatus: MacroStatus;
  updatedAt: string;
  errors: Record<string, string>;
}> {
  const cached = getCachedUniverse();
  if (cached) {
    return { ...cached, fredStatus: cached.fredStatus as MacroStatus, errors: {} };
  }

  const macro = await loadValuationMacro();
  const errors: Record<string, string> = {};
  const snaps = await mapPool([...VALUATION_MARKETS], 4, async (market) => {
    try {
      const cachedDetail = getCachedDetail(market.id);
      if (cachedDetail) return cachedDetail;
      const price = await loadPrice(market.yahooSymbol);
      const snap = computeValuation(toInput(market, price, macro));
      setCachedDetail(market.id, snap);
      return snap;
    } catch (err) {
      errors[market.id] = err instanceof Error ? err.message : String(err);
      return null;
    }
  });

  const rows = snaps.filter((s): s is ValuationSnapshot => s != null).map(toUniverseRow);
  rows.sort((a, b) => b.score - a.score);
  const payload = {
    rows,
    fredStatus: macro.status,
    updatedAt: new Date().toISOString(),
  };
  setCachedUniverse(payload);
  return { ...payload, errors };
}
