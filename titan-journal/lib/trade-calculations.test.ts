import { describe, expect, it } from "vitest"

import {
  calculatePlannedRRR,
  formatRRR,
  isZoneInvalid,
} from "@/lib/trade-calculations"

describe("calculatePlannedRRR", () => {
  it("computes LONG RRR", () => {
    expect(
      calculatePlannedRRR({
        direction: "LONG",
        entry: 1.1,
        stopLoss: 1.09,
        takeProfit: 1.12,
      })
    ).toBe(2)
  })

  it("computes SHORT RRR", () => {
    expect(
      calculatePlannedRRR({
        direction: "SHORT",
        entry: 0.65,
        stopLoss: 0.66,
        takeProfit: 0.63,
      })
    ).toBe(2)
  })

  it("returns null when risk is invalid", () => {
    expect(
      calculatePlannedRRR({
        direction: "LONG",
        entry: 1.1,
        stopLoss: 1.12,
        takeProfit: 1.14,
      })
    ).toBeNull()
  })

  it("formats RRR as 1:x", () => {
    expect(formatRRR(2)).toBe("1:2")
    expect(formatRRR(1.5)).toBe("1:1.5")
    expect(formatRRR(null)).toBe("—")
  })
})

describe("isZoneInvalid", () => {
  it("warns above 25% mitigation", () => {
    expect(isZoneInvalid(25)).toBe(false)
    expect(isZoneInvalid(26)).toBe(true)
  })
})
