import type { MarketRegimeId } from "./titanCommercialIndex";
import { convictionRankScore } from "./titanConviction";
import type { TitanBiasVerdict } from "./titanCotScore";
import type { ScannerRowModel } from "./cotScannerRows";

export type ScannerSortKey =
  | "market"
  | "score"
  | "bias"
  | "verdict"
  | "comm26"
  | "retail26"
  | "regime"
  | "conviction";

export type ScannerSortDir = "asc" | "desc";

export type ScannerSortState = {
  key: ScannerSortKey;
  dir: ScannerSortDir;
};

export const DEFAULT_SCANNER_SORT_DIR: Record<ScannerSortKey, ScannerSortDir> = {
  market: "asc",
  score: "desc",
  bias: "desc",
  verdict: "desc",
  comm26: "desc",
  retail26: "desc",
  regime: "asc",
  conviction: "desc",
};

export const VERDICT_ORDER: readonly TitanBiasVerdict[] = [
  "A+ EXTREME SHORT",
  "A STRONG SHORT",
  "B SHORT",
  "WEAK SHORT",
  "NEUTRAL",
  "WEAK LONG",
  "B LONG",
  "A STRONG LONG",
  "A+ EXTREME LONG",
] as const;

function dirMul(dir: ScannerSortDir): number {
  return dir === "asc" ? 1 : -1;
}

export function compareMarketLabel(a: ScannerRowModel, b: ScannerRowModel): number {
  const byLabel = a.market.shortLabel.localeCompare(b.market.shortLabel, undefined, {
    sensitivity: "base",
  });
  if (byLabel !== 0) return byLabel;
  return a.market.symbol.localeCompare(b.market.symbol, undefined, { sensitivity: "base" });
}

function compareNullableNumber(
  a: number | null | undefined,
  b: number | null | undefined,
  dir: ScannerSortDir,
): number {
  const aMissing = a == null || !Number.isFinite(a);
  const bMissing = b == null || !Number.isFinite(b);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  if (a === b) return 0;
  return ((a as number) - (b as number)) * dirMul(dir);
}

export function defaultScannerOrder(a: ScannerRowModel, b: ScannerRowModel): number {
  const rankA = convictionRankScore(a.score, a.conviction, a.persistenceWeeks);
  const rankB = convictionRankScore(b.score, b.conviction, b.persistenceWeeks);
  if (rankB !== rankA) return rankB - rankA;
  const byAbs = Math.abs(b.score) - Math.abs(a.score);
  if (byAbs !== 0) return byAbs;
  return compareMarketLabel(a, b);
}

function compareByKey(
  a: ScannerRowModel,
  b: ScannerRowModel,
  sort: ScannerSortState,
  regimeLabel: (regime: MarketRegimeId) => string,
): number {
  switch (sort.key) {
    case "market":
      return compareMarketLabel(a, b) * dirMul(sort.dir);
    case "score":
    case "bias":
      return compareNullableNumber(a.score, b.score, sort.dir);
    case "verdict": {
      const ia = VERDICT_ORDER.indexOf(a.verdict);
      const ib = VERDICT_ORDER.indexOf(b.verdict);
      const aMissing = ia < 0;
      const bMissing = ib < 0;
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (ia === ib) return 0;
      return (ia - ib) * dirMul(sort.dir);
    }
    case "comm26":
      return compareNullableNumber(a.comm26, b.comm26, sort.dir);
    case "retail26":
      return compareNullableNumber(a.retail26, b.retail26, sort.dir);
    case "regime": {
      const la = regimeLabel(a.regime);
      const lb = regimeLabel(b.regime);
      const aMissing = !la;
      const bMissing = !lb;
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      const byLabel = la.localeCompare(lb, undefined, { sensitivity: "base" });
      if (byLabel !== 0) return byLabel * dirMul(sort.dir);
      return 0;
    }
    case "conviction":
      return compareNullableNumber(a.conviction, b.conviction, sort.dir);
  }
}

export function nextScannerSort(
  current: ScannerSortState | null,
  clicked: ScannerSortKey,
): ScannerSortState {
  if (current?.key === clicked) {
    return { key: clicked, dir: current.dir === "asc" ? "desc" : "asc" };
  }
  return { key: clicked, dir: DEFAULT_SCANNER_SORT_DIR[clicked] };
}

export function sortScannerRows(
  rows: readonly ScannerRowModel[],
  sort: ScannerSortState | null,
  regimeLabel: (regime: MarketRegimeId) => string = (regime) => regime,
): ScannerRowModel[] {
  const live = rows.filter((row) => row.status === "live");
  const rest = rows.filter((row) => row.status !== "live");

  live.sort((a, b) => {
    const primary = sort ? compareByKey(a, b, sort, regimeLabel) : defaultScannerOrder(a, b);
    if (primary !== 0) return primary;
    return compareMarketLabel(a, b);
  });
  rest.sort(compareMarketLabel);
  return [...live, ...rest];
}
