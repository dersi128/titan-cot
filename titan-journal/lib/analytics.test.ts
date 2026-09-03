import { describe, expect, it } from "vitest"

import {
  EDGE_MIN_TRADES,
  accountEdge,
  bestAndWorstPlaybook,
  edgeVerdict,
  statsByPlaybook,
} from "@/lib/analytics"
import { MOCK_TRADES } from "@/lib/mock-data"
import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
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
    strategy: partial.strategy ?? "Swing",
    playbookId: partial.playbookId ?? TITAN_SWING_PLAYBOOK_ID,
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
    pnl: partial.pnl === undefined ? 200 : partial.pnl,
    notes: "",
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

describe("playbook analytics", () => {
  it("groups realized trades by playbook", () => {
    const groups = statsByPlaybook(MOCK_TRADES)
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0]?.key).toBe(TITAN_SWING_PLAYBOOK_ID)
    expect(groups[0]?.trades).toBeGreaterThan(0)
    expect(groups[0]?.edge).toBeDefined()
  })

  it("returns best and worst from the same grouping", () => {
    const { best, worst } = bestAndWorstPlaybook(MOCK_TRADES)
    expect(best?.key).toBe(TITAN_SWING_PLAYBOOK_ID)
    expect(worst?.key).toBe(TITAN_SWING_PLAYBOOK_ID)
  })

  it("falls back to strategy name when playbook is missing", () => {
    const groups = statsByPlaybook([
      trade({ id: "a", playbookId: "", strategy: "Breakout" }),
      trade({ id: "b", playbookId: "", strategy: "Breakout", resultR: -1, pnl: -100 }),
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0]?.key).toBe("Breakout")
  })
})

describe("strategy edge", () => {
  it("needs a sample before calling it an edge", () => {
    expect(edgeVerdict(5, 0.4)).toBe("thin")
    expect(edgeVerdict(EDGE_MIN_TRADES, 0.4)).toBe("yes")
    expect(edgeVerdict(EDGE_MIN_TRADES, -0.1)).toBe("no")
  })

  it("is yes when average R is positive and the sample is large enough", () => {
    const trades = Array.from({ length: EDGE_MIN_TRADES }, (_, index) =>
      trade({
        id: `w${index}`,
        resultR: index % 4 === 0 ? -1 : 1,
        pnl: index % 4 === 0 ? -100 : 100,
      })
    )
    const stats = accountEdge(trades)
    expect(stats.trades).toBe(EDGE_MIN_TRADES)
    expect(stats.averageR).toBeGreaterThan(0)
    expect(stats.edge).toBe("yes")
    expect(stats.profitFactor).toBeGreaterThan(1)
  })

  it("stays thin until the sample is large enough", () => {
    const trades = Array.from({ length: 8 }, (_, index) =>
      trade({ id: `s${index}`, resultR: 1, pnl: 100 })
    )
    expect(accountEdge(trades).edge).toBe("thin")
    expect(accountEdge(trades).averageR).toBe(1)
  })

  it("is no when expectancy is negative", () => {
    const trades = Array.from({ length: EDGE_MIN_TRADES }, (_, index) =>
      trade({
        id: `l${index}`,
        resultR: index % 5 === 0 ? 1 : -1,
        pnl: index % 5 === 0 ? 100 : -100,
      })
    )
    expect(accountEdge(trades).edge).toBe("no")
  })

  it("measures max drawdown in R from the equity peak", () => {
    const stats = accountEdge([
      trade({ id: "1", date: "2026-01-01", resultR: 1, pnl: 100 }),
      trade({ id: "2", date: "2026-01-02", resultR: 1, pnl: 100 }),
      trade({ id: "3", date: "2026-01-03", resultR: -3, pnl: -300 }),
    ])
    expect(stats.maxDrawdownR).toBe(-3)
    expect(stats.averageR).toBeCloseTo(-0.33)
  })

  it("has no drawdown when every trade is a winner", () => {
    expect(
      accountEdge([
        trade({ id: "1", date: "2026-01-01", resultR: 1, pnl: 100 }),
        trade({ id: "2", date: "2026-01-02", resultR: 2, pnl: 200 }),
      ]).maxDrawdownR
    ).toBe(0)
  })
})
