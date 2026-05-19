import { getCachedCotDashboard } from "./cotCache.js";
import { getCotMarketMapping, type CotMarketMapping } from "./cotMarketMap.js";
import type { CotDashboardOutput } from "./cotGold.js";

const CONCURRENCY = 4;

async function loadSymbol(symbol: string): Promise<
  | { symbol: string; ok: true; data: CotDashboardOutput }
  | { symbol: string; ok: false; message: string }
> {
  const mapping = getCotMarketMapping(symbol);
  if (!mapping) {
    return { symbol, ok: false, message: "No CFTC mapping for this symbol." };
  }

  try {
    const data = await getCachedCotDashboard(mapping.futuresSymbol);
    return { symbol: mapping.futuresSymbol, ok: true, data };
  } catch (error) {
    return {
      symbol: mapping.futuresSymbol,
      ok: false,
      message: error instanceof Error ? error.message : "Failed to load COT data",
    };
  }
}

/** Load many markets with limited parallel CFTC requests (cached per symbol). */
export async function loadCotBundle(symbols: string[]): Promise<{
  bundle: Record<string, CotDashboardOutput>;
  errors: Record<string, string>;
}> {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  const bundle: Record<string, CotDashboardOutput> = {};
  const errors: Record<string, string> = {};

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const chunk = unique.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map((sym) => loadSymbol(sym)));
    for (const r of results) {
      if (r.ok) bundle[r.symbol] = r.data;
      else errors[r.symbol] = r.message;
    }
  }

  return { bundle, errors };
}

export function symbolsFromMappings(mappings: CotMarketMapping[]): string[] {
  return mappings.map((m) => m.futuresSymbol);
}
