import { classifyMarket } from "@/lib/market-classification"
import { buildTradeReview } from "@/lib/review-calculations"
import { hydrateTradePlaybookFields } from "@/lib/trade-playbook"
import {
  BIASES,
  DEFAULT_STRATEGY,
  EMOTIONAL_STATES,
  EXECUTION_QUALITY_OPTIONS,
  GRADES,
  IMPULSES,
  LOCATIONS,
  PLAN_FOLLOWED_OPTIONS,
  TOUCH_COUNTS,
  TRADE_DIRECTIONS,
  TRADE_QUALITY_OPTIONS,
  TRADE_STATUSES,
  TRENDS,
  ZONE_TIMEFRAMES,
  ZONE_TYPES,
  normalizeAccount,
  type Bias,
  type EmotionalState,
  type ExecutionQuality,
  type PlanFollowed,
  type Trade,
  type TradeQuality,
  type TradeReview,
} from "@/types/trade"

function asEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T
): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function asNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function asNullableBias(value: unknown): Bias | null {
  if (value == null) return null
  return typeof value === "string" && (BIASES as readonly string[]).includes(value)
    ? (value as Bias)
    : null
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asNullableEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

function asNullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null
}

function hydrateReview(raw: unknown): TradeReview | null {
  if (raw == null) return null
  if (typeof raw !== "object") return null

  const row = raw as Record<string, unknown>
  const planFollowed = asNullableEnum<PlanFollowed>(
    row.planFollowed,
    PLAN_FOLLOWED_OPTIONS
  )
  const setupValid = asNullableBoolean(row.setupValid)
  const wouldTakeAgain = asNullableBoolean(row.wouldTakeAgain)
  const executionQuality = asNullableEnum<ExecutionQuality>(
    row.executionQuality,
    EXECUTION_QUALITY_OPTIONS
  )
  const emotionalState = asNullableEnum<EmotionalState>(
    row.emotionalState,
    EMOTIONAL_STATES
  )
  const tags = Array.isArray(row.tags)
    ? row.tags.filter((tag): tag is string => typeof tag === "string" && tag.length > 0)
    : []
  const learningNote = asString(row.learningNote).trim()
  const nextTimeNote = asString(row.nextTimeNote).trim()

  const completedReview = buildTradeReview({
    planFollowed,
    setupValid,
    wouldTakeAgain,
    executionQuality,
    emotionalState,
    tags,
    learningNote,
    nextTimeNote,
  })

  if (completedReview) {
    return {
      ...completedReview,
      reviewedAt: asString(row.reviewedAt) || completedReview.reviewedAt,
    }
  }

  if (
    planFollowed == null &&
    setupValid == null &&
    wouldTakeAgain == null &&
    executionQuality == null &&
    emotionalState == null &&
    tags.length === 0 &&
    !learningNote &&
    !nextTimeNote &&
    row.completed !== true
  ) {
    return null
  }

  return {
    completed: false,
    planFollowed,
    setupValid,
    wouldTakeAgain,
    executionQuality,
    emotionalState,
    tags,
    learningNote: learningNote || undefined,
    nextTimeNote: nextTimeNote || undefined,
    executionScore: asNullableNumber(row.executionScore),
    tradeQuality: asNullableEnum<TradeQuality>(row.tradeQuality, TRADE_QUALITY_OPTIONS),
    reviewedAt: asString(row.reviewedAt) || null,
  }
}

export function isLegacyTradeShape(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false
  const row = raw as Record<string, unknown>
  return (
    "pairClass" in row ||
    !("assetClass" in row) ||
    !("cotEnabled" in row) ||
    !("commercialsBias" in row) ||
    !("playbookId" in row)
  )
}

export function hydrateTrade(raw: unknown): Trade | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  if (typeof row.id !== "string" || row.id.length === 0) return null

  const classified = classifyMarket(asString(row.symbol))
  const symbol = classified.symbol || asString(row.symbol)
  if (!symbol) return null

  const cotEnabled = classified.cotEnabled

  const trade: Trade = {
    id: row.id,
    createdAt: asString(row.createdAt, new Date(0).toISOString()),
    date: asString(row.date),
    symbol,
    assetClass: classified.assetClass,
    marketType: classified.marketType,
    cotEnabled,
    direction: asEnum(row.direction, TRADE_DIRECTIONS, "LONG"),
    strategy: asString(row.strategy, DEFAULT_STRATEGY),
    playbookId: "",
    account: normalizeAccount(row.account),
    status: asEnum(row.status, TRADE_STATUSES, "PLANNED"),
    htfTrend: asEnum(row.htfTrend, TRENDS, "Uptrend"),
    tradeTrend: asEnum(row.tradeTrend, TRENDS, "Uptrend"),
    location: asEnum(row.location, LOCATIONS, "Discount"),
    zoneType: asEnum(row.zoneType, ZONE_TYPES, "Demand"),
    zoneTimeframe: asEnum(row.zoneTimeframe, ZONE_TIMEFRAMES, "Daily"),
    original: asBoolean(row.original, true),
    fresh: asBoolean(row.fresh, true),
    touchCount: asEnum(row.touchCount, TOUCH_COUNTS, "0"),
    hq: asBoolean(row.hq, false),
    impulse: asEnum(row.impulse, IMPULSES, "Normal"),
    mitigation: asNumber(row.mitigation, 0),
    cotBias: cotEnabled ? asNullableBias(row.cotBias) ?? "Neutral" : null,
    cotScore: cotEnabled ? asNullableNumber(row.cotScore) ?? 0 : null,
    commercialsBias: cotEnabled ? asNullableBias(row.commercialsBias) : null,
    seasonalityBias: asEnum(row.seasonalityBias, BIASES, "Neutral"),
    seasonalWindow: asBoolean(row.seasonalWindow, false),
    grade: asEnum(row.grade, GRADES, "B"),
    entry: asNumber(row.entry, 0),
    stopLoss: asNumber(row.stopLoss, 0),
    takeProfit: asNumber(row.takeProfit, 0),
    riskPercent: asNumber(row.riskPercent, 1),
    plannedRRR:
      typeof row.plannedRRR === "number" && Number.isFinite(row.plannedRRR)
        ? row.plannedRRR
        : null,
    resultR: asNullableNumber(row.resultR),
    pnl: asNullableNumber(row.pnl),
    notes: asString(row.notes),
    screenshot: null,
    fieldValues: [],
    review: hydrateReview(row.review),
  }

  return hydrateTradePlaybookFields(row, trade)
}

export function hydrateTrades(raw: unknown): Trade[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => hydrateTrade(item))
    .filter((trade): trade is Trade => trade != null)
}
