import type { CotDashboardData, CotHistoryPoint } from "../types";
import { CFTC_LEGACY_CONTRACT_CODES, cftcLegacyCodeForSymbol } from "./cftcLegacyCodes";
import { COT_MARKET_MAPPINGS, getCotMarketMapping, type CotMarketMapping } from "./cotMarketMap";
import { rebuildCotDashboardFromHistory } from "./cotAsOfSnapshot";

const CFTC_LEGACY_FUTURES_ONLY_URL = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";
const DEFAULT_HISTORY_WEEKS = 300;
const CONCURRENCY = 4;
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_VERSION = "inclusive-0-100-v3";

const CFTC_FIELDS = [
  "report_date_as_yyyy_mm_dd",
  "cftc_contract_market_code",
  "contract_market_name",
  "commodity_name",
  "comm_positions_long_all",
  "comm_positions_short_all",
  "noncomm_positions_long_all",
  "noncomm_positions_short_all",
  "nonrept_positions_long_all",
  "nonrept_positions_short_all",
] as const;

type RawCotRow = {
  report_date_as_yyyy_mm_dd: string;
  cftc_contract_market_code?: string;
  contract_market_name?: string;
  commodity_name?: string;
  comm_positions_long_all: string;
  comm_positions_short_all: string;
  noncomm_positions_long_all: string;
  noncomm_positions_short_all: string;
  nonrept_positions_long_all: string;
  nonrept_positions_short_all: string;
};

type CacheStore = Map<string, { expiresAt: number; data: CotDashboardData }>;

function cacheStore(): CacheStore {
  const g = globalThis as typeof globalThis & { __titanCotInclusive?: CacheStore };
  if (!g.__titanCotInclusive) g.__titanCotInclusive = new Map();
  return g.__titanCotInclusive;
}

function cacheKey(symbol: string): string {
  return `${CACHE_VERSION}:${symbol.toUpperCase()}`;
}

function parsePosition(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`Invalid COT position value: ${value}`);
  return parsed;
}

function toHistoryPoint(row: RawCotRow): CotHistoryPoint {
  return {
    reportDate: String(row.report_date_as_yyyy_mm_dd ?? "").slice(0, 10),
    commercialNet: parsePosition(row.comm_positions_long_all) - parsePosition(row.comm_positions_short_all),
    nonCommercialNet: parsePosition(row.noncomm_positions_long_all) - parsePosition(row.noncomm_positions_short_all),
    retailNet: parsePosition(row.nonrept_positions_long_all) - parsePosition(row.nonrept_positions_short_all),
  };
}

async function fetchLegacyHistory(code: string, weeks: number): Promise<{ history: CotHistoryPoint[]; contractName: string }> {
  const url = new URL(CFTC_LEGACY_FUTURES_ONLY_URL);
  url.searchParams.set("$select", CFTC_FIELDS.join(","));
  url.searchParams.set("$where", `cftc_contract_market_code='${code.replace(/'/g, "''")}'`);
  url.searchParams.set("$order", "report_date_as_yyyy_mm_dd DESC");
  url.searchParams.set("$limit", String(Math.max(weeks * 6, 400)));

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`CFTC Socrata request failed: ${response.status} ${response.statusText}`);
  }
  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) throw new Error("CFTC Socrata returned a non-array response.");

  const matched = (payload as RawCotRow[]).filter(
    (row) => String(row.cftc_contract_market_code ?? "").trim() === code,
  );
  const sliced = matched.slice(0, weeks);
  const history = sliced
    .map(toHistoryPoint)
    .filter((point) => point.reportDate.length >= 10)
    .reverse();
  const contractName = sliced[0]?.contract_market_name?.trim() || "";
  return { history, contractName };
}

function emptyTemplate(mapping: CotMarketMapping, cftcMarketName: string): CotDashboardData {
  return {
    market: mapping.displayName,
    futuresSymbol: mapping.futuresSymbol,
    cftcMarketName,
    symbol: mapping.futuresSymbol,
    reportDate: "",
    commercials: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      bias: "neutral",
    },
    nonCommercials: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      divergence: "none",
    },
    retail: {
      net: 0,
      index26w: null,
      index52w: null,
      weeklyChange: 0,
      delta4w: 0,
      delta13w: 0,
      contrarianSignal: "none",
    },
    cotScore: 0,
    cotVerdict: "NEUTRAL",
    plainEnglishExplanation: "",
    history: [],
  };
}

export async function loadBranchCotDashboard(symbolOrSlug: string): Promise<CotDashboardData> {
  const mapping = getCotMarketMapping(symbolOrSlug);
  if (!mapping) throw new Error(`No COT market mapping found for ${symbolOrSlug}.`);
  const code = cftcLegacyCodeForSymbol(mapping.futuresSymbol);
  if (!code) throw new Error(`No CFTC Legacy code for ${mapping.futuresSymbol}.`);

  const key = cacheKey(mapping.futuresSymbol);
  const hit = cacheStore().get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.data;

  const { history, contractName } = await fetchLegacyHistory(code, DEFAULT_HISTORY_WEEKS);
  const rebuilt = rebuildCotDashboardFromHistory(emptyTemplate(mapping, contractName || mapping.displayName), history);
  if (!rebuilt) throw new Error(`No CFTC Legacy Futures Only rows found for ${mapping.displayName}.`);
  const data = { ...rebuilt, cftcContractMarketCode: code };

  cacheStore().set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export async function loadBranchCotBundle(symbols: string[]): Promise<{
  bundle: Record<string, CotDashboardData>;
  errors: Record<string, string>;
}> {
  const unique = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))];
  const bundle: Record<string, CotDashboardData> = {};
  const errors: Record<string, string> = {};

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const chunk = unique.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (sym) => {
        try {
          const data = await loadBranchCotDashboard(sym);
          return { symbol: data.futuresSymbol, ok: true as const, data };
        } catch (error) {
          const mapping = getCotMarketMapping(sym);
          return {
            symbol: mapping?.futuresSymbol ?? sym,
            ok: false as const,
            message: error instanceof Error ? error.message : "Failed to load COT data",
          };
        }
      }),
    );
    for (const result of results) {
      if (result.ok) bundle[result.symbol] = result.data;
      else errors[result.symbol] = result.message;
    }
  }

  return { bundle, errors };
}

export function listBranchCotMappings() {
  return COT_MARKET_MAPPINGS.map((mapping) => ({
    futuresSymbol: mapping.futuresSymbol,
    displayName: mapping.displayName,
    apiSlug: mapping.apiSlug,
    aliases: mapping.aliases,
    cftcContractMarketCode: CFTC_LEGACY_CONTRACT_CODES[mapping.futuresSymbol],
  }));
}

export const RENDER_COT_ORIGIN = "https://titan-cot.onrender.com";
