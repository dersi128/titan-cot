import { pathToFileURL } from "node:url";

import { buildLegacyFuturesWhereClause, getCotMarketMapping, type CotMarketMapping } from "./cotMarketMap.js";
import {
  buildPlainEnglishExplanation,
  calculateCotIndex,
  computeCotScore,
  getCommercialBias,
  getInstitutionalDivergence,
  getRetailContrarianSignal,
  scoreToCotVerdict,
  type CommercialBias,
  type CotVerdict,
  type InstitutionalDivergence,
  type RetailContrarian,
} from "./cotLogicEngine.js";

const CFTC_LEGACY_FUTURES_ONLY_URL =
  "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

type RawCotRow = {
  report_date_as_yyyy_mm_dd: string;
  market_and_exchange_names: string;
  contract_market_name: string;
  commodity_name: string;
  cftc_contract_market_code?: string;
  comm_positions_long_all: string;
  comm_positions_short_all: string;
  noncomm_positions_long_all: string;
  noncomm_positions_short_all: string;
  nonrept_positions_long_all: string;
  nonrept_positions_short_all: string;
};

type CotGroupSnapshot = {
  net: number;
  index26w: number;
  index52w: number;
  weeklyChange: number;
  delta4w: number;
  delta13w: number;
};

export type CotDashboardOutput = {
  /** Display label (e.g. GOLD, Nasdaq). */
  market: string;
  futuresSymbol: string;
  /** CFTC / Socrata contract name when available. */
  cftcMarketName: string;
  /** Alias for `futuresSymbol` (backward compatible). */
  symbol: string;
  reportDate: string;
  commercials: CotGroupSnapshot & {
    bias: CommercialBias;
  };
  nonCommercials: CotGroupSnapshot & {
    divergence: InstitutionalDivergence;
  };
  retail: CotGroupSnapshot & {
    contrarianSignal: RetailContrarian;
  };
  cotScore: number;
  cotVerdict: CotVerdict;
  plainEnglishExplanation: string;
  /** Full fetched weekly series for charts (oldest → newest). */
  history: CotHistoryPoint[];
};

export type GoldCotDashboardOutput = CotDashboardOutput & {
  symbol: "GC1!";
};

type NetSeriesPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

/** Weekly net positioning — ascending by report date (oldest → newest). */
export type CotHistoryPoint = {
  reportDate: string;
  commercialNet: number;
  nonCommercialNet: number;
  retailNet: number;
};

type FetchGoldCotOptions = {
  weeks?: number;
  fetchImpl?: typeof fetch;
};

/** Weeks of CFTC rows to pull (≥52 for indices; more for 3Y/5Y charts). */
const DEFAULT_HISTORY_WEEKS = 300;

const CFTC_FIELDS = [
  "report_date_as_yyyy_mm_dd",
  "market_and_exchange_names",
  "contract_market_name",
  "commodity_name",
  "cftc_contract_market_code",
  "comm_positions_long_all",
  "comm_positions_short_all",
  "noncomm_positions_long_all",
  "noncomm_positions_short_all",
  "nonrept_positions_long_all",
  "nonrept_positions_short_all",
];

export type { CotVerdict };

export async function fetchGoldCotDashboardData(
  options: FetchGoldCotOptions = {},
): Promise<GoldCotDashboardOutput> {
  const output = await fetchCotDashboardData("GC1!", options);
  return output as GoldCotDashboardOutput;
}

export async function fetchCotDashboardData(
  symbolOrSlug: string,
  options: FetchGoldCotOptions = {},
): Promise<CotDashboardOutput> {
  const mapping = getCotMarketMapping(symbolOrSlug);

  if (!mapping) {
    throw new Error(`No COT market mapping found for ${symbolOrSlug}.`);
  }

  const weeks = options.weeks ?? DEFAULT_HISTORY_WEEKS;
  const rows = await fetchLegacyFuturesOnlyRows(mapping, weeks, options.fetchImpl ?? fetch);
  const series = rows.map(toNetSeriesPoint).sort(sortByReportDateAsc);

  if (series.length === 0) {
    throw new Error(`No CFTC Legacy Futures Only rows found for ${mapping.displayName}.`);
  }

  return buildDashboardOutput(series, mapping);
}

async function fetchLegacyFuturesOnlyRows(
  mapping: CotMarketMapping,
  weeks: number,
  fetchImpl: typeof fetch,
): Promise<RawCotRow[]> {
  const url = new URL(CFTC_LEGACY_FUTURES_ONLY_URL);
  url.searchParams.set("$select", CFTC_FIELDS.join(","));
  url.searchParams.set("$where", buildLegacyFuturesWhereClause(mapping));
  url.searchParams.set("$order", "report_date_as_yyyy_mm_dd DESC");
  url.searchParams.set("$limit", String(Math.max(weeks * 6, 400)));

  const response = await fetchImpl(url);

  if (!response.ok) {
    throw new Error(
      `CFTC Socrata request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error(`CFTC Socrata returned a non-array response for ${mapping.displayName}.`);
  }

  const rows = payload as RawCotRow[];
  return rows.filter((row) => matchesSocrataPair(row, mapping)).slice(0, weeks);
}

function normalizeSocrataLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function matchesSocrataPair(row: RawCotRow, mapping: CotMarketMapping): boolean {
  if (mapping.cftcContractMarketCode) {
    const code = row.cftc_contract_market_code == null ? "" : String(row.cftc_contract_market_code).trim();
    return code === mapping.cftcContractMarketCode;
  }

  const { socrataCommodityName: wantC, socrataContractMarketName: wantM } = mapping;
  if (!wantC || !wantM) return false;

  const commodity = normalizeSocrataLabel(row.commodity_name ?? "");
  const contract = normalizeSocrataLabel(row.contract_market_name ?? "");
  return (
    commodity === normalizeSocrataLabel(wantC) && contract === normalizeSocrataLabel(wantM)
  );
}

function toNetSeriesPoint(row: RawCotRow): NetSeriesPoint {
  return {
    reportDate: normalizeSocrataDate(row.report_date_as_yyyy_mm_dd),
    commercialNet:
      parsePosition(row.comm_positions_long_all) -
      parsePosition(row.comm_positions_short_all),
    nonCommercialNet:
      parsePosition(row.noncomm_positions_long_all) -
      parsePosition(row.noncomm_positions_short_all),
    retailNet:
      parsePosition(row.nonrept_positions_long_all) -
      parsePosition(row.nonrept_positions_short_all),
  };
}

function cftcMarketName(mapping: CotMarketMapping): string {
  return mapping.socrataContractMarketName ?? mapping.displayName;
}

function buildDashboardOutput(series: NetSeriesPoint[], mapping: CotMarketMapping): CotDashboardOutput {
  const latest = series[series.length - 1];
  const previous = series[series.length - 2];

  const commercials = buildGroupSnapshot(series, "commercialNet");
  const nonCommercials = buildGroupSnapshot(series, "nonCommercialNet");
  const retail = buildGroupSnapshot(series, "retailNet");

  const commercialWeekly = previous ? latest.commercialNet - previous.commercialNet : 0;
  const nonCommWeekly = previous ? latest.nonCommercialNet - previous.nonCommercialNet : 0;
  const retailWeekly = previous ? latest.retailNet - previous.retailNet : 0;

  const commercialBias = getCommercialBias(commercials.index26w, commercials.index52w);
  const nonCommercialDivergence = getInstitutionalDivergence(commercialWeekly, nonCommWeekly);
  const retailSignal = getRetailContrarianSignal(
    commercialBias,
    retail.index26w,
    retail.index52w,
  );

  const engineInput = {
    commercials: { ...commercials, weeklyChange: commercialWeekly },
    nonCommercials: { ...nonCommercials, weeklyChange: nonCommWeekly },
    retail: { ...retail, weeklyChange: retailWeekly },
    commercialBias,
    nonCommercialDivergence,
  };

  const cotScore = computeCotScore(engineInput);
  const cotVerdict = scoreToCotVerdict(cotScore);

  const plainEnglishExplanation = buildPlainEnglishExplanation({
    marketLabel: mapping.displayName,
    futuresSymbol: mapping.futuresSymbol,
    reportDate: latest.reportDate,
    commercialBias,
    retailContrarian: retailSignal,
    nonCommercialDivergence,
    cotScore,
    cotVerdict,
  });

  return {
    market: mapping.displayName,
    futuresSymbol: mapping.futuresSymbol,
    cftcMarketName: cftcMarketName(mapping),
    symbol: mapping.futuresSymbol,
    reportDate: latest.reportDate,
    commercials: {
      ...commercials,
      weeklyChange: commercialWeekly,
      bias: commercialBias,
    },
    nonCommercials: {
      ...nonCommercials,
      weeklyChange: nonCommWeekly,
      divergence: nonCommercialDivergence,
    },
    retail: {
      ...retail,
      weeklyChange: retailWeekly,
      contrarianSignal: retailSignal,
    },
    cotScore,
    cotVerdict,
    plainEnglishExplanation,
    history: series.map((point) => ({
      reportDate: point.reportDate,
      commercialNet: point.commercialNet,
      nonCommercialNet: point.nonCommercialNet,
      retailNet: point.retailNet,
    })),
  };
}

function buildGroupSnapshot(
  series: NetSeriesPoint[],
  key: "commercialNet" | "nonCommercialNet" | "retailNet",
): CotGroupSnapshot {
  const latest = series[series.length - 1];

  const window26 = series.slice(-26);
  const window52 = series.slice(-52);
  const nets26 = window26.map((p) => p[key]);
  const nets52 = window52.map((p) => p[key]);

  return {
    net: latest[key],
    index26w: nets26.length ? calculateCotIndex(nets26, nets26[nets26.length - 1]) : 50,
    index52w: nets52.length ? calculateCotIndex(nets52, nets52[nets52.length - 1]) : 50,
    weeklyChange: 0,
    delta4w: netLagDelta(series, key, 4),
    delta13w: netLagDelta(series, key, 13),
  };
}

function netLagDelta(
  series: NetSeriesPoint[],
  key: "commercialNet" | "nonCommercialNet" | "retailNet",
  lagWeeks: number,
): number {
  if (series.length <= lagWeeks) return 0;
  return series[series.length - 1][key] - series[series.length - 1 - lagWeeks][key];
}

function parsePosition(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid COT position value: ${value}`);
  }

  return parsed;
}

function normalizeSocrataDate(value: string): string {
  return value.slice(0, 10);
}

function sortByReportDateAsc(a: NetSeriesPoint, b: NetSeriesPoint): number {
  return a.reportDate.localeCompare(b.reportDate);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchGoldCotDashboardData()
    .then((data) => {
      console.log(JSON.stringify(data, null, 2));
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
