import type { SeasonalCurvePoint, SeasonalityResult } from "../types";
import type { YearsLookback } from "../yearsLookback";
import { lookbackLabel } from "../yearsLookback";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type SeasonaxChartRow = {
  /** Trading-day index within the seasonal year (1 ≈ early Jan). */
  tdy: number;
  /** Trading-day index used for manual-window persistence (same scale as curve). */
  dayOfYear: number;
  /** Sparse month tick (Jan…Dec) at real calendar month starts. */
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

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMonthDay(iso: string): string {
  const d = parseIso(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/**
 * Weekday trading calendar for a year (Mon–Fri). Used so chart month ticks
 * and tooltip dates follow the real calendar, not equal 21-TD buckets.
 */
function weekdayCalendar(year: number): string[] {
  const out: string[] = [];
  const d = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  while (d <= end) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) out.push(toIso(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function calendarIndexForDate(calendar: string[], iso: string): number {
  const exact = calendar.indexOf(iso);
  if (exact >= 0) return exact;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < calendar.length; i++) {
    const dist = Math.abs(parseIso(calendar[i]!).getTime() - parseIso(iso).getTime());
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
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
 * Month ticks + tooltip dates use a real weekday calendar for asOf year.
 */
export function buildSeasonaxChartRows(result: SeasonalityResult): SeasonaxChartRow[] {
  const curve = pickCalendarCurve(result);
  if (curve.length < 2) return [];

  const asOfYear = parseIso(result.currentDate).getFullYear();
  const calendar = weekdayCalendar(asOfYear);
  if (!calendar.length) return [];

  const todayCalIdx = calendarIndexForDate(calendar, result.currentDate);
  const todayLabel = formatMonthDay(result.currentDate);

  const rows: SeasonaxChartRow[] = [];
  let lastMonth = -1;

  for (let i = 0; i < curve.length; i++) {
    const p = curve[i]!;
    // Map curve index onto weekday calendar (curve is typically ~252 TD).
    const calIdx =
      curve.length <= 1
        ? 0
        : Math.round((i / (curve.length - 1)) * (calendar.length - 1));
    const iso = calendar[Math.min(calendar.length - 1, Math.max(0, calIdx))]!;
    const d = parseIso(iso);
    const month = d.getMonth() + 1;
    const monthLabel = MONTHS[month - 1] ?? "";
    const showTick = month !== lastMonth;
    if (showTick) lastMonth = month;
    const raw = p.value > 0 ? p.value : p.smoothed;
    const tdy = (p.tradingDayOffset ?? p.dayOfYear - 1) + 1;

    rows.push({
      tdy,
      dayOfYear: p.dayOfYear,
      tick: showTick ? monthLabel : "",
      monthLabel,
      dateLabel: formatMonthDay(iso),
      month,
      index: raw,
      isToday: calIdx === todayCalIdx,
    });
  }

  // Rebase so January/start = 100 (Seasonax convention).
  const base = rows[0]?.index || 100;
  if (base > 0 && Math.abs(base - 100) > 0.001) {
    for (const row of rows) row.index = (row.index / base) * 100;
  } else if (rows[0]) {
    rows[0].index = 100;
  }

  // Ensure exactly one today marker (nearest calendar slot).
  if (!rows.some((r) => r.isToday)) {
    let best = 0;
    let bestDist = Infinity;
    const target =
      curve.length <= 1 ? 0 : (todayCalIdx / Math.max(1, calendar.length - 1)) * (curve.length - 1);
    for (let i = 0; i < rows.length; i++) {
      const dist = Math.abs(i - target);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    rows.forEach((r, i) => {
      r.isToday = i === best;
    });
  }

  for (const row of rows) {
    if (row.isToday) row.dateLabel = todayLabel;
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
