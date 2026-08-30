import type { CotHistoryPoint } from "../types";
import { calculateCotIndex } from "./titanCotScoringCore";

export type CotChartRangeWeeks = 13 | 26 | 52 | 156 | 260;
export type CotChartMode = "net" | "index26w" | "delta1w";

export const COT_CHART_RANGE_OPTIONS: CotChartRangeWeeks[] = [13, 26, 52, 156, 260];
export const DEFAULT_COT_CHART_RANGE: CotChartRangeWeeks = 52;
export const DEFAULT_COT_CHART_MODE: CotChartMode = "net";

export type CotHistoryChartPoint = {
  reportDate: string;
  commercialNet?: number;
  nonCommercialNet?: number;
  retailNet?: number;
  commercialIndex?: number;
  retailIndex?: number;
  commercialDelta?: number;
  nonCommercialDelta?: number;
  retailDelta?: number;
};

function sortHistoryAsc(history: CotHistoryPoint[]): CotHistoryPoint[] {
  return [...history]
    .map((point) => ({
      reportDate: String(point.reportDate ?? "").slice(0, 10),
      commercialNet: Number(point.commercialNet),
      nonCommercialNet: Number(point.nonCommercialNet),
      retailNet: Number(point.retailNet),
    }))
    .filter((point) => point.reportDate.length >= 10)
    .sort((a, b) => a.reportDate.localeCompare(b.reportDate));
}

function indexAt(
  history: CotHistoryPoint[],
  index: number,
  key: "commercialNet" | "retailNet",
): number | null {
  if (index < 26) return null;
  const prior = history.slice(index - 26, index).map((point) => point[key]);
  const current = history[index]![key];
  if (!Number.isFinite(current) || prior.some((value) => !Number.isFinite(value))) return null;
  return calculateCotIndex(prior, current);
}

function buildFullSeries(history: CotHistoryPoint[], mode: CotChartMode): CotHistoryChartPoint[] {
  if (mode === "net") {
    return history.map((point) => ({
      reportDate: point.reportDate,
      commercialNet: point.commercialNet,
      nonCommercialNet: point.nonCommercialNet,
      retailNet: point.retailNet,
    }));
  }

  if (mode === "delta1w") {
    const out: CotHistoryChartPoint[] = [];
    for (let i = 1; i < history.length; i += 1) {
      const prev = history[i - 1]!;
      const curr = history[i]!;
      out.push({
        reportDate: curr.reportDate,
        commercialDelta: curr.commercialNet - prev.commercialNet,
        nonCommercialDelta: curr.nonCommercialNet - prev.nonCommercialNet,
        retailDelta: curr.retailNet - prev.retailNet,
      });
    }
    return out;
  }

  const out: CotHistoryChartPoint[] = [];
  for (let i = 26; i < history.length; i += 1) {
    const commercialIndex = indexAt(history, i, "commercialNet");
    const retailIndex = indexAt(history, i, "retailNet");
    if (commercialIndex === null && retailIndex === null) continue;
    out.push({
      reportDate: history[i]!.reportDate,
      commercialIndex: commercialIndex ?? undefined,
      retailIndex: retailIndex ?? undefined,
    });
  }
  return out;
}

export function buildCotHistoryChart(
  history: CotHistoryPoint[] | undefined,
  rangeWeeks: CotChartRangeWeeks,
  mode: CotChartMode,
): CotHistoryChartPoint[] {
  const series = buildFullSeries(sortHistoryAsc(history ?? []), mode);
  if (series.length <= rangeWeeks) return series;
  return series.slice(-rangeWeeks);
}
