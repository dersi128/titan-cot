/** Zone markers for Commercial Index display (fixed). */

export type CotIndexZoneThresholds = {
  extremeLow: number;
  lowExtreme: number;
  neutralLow: number;
  neutralHigh: number;
  highExtreme: number;
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

export type CotIndexBandId =
  | "extreme_low"
  | "bearish_extreme"
  | "neutral"
  | "bullish_extreme"
  | "extreme_high";

export function getCotIndexZoneThresholds(): CotIndexZoneThresholds {
  return { ...DEFAULT_COT_INDEX_ZONE_THRESHOLDS };
}

export function commercialIndexBand(
  index: number,
  thresholds: CotIndexZoneThresholds = DEFAULT_COT_INDEX_ZONE_THRESHOLDS,
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
