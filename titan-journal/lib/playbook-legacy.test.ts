import { describe, expect, it } from "vitest"

import {
  applyTitanFieldValuesToLegacy,
  fieldValuesFromLegacy,
  mapLegacyLocation,
  mapLegacyTrend,
} from "@/lib/playbook-legacy"
import { TITAN_FIELD_IDS } from "@/lib/playbooks"

describe("playbook legacy mapping", () => {
  it("collapses extra trend/location values onto the default playbook options", () => {
    expect(mapLegacyTrend("Correction")).toBe("Consolidation")
    expect(mapLegacyTrend("Strong Uptrend")).toBe("Strong Uptrend")
    expect(mapLegacyLocation("Top Premium")).toBe("Premium")
    expect(mapLegacyLocation("Top Discount")).toBe("Discount")
  })

  it("builds field values from an old trade record", () => {
    const values = fieldValuesFromLegacy({
      htfTrend: "Uptrend",
      location: "Discount",
      zoneType: "Demand",
      grade: "A+",
      cotBias: "Bullish",
    })
    expect(values).toContainEqual({
      fieldId: TITAN_FIELD_IDS.trend,
      value: "Uptrend",
    })
    expect(values).toContainEqual({
      fieldId: TITAN_FIELD_IDS.cot,
      value: "Bullish",
    })
  })

  it("writes playbook values back onto legacy columns", () => {
    const patch = applyTitanFieldValuesToLegacy([
      { fieldId: TITAN_FIELD_IDS.zone, value: "Supply" },
      { fieldId: TITAN_FIELD_IDS.grade, value: "A" },
    ])
    expect(patch.zoneType).toBe("Supply")
    expect(patch.grade).toBe("A")
  })
})
