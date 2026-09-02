import { describe, expect, it } from "vitest"

import {
  buildEquityCurve,
  calculatePlannedRRR,
  computeDashboardStats,
  formatRRR,
  isZoneInvalid,
} from "@/lib/trade-calculations"
import { MOCK_TRADES } from "@/lib/mock-data"

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

describe("computeDashboardStats", () => {
  it("keeps REVIEWED trades in realized PnL and R", () => {
    const realized = MOCK_TRADES.filter(
      (trade) => trade.status === "CLOSED" && trade.resultR != null
    )
    const baseline = computeDashboardStats(realized)
    const reviewed = realized.map((trade) => ({
      ...trade,
      status: "REVIEWED" as const,
    }))

    expect(computeDashboardStats(reviewed)).toEqual(baseline)
    expect(baseline.closedTrades).toBeGreaterThan(0)
  })
})

describe("buildEquityCurve", () => {
  it("starts at the account capital", () => {
    const closed = MOCK_TRADES.filter(
      (trade) => trade.status === "CLOSED" && trade.pnl != null
    ).slice(0, 2)
    const curve = buildEquityCurve(closed, 10_000)
    expect(curve[0]).toMatchObject({ label: "Start", equity: 10_000, r: 0 })
    const last = curve[curve.length - 1]
    const net = closed.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0)
    expect(last?.equity).toBe(10_000 + net)
  })

  it("stays flat at capital when nothing is closed", () => {
    expect(buildEquityCurve([], 25_000)).toEqual([
      { date: "", label: "Start", equity: 25_000, r: 0 },
    ])
  })
})
