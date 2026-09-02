import { classifyMarket } from "@/lib/market-classification"
import {
  ACCOUNTS,
  BIASES,
  GRADES,
  IMPULSES,
  LOCATIONS,
  STRATEGIES,
  TOUCH_COUNTS,
  TRADE_DIRECTIONS,
  TRADE_STATUSES,
  TRENDS,
  ZONE_TIMEFRAMES,
  ZONE_TYPES,
  type Bias,
  type Trade,
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

export function isLegacyTradeShape(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false
  const row = raw as Record<string, unknown>
  return (
    "pairClass" in row ||
    !("assetClass" in row) ||
    !("cotEnabled" in row) ||
    !("commercialsBias" in row)
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

  return {
    id: row.id,
    createdAt: asString(row.createdAt, new Date(0).toISOString()),
    date: asString(row.date),
    symbol,
    assetClass: classified.assetClass,
    marketType: classified.marketType,
    cotEnabled,
    direction: asEnum(row.direction, TRADE_DIRECTIONS, "LONG"),
    strategy: asEnum(row.strategy, STRATEGIES, "TITAN Swing"),
    account: asEnum(row.account, ACCOUNTS, "Personal"),
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
  }
}

export function hydrateTrades(raw: unknown): Trade[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((item) => hydrateTrade(item))
    .filter((trade): trade is Trade => trade != null)
}
