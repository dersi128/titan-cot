import type { CotDashboardData, CotVerdict } from "../types";
import { getCotMarketMapping } from "./cotMarketMap";

export type CotMarketWithCategory = {
  symbol: string;
  label: string;
  category: string;
};

export type CotPlatformRow = {
  market: string;
  category: string;
  futuresSymbol: string;
  commercials26w: number | null;
  commercials52w: number | null;
  retail26w: number | null;
  retail52w: number | null;
  nonCommDivergence: "bullish" | "bearish" | "none";
  weeklyChange: number | null;
  cotScore: number | null;
  verdict: CotVerdict | "—";
  status: "live" | "loading" | "error";
  errorMessage?: string;
  rank?: number;
};

export type CotScannerFilter =
  | "all"
  | "bullish"
  | "bearish"
  | "neutral"
  | "divergence"
  | "retail_extreme"
  | "commercial_extreme";

export type CotScannerSortMode =
  | "score_desc"
  | "score_asc"
  | "bullish_strength"
  | "bearish_strength"
  | "weekly_change_abs";

type ActiveFilter = Exclude<CotScannerFilter, "all">;

export function buildCotPlatformRows(
  markets: CotMarketWithCategory[],
  bundle: Record<string, CotDashboardData>,
  errors: Record<string, string>,
): CotPlatformRow[] {
  return markets.map((m) => {
    const data = bundle[m.symbol];
    if (data) {
      return {
        market: m.label,
        category: m.category,
        futuresSymbol: m.symbol,
        commercials26w: data.commercials.index26w,
        commercials52w: data.commercials.index52w,
        retail26w: data.retail.index26w,
        retail52w: data.retail.index52w,
        nonCommDivergence: data.nonCommercials.divergence,
        weeklyChange: data.commercials.weeklyChange,
        cotScore: data.cotScore,
        verdict: data.cotVerdict,
        status: "live",
      };
    }

    const mapping = getCotMarketMapping(m.symbol);
    if (!mapping) {
      return {
        market: m.label,
        category: m.category,
        futuresSymbol: m.symbol,
        commercials26w: null,
        commercials52w: null,
        retail26w: null,
        retail52w: null,
        nonCommDivergence: "none",
        weeklyChange: null,
        cotScore: null,
        verdict: "—",
        status: "error",
        errorMessage: "No CFTC mapping",
      };
    }

    if (errors[m.symbol]) {
      return {
        market: m.label,
        category: m.category,
        futuresSymbol: m.symbol,
        commercials26w: null,
        commercials52w: null,
        retail26w: null,
        retail52w: null,
        nonCommDivergence: "none",
        weeklyChange: null,
        cotScore: null,
        verdict: "—",
        status: "error",
        errorMessage: errors[m.symbol],
      };
    }

    return {
      market: m.label,
      category: m.category,
      futuresSymbol: m.symbol,
      commercials26w: null,
      commercials52w: null,
      retail26w: null,
      retail52w: null,
      nonCommDivergence: "none",
      weeklyChange: null,
      cotScore: null,
      verdict: "—",
      status: "loading",
    };
  });
}

function rowMatchesActiveFilter(row: CotPlatformRow, filter: ActiveFilter): boolean {
  if (row.status !== "live" || row.cotScore === null) {
    return false;
  }

  const score = row.cotScore;

  switch (filter) {
    case "bullish":
      return score >= 40;
    case "bearish":
      return score <= -40;
    case "neutral":
      return score > -40 && score < 40;
    case "divergence":
      return row.nonCommDivergence !== "none";
    case "retail_extreme": {
      const r = row.retail26w ?? 50;
      return r > 80 || r < 20;
    }
    case "commercial_extreme": {
      const c = row.commercials26w ?? 50;
      return c > 80 || c < 20;
    }
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export function filterCotRows(rows: CotPlatformRow[], filter: CotScannerFilter): CotPlatformRow[] {
  if (filter === "all") {
    return rows;
  }

  return rows.filter((row) => rowMatchesActiveFilter(row, filter));
}

export function sortCotRows(rows: CotPlatformRow[], mode: CotScannerSortMode): CotPlatformRow[] {
  const copy = [...rows];
  const score = (r: CotPlatformRow) => r.cotScore ?? 0;

  copy.sort((a, b) => {
    switch (mode) {
      case "score_asc":
        return score(a) - score(b);
      case "bullish_strength":
        return score(b) - score(a);
      case "bearish_strength":
        return score(a) - score(b);
      case "weekly_change_abs": {
        const da = Math.abs(a.weeklyChange ?? 0);
        const db = Math.abs(b.weeklyChange ?? 0);
        return db - da;
      }
      case "score_desc":
      default:
        return score(b) - score(a);
    }
  });

  return copy;
}

export function assignRanks(rows: CotPlatformRow[]): CotPlatformRow[] {
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
