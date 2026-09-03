import { normalizeStrategyName, TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import { fieldValuesFromLegacy } from "@/lib/playbook-legacy"
import { hydrateScreenshot } from "@/lib/screenshot"
import type { TradeFieldValue } from "@/types/playbook"
import type { Trade } from "@/types/trade"
import { DEFAULT_STRATEGY } from "@/types/trade"

export function hydrateTradePlaybookFields(row: Record<string, unknown>, trade: Trade): Trade {
  const playbookId =
    typeof row.playbookId === "string" && row.playbookId
      ? row.playbookId
      : TITAN_SWING_PLAYBOOK_ID
  const strategy = normalizeStrategyName(
    typeof row.strategy === "string" && row.strategy
      ? row.strategy
      : DEFAULT_STRATEGY
  )
  const screenshot = hydrateScreenshot(row.screenshot)
  const rawValues = row.fieldValues
  const hasStoredValues = Array.isArray(rawValues)
  const storedValues = hasStoredValues
    ? rawValues.filter((item): item is TradeFieldValue => {
        if (!item || typeof item !== "object") return false
        return typeof (item as TradeFieldValue).fieldId === "string"
      })
    : []

  return {
    ...trade,
    playbookId,
    strategy,
    screenshot,
    fieldValues: hasStoredValues ? storedValues : fieldValuesFromLegacy(trade),
  }
}
