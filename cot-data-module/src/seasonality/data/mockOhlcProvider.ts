import type { OhlcBar } from "../types.js";
import type { OhlcDataProvider, OhlcFetchOptions } from "./types.js";

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SYMBOL_SEASON = {
  GOLD: { amp: 0.00035, phase: 0.2, drift: 0.00008 },
  SILVER: { amp: 0.00045, phase: 1.1, drift: 0.00005 },
  OIL: { amp: 0.00055, phase: 2.4, drift: -0.00002 },
  NATGAS: { amp: 0.0011, phase: 4.8, drift: -0.00004 },
  COCOA: { amp: 0.0006, phase: 3.6, drift: 0.00003 },
  COFFEE: { amp: 0.0005, phase: 1.8, drift: 0.00002 },
  COTTON: { amp: 0.00042, phase: 5.2, drift: 0.00001 },
  NAS100: { amp: 0.00028, phase: 0.6, drift: 0.0001 },
  AUD: { amp: 0.00022, phase: 2.1, drift: 0.00004 },
  EUR: { amp: 0.0002, phase: 3.3, drift: -0.00001 },
} as const;

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function generateMockOhlc(symbol: string, years = 15): OhlcBar[] {
  const profile = SYMBOL_SEASON[symbol as keyof typeof SYMBOL_SEASON] ?? SYMBOL_SEASON.GOLD;
  const rand = mulberry32(hashSeed(symbol));
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - years);

  let close = symbol === "NATGAS" ? 3.5 : symbol === "OIL" ? 72 : symbol === "GOLD" ? 1280 : 100;
  const bars: OhlcBar[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    if (isWeekday(cursor)) {
      const t = cursor.getTime() / 86400000;
      const seasonal =
        profile.amp * Math.sin((2 * Math.PI * t) / 365.25 + profile.phase) + profile.drift;
      const shock = (rand() - 0.5) * 0.018;
      const dailyRet = seasonal + shock;
      const open = close;
      close = Math.max(0.01, close * (1 + dailyRet));
      const wick = Math.abs(dailyRet) * close * (0.4 + rand() * 0.8);
      const high = Math.max(open, close) + wick;
      const low = Math.min(open, close) - wick;

      bars.push({
        date: formatDate(cursor),
        open: Number(open.toFixed(4)),
        high: Number(Math.max(high, 0.01).toFixed(4)),
        low: Number(Math.max(low, 0.01).toFixed(4)),
        close: Number(close.toFixed(4)),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return bars;
}

export const mockOhlcProvider: OhlcDataProvider = {
  id: "mock",
  label: "Mock OHLC (synthetic daily)",
  async fetchDailyOHLC(symbol: string, options?: OhlcFetchOptions): Promise<OhlcBar[]> {
    const years = options?.years ?? 15;
    return generateMockOhlc(symbol, years);
  },
};
