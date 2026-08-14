import type { SeasonalCurvePoint, SeasonalityResult } from "../types";
import type { YearsLookback } from "../yearsLookback";
import { lookbackLabel } from "../yearsLookback";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type SeasonaxChartRow = {
  offset: number;
  /** Sparse month tick label (empty for in-between days). */
  tick: string;
  /** Always available for tooltip. */
  monthLabel: string;
  index: number;
};

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatSeasonaxDate(iso: string): string {
  const d = parseIso(iso);
  const day = d.getDate();
  const mon = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${mon} ${year}`;
}

/** Historical sample window shown in Seasonax-style titles. */
export function seasonaxSampleRange(
  asOfDate: string,
  lookback: YearsLookback,
): { startIso: string; endIso: string; startLabel: string; endLabel: string } {
  const end = parseIso(asOfDate);
  const start = new Date(end);
  if (lookback === "ALL") {
    start.setFullYear(start.getFullYear() - 20);
  } else {
    start.setFullYear(start.getFullYear() - lookback);
  }
  const startIso = start.toISOString().slice(0, 10);
  return {
    startIso,
    endIso: asOfDate,
    startLabel: formatSeasonaxDate(startIso),
    endLabel: formatSeasonaxDate(asOfDate),
  };
}

export function seasonaxChartTitle(
  marketLabel: string,
  lookback: YearsLookback,
  asOfDate: string,
): string {
  const range = seasonaxSampleRange(asOfDate, lookback);
  const period = lookback === "ALL" ? "Max History" : lookbackLabel(lookback);
  return `Seasonal Trend of ${marketLabel} Over ${period} (${range.startLabel} - ${range.endLabel})`;
}

/**
 * Seasonax-style path: average seasonal index starting at 100,
 * ~12 months forward from today (trading-day resolution).
 */
export function buildSeasonaxChartRows(result: SeasonalityResult): SeasonaxChartRow[] {
  const curve: SeasonalCurvePoint[] =
    result.rollingProjections?.[60] ??
    result.rollingProjections?.[90] ??
    result.rollingProjections?.[30] ??
    result.momentumAdjustedCurve ??
    [];

  if (curve.length < 2) return [];

  const sorted = [...curve].sort((a, b) => (a.tradingDayOffset ?? 0) - (b.tradingDayOffset ?? 0));
  const rows: SeasonaxChartRow[] = [];
  let lastMonth = -1;

  for (const p of sorted) {
    const offset = p.tradingDayOffset ?? 0;
    const month = p.month;
    const monthLabel = MONTHS[month - 1] ?? "";
    const showTick = month !== lastMonth;
    if (showTick) lastMonth = month;

    rows.push({
      offset,
      tick: showTick ? monthLabel : "",
      monthLabel,
      index: p.value > 0 ? p.value : p.smoothed,
    });
  }

  // Force first point to 100 (Seasonax convention).
  if (rows.length && rows[0].index !== 0) {
    const base = rows[0].index || 100;
    if (Math.abs(base - 100) > 0.01) {
      for (const row of rows) {
        row.index = (row.index / base) * 100;
      }
    } else {
      rows[0].index = 100;
    }
  }

  return rows;
}

export function seasonaxYDomain(rows: SeasonaxChartRow[]): [number, number] {
  if (!rows.length) return [100, 110];
  const vals = rows.map((r) => r.index);
  const min = Math.min(...vals, 100);
  const max = Math.max(...vals, 100);
  const pad = Math.max(1, (max - min) * 0.08);
  const lo = Math.floor((min - pad) / 2) * 2;
  const hi = Math.ceil((max + pad) / 2) * 2;
  return [Math.min(lo, 100), Math.max(hi, 102)];
}
