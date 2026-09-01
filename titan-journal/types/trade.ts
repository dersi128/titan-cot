export const TRADE_DIRECTIONS = ["LONG", "SHORT"] as const
export type TradeDirection = (typeof TRADE_DIRECTIONS)[number]

export const STRATEGIES = ["TITAN Swing"] as const
export type Strategy = (typeof STRATEGIES)[number]

export const ACCOUNTS = ["Personal", "Challenge", "Funded"] as const
export type Account = (typeof ACCOUNTS)[number]

export const TRADE_STATUSES = [
  "IDEA",
  "PLANNED",
  "ACTIVE",
  "CLOSED",
  "CANCELLED",
] as const
export type TradeStatus = (typeof TRADE_STATUSES)[number]

export const NEW_TRADE_STATUSES = ["IDEA", "PLANNED", "ACTIVE"] as const
export type NewTradeStatus = (typeof NEW_TRADE_STATUSES)[number]

export const TRENDS = [
  "Strong Uptrend",
  "Uptrend",
  "Correction",
  "Consolidation",
  "Transition",
  "Downtrend",
  "Strong Downtrend",
] as const
export type Trend = (typeof TRENDS)[number]

export const LOCATIONS = [
  "Top Premium",
  "Premium",
  "Mid",
  "Discount",
  "Top Discount",
] as const
export type Location = (typeof LOCATIONS)[number]

export const ZONE_TYPES = ["Supply", "Demand"] as const
export type ZoneType = (typeof ZONE_TYPES)[number]

export const ZONE_TIMEFRAMES = ["Weekly", "Daily", "16H"] as const
export type ZoneTimeframe = (typeof ZONE_TIMEFRAMES)[number]

export const TOUCH_COUNTS = ["0", "1", "2+"] as const
export type TouchCount = (typeof TOUCH_COUNTS)[number]

export const IMPULSES = ["Strong", "Normal", "Weak"] as const
export type Impulse = (typeof IMPULSES)[number]

export const BIASES = ["Bullish", "Neutral", "Bearish"] as const
export type Bias = (typeof BIASES)[number]

export const GRADES = ["A+", "A", "B+", "B"] as const
export type Grade = (typeof GRADES)[number]

export const MARKET_TYPES = ["Forex", "Unknown"] as const
export type MarketType = (typeof MARKET_TYPES)[number]

export const PAIR_CLASSES = ["Major", "Cross", "Exotic", "Unknown"] as const
export type PairClass = (typeof PAIR_CLASSES)[number]

export type MarketClassification = {
  symbol: string
  marketType: MarketType
  pairClass: PairClass
}

export type Trade = {
  id: string
  createdAt: string
  date: string

  symbol: string
  marketType: MarketType
  pairClass: PairClass

  direction: TradeDirection
  strategy: Strategy
  account: Account
  status: TradeStatus

  htfTrend: Trend
  tradeTrend: Trend
  location: Location

  zoneType: ZoneType
  zoneTimeframe: ZoneTimeframe
  original: boolean
  fresh: boolean
  touchCount: TouchCount
  hq: boolean
  impulse: Impulse
  mitigation: number

  cotBias: Bias
  cotScore: number

  seasonalityBias: Bias
  seasonalWindow: boolean

  grade: Grade

  entry: number
  stopLoss: number
  takeProfit: number
  riskPercent: number
  plannedRRR: number | null

  resultR: number | null
  pnl: number | null

  notes: string
}

export type NewTradeInput = Omit<Trade, "id" | "createdAt">
