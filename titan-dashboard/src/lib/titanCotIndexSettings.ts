/**
 * Configurable Commercial COT Index zone thresholds (localSettings).
 * Index itself is unbounded vs prior lookback min/max — not a percentage.
 */

export type CotIndexZoneThresholds = {
  /** index <= this → EXTREME LOW */
  extremeLow: number;
  /** Soft marker (default 0) — chart / UI guides */
  lowExtreme: number;
  /** Below this (and above extremeLow) → LOW / BEARISH EXTREME */
  neutralLow: number;
  /** Above this (and below extremeHigh) → HIGH / BULLISH EXTREME */
  neutralHigh: number;
  /** Soft marker (default 100) — chart / UI guides */
  highExtreme: number;
  /** index >= this → EXTREME HIGH */
  extremeHigh: number;
};

export const DEFAULT_COT_INDEX_ZONE_THRESHOLDS: CotIndexZoneThresholds = {
  extremeLow: -20,
  lowExtreme: 0,
  neutralLow: 20,
  neutralHigh: 80,
  highExtreme: 100,
  extremeHigh: 120,
};

const STORAGE_KEY = "titan.cotIndexZones.v1";

export type CotIndexBandId =
  | "extreme_low"
  | "bearish_extreme"
  | "neutral"
  | "bullish_extreme"
  | "extreme_high";

type Listener = () => void;

let cached: CotIndexZoneThresholds | null = null;
const listeners = new Set<Listener>();

function sanitize(raw: Partial<CotIndexZoneThresholds> | null | undefined): CotIndexZoneThresholds {
  const d = DEFAULT_COT_INDEX_ZONE_THRESHOLDS;
  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : fallback;
  const next: CotIndexZoneThresholds = {
    extremeLow: num(raw?.extremeLow, d.extremeLow),
    lowExtreme: num(raw?.lowExtreme, d.lowExtreme),
    neutralLow: num(raw?.neutralLow, d.neutralLow),
    neutralHigh: num(raw?.neutralHigh, d.neutralHigh),
    highExtreme: num(raw?.highExtreme, d.highExtreme),
    extremeHigh: num(raw?.extremeHigh, d.extremeHigh),
  };
  // Keep ordering sane if user enters inverted values
  if (next.neutralLow > next.neutralHigh) {
    const tmp = next.neutralLow;
    next.neutralLow = next.neutralHigh;
    next.neutralHigh = tmp;
  }
  if (next.extremeLow > next.neutralLow) next.extremeLow = next.neutralLow;
  if (next.extremeHigh < next.neutralHigh) next.extremeHigh = next.neutralHigh;
  return next;
}

export function getCotIndexZoneThresholds(): CotIndexZoneThresholds {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cached = sanitize(JSON.parse(raw) as Partial<CotIndexZoneThresholds>);
      return cached;
    }
  } catch {
    /* ignore */
  }
  cached = { ...DEFAULT_COT_INDEX_ZONE_THRESHOLDS };
  return cached;
}

export function setCotIndexZoneThresholds(next: Partial<CotIndexZoneThresholds>): CotIndexZoneThresholds {
  const merged = sanitize({ ...getCotIndexZoneThresholds(), ...next });
  cached = merged;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
  return merged;
}

export function resetCotIndexZoneThresholds(): CotIndexZoneThresholds {
  cached = { ...DEFAULT_COT_INDEX_ZONE_THRESHOLDS };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
  return cached;
}

export function subscribeCotIndexZoneThresholds(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Band for unbounded commercial index (not clamped). */
export function commercialIndexBand(
  index: number,
  thresholds: CotIndexZoneThresholds = getCotIndexZoneThresholds(),
): CotIndexBandId {
  if (!Number.isFinite(index)) return "neutral";
  if (index <= thresholds.extremeLow) return "extreme_low";
  if (index < thresholds.neutralLow) return "bearish_extreme";
  if (index <= thresholds.neutralHigh) return "neutral";
  if (index < thresholds.extremeHigh) return "bullish_extreme";
  return "extreme_high";
}

export function commercialIndexToneClass(index: number | null | undefined): string {
  if (index === null || index === undefined || !Number.isFinite(index)) return "text-stone-400";
  const band = commercialIndexBand(index);
  if (band === "extreme_high") return "text-emerald-300";
  if (band === "bullish_extreme") return "text-emerald-400";
  if (band === "extreme_low") return "text-rose-300";
  if (band === "bearish_extreme") return "text-rose-400";
  return "text-stone-300";
}

export function formatCommercialIndex(index: number | null | undefined): string {
  if (index === null || index === undefined || !Number.isFinite(index)) return "—";
  return String(Math.round(index));
}
