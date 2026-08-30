import type { CotDashboardData, CotHistoryPoint, CotVerdict } from "../types";
import {
  buildPlainEnglishExplanation,
  calculateCotIndexAgainstPrior,
  computeUnifiedCotScore,
  type CommercialBias,
  type InstitutionalDivergence,
  type RetailContrarian,
} from "./titanCotScoringCore";

/** Visible CFTC weeks in the market-detail time machine. */
export const TIME_MACHINE_WEEKS = 13;

const IDX_HI = 80;
const IDX_LO = 20;

export type CotWeekSnapshotRow = {
  reportDate: string;
  commercialNet: number;
  weeklyChange: number;
  index26w: number;
  score: number;
  verdict: CotVerdict;
  isLatest: boolean;
};

function normalizeReportDate(value: string): string {
  return value.slice(0, 10);
}

function sortHistoryAsc(history: CotHistoryPoint[]): CotHistoryPoint[] {
  return history
    .map((point) => ({
      reportDate: normalizeReportDate(point.reportDate),
      commercialNet: Number(point.commercialNet),
      nonCommercialNet: Number(point.nonCommercialNet),
      retailNet: Number(point.retailNet),
    }))
    .filter((point) => point.reportDate.length >= 10)
    .sort((a, b) => a.reportDate.localeCompare(b.reportDate));
}

function lagDelta(
  history: CotHistoryPoint[],
  key: "commercialNet" | "nonCommercialNet" | "retailNet",
  lagWeeks: number,
): number {
  if (history.length <= lagWeeks) return 0;
  return history[history.length - 1]![key] - history[history.length - 1 - lagWeeks]![key];
}

function getCommercialBias(index26w: number): CommercialBias {
  if (index26w > IDX_HI) return "bullish";
  if (index26w < IDX_LO) return "bearish";
  return "neutral";
}

function getInstitutionalDivergence(
  commercialWeeklyChange: number,
  nonCommercialWeeklyChange: number,
): InstitutionalDivergence {
  if (commercialWeeklyChange > 0 && nonCommercialWeeklyChange < 0) return "bullish";
  if (commercialWeeklyChange < 0 && nonCommercialWeeklyChange > 0) return "bearish";
  return "none";
}

function getRetailContrarianSignal(
  commercialBias: CommercialBias,
  retailIndex26w: number,
): RetailContrarian {
  if (commercialBias === "bullish" && retailIndex26w < IDX_LO) return "bullish";
  if (commercialBias === "bearish" && retailIndex26w > IDX_HI) return "bearish";
  return "none";
}

function groupSnapshot(
  history: CotHistoryPoint[],
  key: "commercialNet" | "nonCommercialNet" | "retailNet",
) {
  const latest = history[history.length - 1]!;
  const nets = history.map((point) => point[key]);
  return {
    net: latest[key],
    index26w: calculateCotIndexAgainstPrior(nets, 26),
    index52w: calculateCotIndexAgainstPrior(nets, 52),
    weeklyChange: lagDelta(history, key, 1),
    delta4w: lagDelta(history, key, 4),
    delta13w: lagDelta(history, key, 13),
  };
}

/**
 * Rebuild the full dashboard payload as if `history` ended on its last row.
 * Same index / delta / bias rules as the API (`cotGold.buildDashboardOutput`).
 */
export function rebuildCotDashboardFromHistory(
  template: CotDashboardData,
  history: CotHistoryPoint[],
): CotDashboardData | null {
  const series = sortHistoryAsc(history);
  if (series.length === 0) return null;

  const latest = series[series.length - 1]!;
  const commercials = groupSnapshot(series, "commercialNet");
  const nonCommercials = groupSnapshot(series, "nonCommercialNet");
  const retail = groupSnapshot(series, "retailNet");

  const commercialBias = getCommercialBias(commercials.index26w);
  const nonCommercialDivergence = getInstitutionalDivergence(
    commercials.weeklyChange,
    nonCommercials.weeklyChange,
  );
  const retailSignal = getRetailContrarianSignal(commercialBias, retail.index26w);

  const scoring = computeUnifiedCotScore({
    commercials: {
      index26w: commercials.index26w,
      index52w: commercials.index52w,
      weeklyChange: commercials.weeklyChange,
      delta4w: commercials.delta4w,
      delta13w: commercials.delta13w,
      bias: commercialBias,
    },
    nonCommercials: {
      weeklyChange: nonCommercials.weeklyChange,
      divergence: nonCommercialDivergence,
    },
    retail: {
      index26w: retail.index26w,
      index52w: retail.index52w,
      contrarianSignal: retailSignal,
    },
    history: series,
  });

  const plainEnglishExplanation = buildPlainEnglishExplanation({
    marketLabel: template.market,
    futuresSymbol: template.futuresSymbol,
    reportDate: latest.reportDate,
    commercialBias,
    retailContrarian: retailSignal,
    nonCommercialDivergence,
    result: scoring,
  });

  return {
    market: template.market,
    futuresSymbol: template.futuresSymbol,
    cftcMarketName: template.cftcMarketName,
    symbol: template.symbol,
    reportDate: latest.reportDate,
    commercials: {
      ...commercials,
      bias: commercialBias,
    },
    nonCommercials: {
      ...nonCommercials,
      divergence: nonCommercialDivergence,
    },
    retail: {
      ...retail,
      contrarianSignal: retailSignal,
    },
    cotScore: scoring.score,
    cotVerdict: scoring.verdict,
    marketPhase: scoring.market_regime,
    plainEnglishExplanation,
    scoreComponents: scoring.components,
    history: series,
  };
}

export function rebuildCotDashboardAsOf(
  data: CotDashboardData,
  reportDate: string,
): CotDashboardData | null {
  const asOf = normalizeReportDate(reportDate);
  if (!asOf) return null;
  if (normalizeReportDate(data.reportDate) === asOf) return data;

  const history = sortHistoryAsc(data.history ?? []);
  const sliced = history.filter((point) => point.reportDate <= asOf);
  if (sliced.length === 0) return null;
  if (sliced[sliced.length - 1]!.reportDate !== asOf) return null;

  return rebuildCotDashboardFromHistory(data, sliced);
}

export function buildTimeMachineWeeks(
  data: CotDashboardData,
  weeks: number = TIME_MACHINE_WEEKS,
): CotWeekSnapshotRow[] {
  const history = sortHistoryAsc(data.history ?? []);
  if (history.length === 0) return [];

  const latestDate = normalizeReportDate(data.reportDate) || history[history.length - 1]!.reportDate;
  const window = history.slice(-Math.max(1, weeks));

  const rows: CotWeekSnapshotRow[] = [];
  for (let i = 0; i < window.length; i += 1) {
    const end = history.length - window.length + i + 1;
    const snap = rebuildCotDashboardFromHistory(data, history.slice(0, end));
    if (!snap) continue;
    rows.push({
      reportDate: snap.reportDate,
      commercialNet: snap.commercials.net,
      weeklyChange: snap.commercials.weeklyChange,
      index26w: snap.commercials.index26w,
      score: snap.cotScore,
      verdict: snap.cotVerdict,
      isLatest: snap.reportDate === latestDate,
    });
  }

  return rows.reverse();
}
