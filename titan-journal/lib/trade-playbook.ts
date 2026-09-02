import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import { fieldValuesFromLegacy } from "@/lib/playbook-legacy"
import type { TradeFieldValue } from "@/types/playbook"
import type { Trade } from "@/types/trade"
import { DEFAULT_STRATEGY } from "@/types/trade"

export function hydrateTradePlaybookFields(row: Record<string, unknown>, trade: Trade): Trade {
  const playbookId =
    typeof row.playbookId === "string" && row.playbookId
      ? row.playbookId
      : TITAN_SWING_PLAYBOOK_ID
  const strategy =
    typeof row.strategy === "string" && row.strategy
      ? row.strategy
      : DEFAULT_STRATEGY
  const screenshot =
    typeof row.screenshot === "string" && row.screenshot ? row.screenshot : null
  const storedValues = Array.isArray(row.fieldValues)
    ? row.fieldValues.filter((item): item is TradeFieldValue => {
        if (!item || typeof item !== "object") return false
        return typeof (item as TradeFieldValue).fieldId === "string"
      })
    : []

  return {
    ...trade,
    playbookId,
    strategy,
    screenshot,
    fieldValues:
      storedValues.length > 0 ? storedValues : fieldValuesFromLegacy(trade),
  }
}
