import type { SeasonalBias, SeasonalCurvePoint, SeasonalStrength } from "../types";

export function slopeAround(points: SeasonalCurvePoint[], centerOffset: number, span = 5): number {
  const samples: number[] = [];
  for (let delta = -span; delta <= span; delta++) {
    const p = points.find((x) => x.tradingDayOffset === centerOffset + delta);
    if (p) samples.push(p.smoothed);
  }
  if (samples.length < 2) return 0;
  return (samples[samples.length - 1] - samples[0]) / samples.length;
}

export function classifyBias(slope: number): SeasonalBias {
  if (slope > 0.35) return "BULLISH";
  if (slope < -0.35) return "BEARISH";
  return "NEUTRAL";
}

export function classifyStrength(slope: number): SeasonalStrength {
  const abs = Math.abs(slope);
  if (abs >= 1.2) return "EXTREME";
  if (abs >= 0.75) return "HIGH";
  if (abs >= 0.35) return "MODERATE";
  return "LOW";
}
