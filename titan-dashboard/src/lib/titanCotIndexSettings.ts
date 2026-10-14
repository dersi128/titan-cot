/** Zone markers for Commercial Index display (fixed). */

export type CotIndexZoneThresholds = {
  extremeLow: number;
  lowExtreme: number;
  neutralLow: number;
  neutralHigh: number;
  highExtreme: number;
  extremeHigh: number;
};

/** 0–100 standard COT index. TITAN extremes are 20/80 (Max/InsiderWeek often 25/75). */
export const DEFAULT_COT_INDEX_ZONE_THRESHOLDS: CotIndexZoneThresholds = {
  extremeLow: 0,
  lowExtreme: 20,
  neutralLow: 20,
  neutralHigh: 80,
  highExtreme: 100,
  extremeHigh: 100,
};

export type CotIndexBandId =
  | "extreme_low"
  | "bearish_extreme"
  | "neutral"
  | "bullish_extreme"
  | "extreme_high";

export function getCotIndexZoneThresholds(): CotIndexZoneThresholds {
  return { ...DEFAULT_COT_INDEX_ZONE_THRESHOLDS };
}

/** Heatmap and positioning share 20/40/60/80 on the 0–100 index. */
export function commercialIndexBand(
  index: number,
  _thresholds: CotIndexZoneThresholds = DEFAULT_COT_INDEX_ZONE_THRESHOLDS,
): CotIndexBandId {
  if (!Number.isFinite(index)) return "neutral";
  if (index < 20) return "extreme_low";
  if (index < 40) return "bearish_extreme";
  if (index <= 60) return "neutral";
  if (index <= 80) return "bullish_extreme";
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
