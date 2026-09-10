import { describe, expect, it } from "vitest"

import { withPnlR } from "@/lib/account-scope"
import {
  buildEquityCurve,
  calculatePlannedRRR,
  computeDashboardStats,
  formatRRR,
  isZoneInvalid,
} from "@/lib/trade-calculations"
import { MOCK_TRADES } from "@/lib/mock-data"
import type { Trade } from "@/types/trade"

function closed(partial: Partial<Trade>): Trade {
  return {
    id: partial.id ?? "t",
    createdAt: partial.createdAt ?? "2026-08-01T00:00:00.000Z",
    date: partial.date ?? "2026-08-24",
    symbol: "EURUSD",
    assetClass: "Forex",
    marketType: "Major",
    cotEnabled: true,
    direction: "LONG",
    strategy: "Swing",
    playbookId: "pb-titan-swing",
    account: "Personal",
    status: partial.status ?? "CLOSED",
    htfTrend: "Uptrend",
    tradeTrend: "Uptrend",
    location: "Discount",
    zoneType: "Demand",
    zoneTimeframe: "Daily",
    original: true,
    fresh: true,
    touchCount: "0",
    hq: true,
    impulse: "Normal",
    mitigation: 8,
    cotBias: null,
    cotScore: null,
    commercialsBias: null,
    seasonalityBias: "Neutral",
    seasonalWindow: false,
    grade: "A",
    entry: 1,
    stopLoss: 0.9,
    takeProfit: 1.2,
    riskPercent: 1,
    plannedRRR: 2,
    resultR: partial.resultR === undefined ? 1 : partial.resultR,
    pnl: partial.pnl === undefined ? 100 : partial.pnl,
    notes: "",
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

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
    expect(baseline.wins + baseline.losses + baseline.be).toBe(baseline.closedTrades)
    expect(baseline.grossProfit).toBeGreaterThanOrEqual(0)
    expect(baseline.grossLoss).toBeGreaterThanOrEqual(0)
  })

  it("keeps BE money in PnL and profit factor, not in win rate or avg R", () => {
    const stats = computeDashboardStats([
      closed({ id: "w", resultR: 2, pnl: 200 }),
      closed({ id: "l", resultR: -1, pnl: -100 }),
      closed({ id: "be", resultR: 0.04, pnl: 51 }),
    ])
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(1)
    expect(stats.be).toBe(1)
    expect(stats.winRate).toBe(0.5)
    expect(stats.averageR).toBe(0.5)
    expect(stats.netPnl).toBe(151)
    expect(stats.grossProfit).toBe(251)
    expect(stats.grossLoss).toBe(100)
    expect(stats.profitFactor).toBe(2.51)
  })

  it("counts closed PnL without R in money stats only", () => {
    const stats = computeDashboardStats([
      closed({ id: "r", resultR: 1, pnl: 20 }),
      closed({ id: "cash", resultR: null, pnl: 80 }),
      closed({ id: "loss", resultR: null, pnl: -40 }),
    ])
    expect(stats.winRate).toBe(1)
    expect(stats.averageR).toBe(1)
    expect(stats.be).toBe(0)
    expect(stats.netPnl).toBe(60)
    expect(stats.profitFactor).toBe(2.5)
  })

  it("does not treat missing PnL as a zero money result", () => {
    const stats = computeDashboardStats([
      closed({ id: "r-win", resultR: 1, pnl: null }),
      closed({ id: "r-loss", resultR: -1, pnl: -50 }),
    ])
    expect(stats.winRate).toBe(0.5)
    expect(stats.averageR).toBe(0)
    expect(stats.netPnl).toBe(-50)
    expect(stats.grossProfit).toBe(0)
    expect(stats.profitFactor).toBe(0)
  })

  it("ignores open trades even when they have R and PnL", () => {
    const stats = computeDashboardStats([
      closed({ id: "open", status: "ACTIVE", resultR: 2, pnl: 500 }),
      closed({ id: "w", resultR: 1, pnl: 100 }),
    ])
    expect(stats.totalTrades).toBe(2)
    expect(stats.closedTrades).toBe(1)
    expect(stats.netPnl).toBe(100)
    expect(stats.winRate).toBe(1)
  })

  it("shows — for profit factor when there are no negative PnL amounts", () => {
    const stats = computeDashboardStats([
      closed({ id: "w", resultR: 1, pnl: 100 }),
      closed({ id: "be", resultR: 0.02, pnl: 10 }),
      closed({ id: "flat", resultR: 1, pnl: 0 }),
    ])
    expect(stats.netPnl).toBe(110)
    expect(stats.profitFactor).toBeNull()
  })

  it("returns empty money and R stats for an empty selection", () => {
    const stats = computeDashboardStats([])
    expect(stats.winRate).toBeNull()
    expect(stats.averageR).toBeNull()
    expect(stats.profitFactor).toBeNull()
    expect(stats.netPnl).toBe(0)
    expect(stats.totalTrades).toBe(0)
  })

  it("lets withPnlR put stored-PnL trades into R stats without changing money totals", () => {
    const raw = closed({ id: "cash", resultR: null, pnl: 80 })
    const mapped = withPnlR(raw, 10_000, 1)
    expect(mapped.resultR).toBe(0.8)

    const before = computeDashboardStats([raw])
    expect(before.winRate).toBeNull()
    expect(before.averageR).toBeNull()
    expect(before.netPnl).toBe(80)
    expect(before.profitFactor).toBeNull()

    const after = computeDashboardStats([mapped])
    expect(after.winRate).toBe(1)
    expect(after.averageR).toBe(0.8)
    expect(after.netPnl).toBe(80)
    expect(after.profitFactor).toBeNull()
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
