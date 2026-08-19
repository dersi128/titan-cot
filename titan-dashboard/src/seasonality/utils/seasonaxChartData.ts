import type { SeasonalCurvePoint, SeasonalityResult } from "../types";
import type { YearsLookback } from "../yearsLookback";
import { lookbackLabel } from "../yearsLookback";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type SeasonaxChartRow = {
  /** Trading-day index within the seasonal year (0 ≈ early Jan). */
  tdy: number;
  /** Calendar day-of-year (1–366) for manual-window persistence. */
  dayOfYear: number;
  /** Sparse month tick (Jan…Dec). */
  tick: string;
  monthLabel: string;
  /** Calendar date on the seasonal path, e.g. "19 Aug". */
  dateLabel: string;
  month: number;
  /** Cumulative seasonal index (Seasonax: start ≈ 100). */
  index: number;
  isToday: boolean;
};

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dateLabelFromDoy(dayOfYear: number, year: number): string {
  const doy = Math.max(1, Math.min(366, Math.round(dayOfYear)));
  const d = new Date(year, 0, doy);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function formatSeasonaxDate(iso: string): string {
  const d = parseIso(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function seasonaxSampleRange(
  asOfDate: string,
  lookback: YearsLookback,
): { startIso: string; endIso: string; startLabel: string; endLabel: string } {
  const end = parseIso(asOfDate);
  const start = new Date(end);
  if (lookback === "ALL") start.setFullYear(start.getFullYear() - 20);
  else start.setFullYear(start.getFullYear() - lookback);
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

function pickCalendarCurve(result: SeasonalityResult): SeasonalCurvePoint[] {
  const curve =
    result.seasonalCurve?.length
      ? result.seasonalCurve
      : result.momentumAdjustedCurve?.length
        ? result.momentumAdjustedCurve
        : [];
  return [...curve].sort((a, b) => {
    const ao = a.tradingDayOffset ?? a.dayOfYear;
    const bo = b.tradingDayOffset ?? b.dayOfYear;
    return ao - bo;
  });
}

/**
 * Seasonax calendar path: Jan → Dec, index starts at 100 at year start.
 * Pink "today" sits on the current trading day within that year.
 */
export function buildSeasonaxChartRows(result: SeasonalityResult): SeasonaxChartRow[] {
  const curve = pickCalendarCurve(result);
  if (curve.length < 2) return [];

  const todayTdy = Math.max(1, result.tradingDayOfYear ?? 1);
  const asOfYear = parseIso(result.currentDate).getFullYear();
  const rows: SeasonaxChartRow[] = [];
  let lastMonth = -1;

  for (const p of curve) {
    const tdy = (p.tradingDayOffset ?? p.dayOfYear - 1) + 1;
    const month = p.month;
    const monthLabel = MONTHS[month - 1] ?? "";
    const showTick = month !== lastMonth;
    if (showTick) lastMonth = month;
    const raw = p.value > 0 ? p.value : p.smoothed;

    rows.push({
      tdy,
      dayOfYear: p.dayOfYear,
      tick: showTick ? monthLabel : "",
      monthLabel,
      dateLabel: dateLabelFromDoy(p.dayOfYear, asOfYear),
      month,
      index: raw,
      isToday: tdy === todayTdy,
    });
  }

  // Rebase so January/start = 100 (Seasonax convention).
  const base = rows[0]?.index || 100;
  if (base > 0 && Math.abs(base - 100) > 0.001) {
    for (const row of rows) row.index = (row.index / base) * 100;
  } else if (rows[0]) {
    rows[0].index = 100;
  }

  // Ensure exactly one today marker (nearest TDY).
  if (!rows.some((r) => r.isToday)) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < rows.length; i++) {
      const dist = Math.abs(rows[i].tdy - todayTdy);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    rows.forEach((r, i) => {
      r.isToday = i === best;
    });
  }

  return rows;
}

export function seasonaxYDomain(rows: SeasonaxChartRow[]): [number, number] {
  if (!rows.length) return [99, 101];
  const vals = rows.map((r) => r.index);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(0.5, max - min);
  const pad = span * 0.15;
  const lo = min - pad;
  const hi = max + pad;
  // Nice round ticks around Seasonax-style tight index bands.
  const step = span < 3 ? 0.5 : span < 8 ? 1 : 2;
  return [Math.floor(lo / step) * step, Math.ceil(hi / step) * step];
}

export function seasonaxTodayTdy(rows: SeasonaxChartRow[]): number | null {
  return rows.find((r) => r.isToday)?.tdy ?? null;
}
