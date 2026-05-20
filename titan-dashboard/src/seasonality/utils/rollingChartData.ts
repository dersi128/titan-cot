import type { SeasonalCurvePoint, SeasonalityResult, RollingWindowDays } from "../types";

export const ROLLING_CHART_KEYS: Record<RollingWindowDays, string> = {
  30: "roll30",
  60: "roll60",
  90: "roll90",
};

export const ROLLING_CHART_COLORS: Record<RollingWindowDays, string> = {
  30: "#22D3EE",
  60: "#D4AF37",
  90: "#B48CFF",
};

export const CURRENT_YEAR_CHART_KEY = "currentYear";
export const CURRENT_YEAR_LINE_COLOR = "#F5F5F4";

export const ROLLING_CHART_ORDER: RollingWindowDays[] = [30, 60, 90];

export type RollingChartRow = {
  offsetLabel: string;
  tradingDayOffset: number;
  isToday: boolean;
  monthReturnPct?: number | null;
  [key: string]: string | number | boolean | null | undefined;
};

function curveToOffsetMap(curve: SeasonalCurvePoint[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const p of curve) {
    const off = p.tradingDayOffset ?? 0;
    map.set(off, p.smoothed);
  }
  return map;
}

export function buildRollingChartRows(result: SeasonalityResult): RollingChartRow[] {
  const offsets = new Set<number>();

  for (const w of ROLLING_CHART_ORDER) {
    const curve = result.rollingProjections?.[w] ?? [];
    for (const p of curve) offsets.add(p.tradingDayOffset ?? 0);
  }

  for (const p of result.currentYearCurve ?? []) {
    offsets.add(p.tradingDayOffset ?? 0);
  }

  for (const ev of result.seasonalEvents ?? []) {
    if (Math.abs(ev.tdyOffset) <= 90) offsets.add(ev.tdyOffset);
  }

  const sorted = [...offsets].sort((a, b) => a - b);
  if (!sorted.length) return [];

  const rollMaps = Object.fromEntries(
    ROLLING_CHART_ORDER.map((w) => [
      w,
      curveToOffsetMap(result.rollingProjections?.[w] ?? []),
    ]),
  ) as Record<RollingWindowDays, Map<number, number>>;

  const cyMap = curveToOffsetMap(result.currentYearCurve ?? []);
  const monthly = result.currentYearMonthlyReturns ?? [];

  return sorted.map((off) => {
    const row: RollingChartRow = {
      offsetLabel: off === 0 ? "T+0" : off > 0 ? `T+${off}` : `T${off}`,
      tradingDayOffset: off,
      isToday: off === 0,
    };
    for (const w of ROLLING_CHART_ORDER) {
      const v = rollMaps[w].get(off);
      row[ROLLING_CHART_KEYS[w]] = v ?? null;
    }
    row[CURRENT_YEAR_CHART_KEY] = cyMap.get(off) ?? null;
    return row;
  });
}

export function rollingWindowLabel(w: RollingWindowDays): string {
  return `${w}D`;
}
