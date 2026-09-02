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
  "REVIEWED",
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

export const ASSET_CLASSES = [
  "Forex",
  "Stock",
  "Commodity",
  "Index",
  "Crypto",
  "Unknown",
] as const
export type AssetClass = (typeof ASSET_CLASSES)[number]

export const MARKET_TYPES = ["Major", "Cross", "Unknown"] as const
export type MarketType = (typeof MARKET_TYPES)[number]

export type MarketClassification = {
  symbol: string
  assetClass: AssetClass
  marketType: MarketType
  cotEnabled: boolean
}

export const PLAN_FOLLOWED_OPTIONS = ["Yes", "Partially", "No"] as const
export type PlanFollowed = (typeof PLAN_FOLLOWED_OPTIONS)[number]

export const EXECUTION_QUALITY_OPTIONS = [
  "Perfect",
  "Good",
  "Average",
  "Poor",
] as const
export type ExecutionQuality = (typeof EXECUTION_QUALITY_OPTIONS)[number]

export const EMOTIONAL_STATES = [
  "Calm",
  "Confident",
  "Hesitant",
  "Fear",
  "FOMO",
  "Frustrated",
  "Revenge",
] as const
export type EmotionalState = (typeof EMOTIONAL_STATES)[number]

export const POSITIVE_EXECUTION_TAGS = [
  "Perfect Execution",
  "Good Patience",
  "Followed Plan",
  "Correct Risk",
  "Clean Entry",
] as const

export const NEGATIVE_EXECUTION_TAGS = [
  "Early Entry",
  "Late Entry",
  "Early Exit",
  "Late Exit",
  "Moved Stop Loss",
  "Wrong Position Size",
  "Overrisk",
  "FOMO",
  "Fear",
  "Revenge Trade",
  "Impulsive Entry",
  "Wrong Trend",
  "Bad Location",
  "Invalid Zone",
  "Ignored COT",
  "Ignored News",
  "Manual Mistake",
] as const

export const EXECUTION_TAGS = [
  ...POSITIVE_EXECUTION_TAGS,
  ...NEGATIVE_EXECUTION_TAGS,
] as const
export type ExecutionTag = (typeof EXECUTION_TAGS)[number]

export const TRADE_QUALITY_OPTIONS = ["Good Trade", "Needs Review"] as const
export type TradeQuality = (typeof TRADE_QUALITY_OPTIONS)[number]

export const EXECUTION_SCORE_LABELS = [
  "Excellent",
  "Good",
  "Average",
  "Poor",
] as const
export type ExecutionScoreLabel = (typeof EXECUTION_SCORE_LABELS)[number]

export type TradeReview = {
  completed: boolean
  planFollowed: PlanFollowed | null
  setupValid: boolean | null
  wouldTakeAgain: boolean | null
  executionQuality: ExecutionQuality | null
  emotionalState?: EmotionalState | null
  tags: string[]
  learningNote?: string
  nextTimeNote?: string
  executionScore: number | null
  tradeQuality: TradeQuality | null
  reviewedAt?: string | null
}

export type Trade = {
  id: string
  createdAt: string
  date: string

  symbol: string
  assetClass: AssetClass
  marketType: MarketType
  cotEnabled: boolean

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

  cotBias: Bias | null
  cotScore: number | null
  commercialsBias: Bias | null

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

  review?: TradeReview | null
}

export type NewTradeInput = Omit<Trade, "id" | "createdAt">
