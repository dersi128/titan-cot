import type { OhlcBar } from "../types";

export type TradingDayRow = {
  date: string;
  year: number;
  month: number;
  close: number;
  /** 1-based trading day index within calendar year. */
  tdy: number;
  ret: number;
};

const TRADING_DAYS_PER_YEAR = 252;

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function buildTradingDaySeries(bars: OhlcBar[]): TradingDayRow[] {
  const sorted = [...bars].sort((a, b) => a.date.localeCompare(b.date));
  const rows: TradingDayRow[] = [];
  let year = -1;
  let tdy = 0;
  let prevClose = 0;

  for (const bar of sorted) {
    const d = parseIso(bar.date);
    const y = d.getFullYear();
    if (y !== year) {
      year = y;
      tdy = 0;
    }
    tdy += 1;
    const ret = prevClose > 0 && bar.close > 0 ? bar.close / prevClose - 1 : 0;
    rows.push({
      date: bar.date,
      year: y,
      month: d.getMonth() + 1,
      close: bar.close,
      tdy,
      ret,
    });
    prevClose = bar.close;
  }
  return rows;
}

export function tradingDaysPerYear(): number {
  return TRADING_DAYS_PER_YEAR;
}

export function wrapTdy(tdy: number): number {
  return ((tdy - 1) % TRADING_DAYS_PER_YEAR) + 1;
}

export function yearWeight(yearsAgo: number, halfLifeYears = 4): number {
  return Math.exp((-Math.LN2 * yearsAgo) / halfLifeYears);
}
