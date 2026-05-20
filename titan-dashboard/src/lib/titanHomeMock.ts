/** Visual-only mock data for HOME command center panels (no backend). */

export type FlowDirection = "inflow" | "outflow" | "mixed";

export const HOME_OVERVIEW_MOCK = {
  dme: { label: "USD firm", value: "Risk-off tilt", sub: "DXY · macro overlay" },
  regime: { label: "Global bias", value: "Distribution-led", sub: "42% markets · legacy COT" },
  flow: { label: "Net institutional", value: "−12.4", sub: "Commercial-led pressure" },
  breadth: { label: "Market breadth", value: "58 / 100", sub: "Long skew · 26W window" },
} as const;

export const HOME_DME_MOCK = {
  dxyRegime: "Firm USD",
  fxBreadth: "Narrow",
  dollarPressure: "Elevated",
  liquidityRegime: "Tightening",
} as const;

export const HOME_SEASONALITY_MOCK = [
  { id: "gold", label: "GOLD", bias: "Seasonal long bias", tone: "bull" as const, curve: [42, 48, 52, 58, 62, 68, 72, 70] },
  { id: "cocoa", label: "COCOA", bias: "Seasonal weakness", tone: "bear" as const, curve: [68, 62, 55, 48, 42, 38, 35, 32] },
  { id: "ng", label: "NAT GAS", bias: "Q4 strength window", tone: "bull" as const, curve: [28, 32, 38, 44, 52, 58, 64, 68] },
] as const;

export const HOME_REGIME_SHIFTS_MOCK = [
  { market: "COCOA", from: "Accumulation", to: "Distribution", tone: "bear" as const },
  { market: "GOLD", from: "Neutral", to: "Trending", tone: "bull" as const },
  { market: "NATGAS", from: "Transition", to: "Exhaustion", tone: "warn" as const },
] as const;

export const FLOW_MAP_CLASSES = ["forex", "metals", "indices", "energy", "softs"] as const;

export type FlowMapClassId = (typeof FLOW_MAP_CLASSES)[number];
