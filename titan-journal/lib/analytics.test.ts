import { describe, expect, it } from "vitest"

import {
  EDGE_MIN_TRADES,
  accountEdge,
  bestAndWorstPlaybook,
  cappedGroups,
  changePct,
  edgeVerdict,
  statsByEmotion,
  statsByPlanFollowed,
  statsByPlaybook,
} from "@/lib/analytics"
import { MOCK_TRADES } from "@/lib/mock-data"
import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import type { Trade, TradeReview } from "@/types/trade"

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
    review: partial.review === undefined ? null : partial.review,
  }
}

function review(partial: Partial<TradeReview>): TradeReview {
  return {
    completed: true,
    planFollowed: null,
    setupValid: null,
    wouldTakeAgain: true,
    executionQuality: null,
    emotionalState: null,
    tags: [],
    executionScore: null,
    tradeQuality: null,
    ...partial,
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

  it("folds extra playbooks into others", () => {
    const trades = ["A", "B", "C"].flatMap((name, group) =>
      Array.from({ length: 3 - group }, (_, index) =>
        trade({
          id: `${name}${index}`,
          playbookId: "",
          strategy: name,
          resultR: 1,
          pnl: 100,
        })
      )
    )
    const groups = cappedGroups(
      trades,
      (item) => item.strategy,
      2,
      "Ostatní"
    )
    expect(groups.map((row) => row.key)).toEqual(["A", "Ostatní"])
    expect(groups[1]?.trades).toBe(3)
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

  it("counts wins and losses", () => {
    const stats = accountEdge([
      trade({ id: "w", resultR: 1, pnl: 100 }),
      trade({ id: "l", resultR: -1, pnl: -100 }),
      trade({ id: "l2", resultR: -2, pnl: -200 }),
    ])
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(2)
    expect(stats.be).toBe(0)
  })

  it("treats |R| under 0.5 as BE and keeps it out of win rate", () => {
    const stats = accountEdge([
      trade({ id: "w", resultR: 2, pnl: 260 }),
      trade({ id: "l", resultR: -1, pnl: -200 }),
      trade({ id: "be", resultR: 0.4, pnl: 51 }),
    ])
    expect(stats.trades).toBe(3)
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(1)
    expect(stats.be).toBe(1)
    expect(stats.winRate).toBe(0.5)
    expect(stats.averageR).toBe(0.5)
    expect(stats.netPnl).toBe(111)
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

  it("compares sample size to the previous window", () => {
    expect(changePct(200, 178)).toBe(12.4)
    expect(changePct(10, 0)).toBeNull()
  })
})

describe("review analytics", () => {
  it("groups realized trades by plan and skips missing reviews", () => {
    const groups = statsByPlanFollowed([
      trade({
        id: "yes",
        resultR: 2,
        pnl: 200,
        review: review({ planFollowed: "Yes" }),
      }),
      trade({
        id: "no",
        resultR: -1,
        pnl: -100,
        review: review({ planFollowed: "No" }),
      }),
      trade({
        id: "part",
        resultR: 1,
        pnl: 100,
        review: review({ planFollowed: "Partially" }),
      }),
      trade({ id: "blank", resultR: 3, pnl: 300, review: null }),
    ])
    expect(groups.map((row) => row.key)).toEqual(["Yes", "Partially", "No"])
    expect(groups.find((row) => row.key === "Yes")?.trades).toBe(1)
    expect(groups.some((row) => row.key === "—")).toBe(false)
  })

  it("groups realized trades by emotion and skips missing emotion", () => {
    const groups = statsByEmotion([
      trade({
        id: "calm",
        resultR: 1,
        pnl: 100,
        review: review({ emotionalState: "Calm" }),
      }),
      trade({
        id: "fear",
        resultR: -2,
        pnl: -200,
        review: review({ emotionalState: "Fear" }),
      }),
      trade({
        id: "none",
        resultR: 1,
        pnl: 100,
        review: review({ planFollowed: "Yes" }),
      }),
    ])
    expect(groups.map((row) => row.key)).toEqual(["Calm", "Fear"])
    expect(groups.find((row) => row.key === "Fear")?.averageR).toBe(-2)
  })
})
