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

export const SEASONALITY_PAGE_MOCK = [
  {
    id: "gold",
    label: "GOLD",
    bias: "Seasonal long bias",
    window: "Feb → Aug",
    hitRate: "68%",
    tone: "bull" as const,
    curve: [38, 42, 48, 54, 58, 64, 70, 72, 68, 62, 58, 52],
  },
  {
    id: "cocoa",
    label: "COCOA",
    bias: "Seasonal weakness",
    window: "Mar → Jun",
    hitRate: "61%",
    tone: "bear" as const,
    curve: [72, 68, 62, 54, 46, 40, 36, 34, 38, 44, 50, 56],
  },
  {
    id: "ng",
    label: "NATURAL GAS",
    bias: "Q4 strength window",
    window: "Oct → Jan",
    hitRate: "64%",
    tone: "bull" as const,
    curve: [30, 28, 32, 36, 40, 44, 48, 52, 58, 64, 68, 66],
  },
  {
    id: "wheat",
    label: "WHEAT",
    bias: "Harvest pressure",
    window: "Jul → Sep",
    hitRate: "57%",
    tone: "bear" as const,
    curve: [55, 58, 54, 48, 42, 38, 35, 33, 36, 40, 44, 48],
  },
  {
    id: "crude",
    label: "CRUDE OIL",
    bias: "Summer demand lift",
    window: "May → Aug",
    hitRate: "59%",
    tone: "bull" as const,
    curve: [44, 46, 50, 54, 58, 60, 58, 55, 52, 48, 45, 42],
  },
  {
    id: "coffee",
    label: "COFFEE",
    bias: "Neutral · low edge",
    window: "Full year",
    hitRate: "52%",
    tone: "neutral" as const,
    curve: [50, 52, 48, 50, 52, 50, 48, 50, 52, 50, 48, 50],
  },
] as const;

export const DME_PAGE_MOCK = {
  headline: "Firm USD · risk-off tilt",
  sub: "Legacy COT overlay · visual module",
  metrics: HOME_DME_MOCK,
  panels: [
    { label: "EURUSD", value: "Under pressure", tone: "bear" as const },
    { label: "USDJPY", value: "Bid USD", tone: "bull" as const },
    { label: "DXY breadth", value: "62% pairs USD+", tone: "neutral" as const },
    { label: "Rate impulse", value: "Higher for longer", tone: "bear" as const },
  ],
  timeline: [48, 52, 55, 58, 62, 65, 68, 66, 64, 62, 60, 58],
} as const;
