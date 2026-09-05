import { describe, expect, it } from "vitest"

import { dashboardSnapshots, maxDrawdown } from "@/lib/dashboard-snapshots"
import type { EquityPoint } from "@/lib/trade-calculations"
import type { Trade } from "@/types/trade"

function trade(partial: Partial<Trade>): Trade {
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

describe("maxDrawdown", () => {
  it("measures the worst peak-to-trough drop", () => {
    const points: EquityPoint[] = [
      { date: "2026-01-01", label: "Start", equity: 10_000, r: 0 },
      { date: "2026-01-02", label: "02", equity: 12_000, r: 2 },
      { date: "2026-01-03", label: "03", equity: 9_000, r: -1 },
      { date: "2026-01-04", label: "04", equity: 11_000, r: 1 },
    ]
    expect(maxDrawdown(points)).toBeCloseTo(-0.25)
  })

  it("is zero on a flat curve", () => {
    expect(
      maxDrawdown([{ date: "", label: "Start", equity: 10_000, r: 0 }])
    ).toBe(0)
  })
})

describe("dashboardSnapshots", () => {
  const now = new Date(2026, 8, 3)

  it("splits wins and losses and compares months", () => {
    const snap = dashboardSnapshots(
      [
        trade({ id: "a", date: "2026-08-10", pnl: 200, resultR: 2 }),
        trade({ id: "b", date: "2026-08-20", pnl: -100, resultR: -1 }),
        trade({ id: "c", date: "2026-09-01", pnl: 150, resultR: 1.5 }),
        trade({ id: "d", date: "2026-09-02", pnl: -50, resultR: -0.5 }),
      ],
      now
    )

    expect(snap.wins).toBe(2)
    expect(snap.losses).toBe(1)
    expect(snap.winShare).toBeCloseTo(2 / 3)
    expect(snap.thisMonth.pnl).toBe(100)
    expect(snap.lastMonth.pnl).toBe(100)
    expect(snap.vsLastMonth).toBe(0)
    expect(snap.last7Days.spark).toHaveLength(7)
  })
})
