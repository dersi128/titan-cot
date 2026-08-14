import type { SeasonalityComparison } from "../services/seasonalityService";
import type { SeasonalCurvePoint, SeasonalityResult, RollingWindowDays } from "../types";
import {
  CHART_LOOKBACK_ORDER,
  CURRENT_YEAR_CHART_KEY,
  lookbackChartKey,
  MONTHS,
  seasonalCurveToMonthlyValues,
  type SeasonalityChartRow,
} from "./chartData";
import {
  ROLLING_CHART_KEYS,
  ROLLING_CHART_ORDER,
} from "./rollingChartData";

const TRADING_DAYS_PER_MONTH = 21;

/** Shared 0–100 scale across every series on the chart. */
export function normalizeTogether(
  series: Record<string, (number | null)[]>,
): Record<string, (number | null)[]> {
  const nums: number[] = [];
  for (const arr of Object.values(series)) {
    for (const v of arr) {
      if (typeof v === "number" && !Number.isNaN(v)) nums.push(v);
    }
  }
  if (!nums.length) return series;

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;

  const out: Record<string, (number | null)[]> = {};
  for (const [key, arr] of Object.entries(series)) {
    out[key] = arr.map((v) =>
      typeof v === "number" && !Number.isNaN(v) ? ((v - min) / span) * 100 : null,
    );
  }
  return out;
}

export type ForwardMonthSlot = {
  /** Axis label (may include next-year marker). */
  month: string;
  /** 1–12 calendar month. */
  calMonth: number;
  /** Offset from current month (0 = today month). */
  offset: number;
  isCurrent: boolean;
  wrapsNextYear: boolean;
};

/** 12 months starting at current month → into next year. */
export function buildForwardMonthSlots(currentMonth: number): ForwardMonthSlot[] {
  return Array.from({ length: 12 }, (_, offset) => {
    const calMonth = ((currentMonth - 1 + offset) % 12) + 1;
    const wrapsNextYear = currentMonth - 1 + offset >= 12;
    const base = MONTHS[calMonth - 1];
    return {
      month: wrapsNextYear ? `${base}→` : base,
      calMonth,
      offset,
      isCurrent: offset === 0,
      wrapsNextYear,
    };
  });
}

function liveOnForwardAxis(
  liveByCalMonth: (number | null)[],
  slots: ForwardMonthSlot[],
): (number | null)[] {
  return slots.map((slot) => {
    if (slot.offset === 0) return liveByCalMonth[slot.calMonth - 1] ?? null;
    return null;
  });
}

function monthlyFromLiveCurve(curve: SeasonalCurvePoint[], throughMonth: number): (number | null)[] {
  const byMonth = Array.from({ length: 12 }, () => null as number | null);
  for (const p of curve) {
    if (p.month <= throughMonth) {
      byMonth[p.month - 1] = p.value;
    }
  }
  let last: number | null = null;
  return byMonth.map((v, i) => {
    if (i + 1 > throughMonth) return null;
    if (v !== null) last = v;
    return v ?? last;
  });
}

function projectionValueAtOffset(curve: SeasonalCurvePoint[], offset: number): number {
  const exact = curve.find((p) => p.tradingDayOffset === offset);
  if (exact) return exact.value;
  const sorted = [...curve].sort((a, b) => (a.tradingDayOffset ?? 0) - (b.tradingDayOffset ?? 0));
  let prev = sorted[0];
  for (const p of sorted) {
    if ((p.tradingDayOffset ?? 0) >= offset) {
      if (!prev) return p.value;
      const span = (p.tradingDayOffset ?? 0) - (prev.tradingDayOffset ?? 0) || 1;
      const t = (offset - (prev.tradingDayOffset ?? 0)) / span;
      return prev.value + t * (p.value - prev.value);
    }
    prev = p;
  }
  return prev?.value ?? 100;
}

/**
 * Full 12-month forward projection from current month into next year.
 */
export function anchoredProjectionForward12(
  projection: SeasonalCurvePoint[],
  liveAnchor: number,
): (number | null)[] {
  const months = Array.from({ length: 12 }, () => null as number | null);
  if (!projection.length || liveAnchor <= 0) return months;

  const base = projectionValueAtOffset(projection, 0);
  if (base <= 0) return months;

  for (let offset = 0; offset < 12; offset++) {
    const forwardDays = offset * TRADING_DAYS_PER_MONTH;
    const projected = projectionValueAtOffset(projection, forwardDays);
    months[offset] = liveAnchor * (projected / base);
  }
  months[0] = liveAnchor;
  return months;
}

/** Historical seasonal values remapped onto forward 12-month axis. */
function historicalOnForwardAxis(
  monthlySeasonal: number[],
  slots: ForwardMonthSlot[],
): (number | null)[] {
  return slots.map((slot) => monthlySeasonal[slot.calMonth - 1] ?? null);
}

export function buildInstitutionalChartRows(
  result: SeasonalityResult,
  comparison: SeasonalityComparison,
  currentMonth: number,
): SeasonalityChartRow[] {
  const slots = buildForwardMonthSlots(currentMonth);
  const raw: Record<string, (number | null)[]> = {};

  for (const lb of CHART_LOOKBACK_ORDER) {
    const res = comparison[lb];
    if (!res) continue;
    const monthly = seasonalCurveToMonthlyValues(res.seasonalCurve);
    raw[lookbackChartKey(lb)] = historicalOnForwardAxis(monthly, slots);
  }

  const liveRaw = monthlyFromLiveCurve(result.currentYearCurve, currentMonth);
  raw[CURRENT_YEAR_CHART_KEY] = liveOnForwardAxis(liveRaw, slots);

  const liveAnchor = liveRaw[currentMonth - 1] ?? 100;

  for (const w of ROLLING_CHART_ORDER) {
    const proj = result.rollingProjections?.[w] ?? [];
    raw[ROLLING_CHART_KEYS[w]] = anchoredProjectionForward12(proj, liveAnchor);
  }

  const normalized = normalizeTogether(raw);
  const monthly = result.currentYearMonthlyReturns ?? [];

  return slots.map((slot, i) => {
    const row: SeasonalityChartRow = {
      month: slot.month,
      monthIndex: slot.calMonth,
      isCurrent: slot.isCurrent,
      monthReturnPct: slot.offset === 0 ? (monthly[slot.calMonth - 1]?.pct ?? null) : null,
    };
    for (const [key, values] of Object.entries(normalized)) {
      row[key] = values[i] ?? null;
    }
    const hist10 = normalized[lookbackChartKey(10)]?.[i];
    const live = normalized[CURRENT_YEAR_CHART_KEY]?.[i];
    if (typeof hist10 === "number" && typeof live === "number") {
      row.seasonalIndex = live - hist10;
    } else {
      row.seasonalIndex = null;
    }
    return row;
  });
}

export function windowsForMonthlyChart(comparison: SeasonalityComparison): SeasonalityResult["bullishWindows"] {
  const ref = comparison[10];
  if (!ref) return [];
  return ref.bullishWindows?.length ? ref.bullishWindows : [];
}

export function bearishWindowsForMonthlyChart(comparison: SeasonalityComparison): SeasonalityResult["bearishWindows"] {
  const ref = comparison[10];
  if (!ref) return [];
  return ref.bearishWindows ?? [];
}
