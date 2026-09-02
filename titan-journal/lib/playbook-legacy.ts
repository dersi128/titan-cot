import { TITAN_FIELD_IDS } from "@/lib/playbooks"
import type { TradeFieldValue } from "@/types/playbook"
import type { Location, Trade, Trend } from "@/types/trade"

export function mapLegacyTrend(trend: Trend | string | null | undefined): string {
  switch (trend) {
    case "Strong Uptrend":
    case "Uptrend":
    case "Downtrend":
    case "Strong Downtrend":
      return trend
    default:
      return "Consolidation"
  }
}

export function mapLegacyLocation(
  location: Location | string | null | undefined
): string {
  switch (location) {
    case "Top Premium":
    case "Premium":
      return "Premium"
    case "Mid":
      return "Mid"
    default:
      return "Discount"
  }
}

export function fieldValuesFromLegacy(trade: {
  htfTrend?: string | null
  location?: string | null
  zoneType?: string | null
  grade?: string | null
  cotBias?: string | null
}): TradeFieldValue[] {
  const values: TradeFieldValue[] = []
  if (trade.htfTrend) {
    values.push({
      fieldId: TITAN_FIELD_IDS.trend,
      value: mapLegacyTrend(trade.htfTrend as Trend),
    })
  }
  if (trade.location) {
    values.push({
      fieldId: TITAN_FIELD_IDS.location,
      value: mapLegacyLocation(trade.location as Location),
    })
  }
  if (trade.zoneType) {
    values.push({ fieldId: TITAN_FIELD_IDS.zone, value: trade.zoneType })
  }
  if (trade.grade) {
    values.push({ fieldId: TITAN_FIELD_IDS.grade, value: trade.grade })
  }
  if (trade.cotBias) {
    values.push({ fieldId: TITAN_FIELD_IDS.cot, value: trade.cotBias })
  }
  return values
}

export function applyTitanFieldValuesToLegacy(
  fieldValues: TradeFieldValue[]
): Partial<Trade> {
  const byId = Object.fromEntries(
    fieldValues.map((row) => [row.fieldId, row.value])
  )
  const patch: Partial<Trade> = {}
  const trend = byId[TITAN_FIELD_IDS.trend]
  if (typeof trend === "string") {
    patch.htfTrend = trend as Trade["htfTrend"]
    patch.tradeTrend = trend as Trade["tradeTrend"]
  }
  const location = byId[TITAN_FIELD_IDS.location]
  if (typeof location === "string") {
    patch.location =
      location === "Premium"
        ? "Premium"
        : location === "Mid"
          ? "Mid"
          : "Discount"
  }
  const zone = byId[TITAN_FIELD_IDS.zone]
  if (zone === "Supply" || zone === "Demand") patch.zoneType = zone
  const grade = byId[TITAN_FIELD_IDS.grade]
  if (grade === "A+" || grade === "A" || grade === "B+" || grade === "B") {
    patch.grade = grade
  }
  const cot = byId[TITAN_FIELD_IDS.cot]
  if (cot === "Bullish" || cot === "Neutral" || cot === "Bearish") {
    patch.cotBias = cot
    patch.commercialsBias = cot
  }
  return patch
}
