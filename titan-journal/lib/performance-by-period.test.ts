import { describe, expect, it } from "vitest"

import { MOCK_TRADES } from "@/lib/mock-data"
import {
  aggregationForRange,
  getPerformanceByPeriod,
  isoWeekNumber,
  isoWeekStart,
  performanceRangeLabel,
  performanceTickLabel,
} from "@/lib/performance-by-period"
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
    pnl: partial.pnl === undefined ? 200 : partial.pnl,
    notes: "",
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

const NOW = new Date(2026, 8, 3)
const SAMPLE = [
  trade({ id: "a", date: "2026-08-24", resultR: 1.4, pnl: 280 }),
  trade({
    id: "b",
    date: "2026-08-25",
    createdAt: "2026-08-25T00:00:00.000Z",
    resultR: -1,
    pnl: -200,
  }),
  trade({
    id: "c",
    date: "2026-08-31",
    createdAt: "2026-08-31T00:00:00.000Z",
    resultR: 2.2,
    pnl: 440,
  }),
]

describe("aggregationForRange", () => {
  it("picks day, week, or month from the dashboard range", () => {
    expect(aggregationForRange("30D", "2026-08-04", "2026-09-03")).toBe("day")
    expect(aggregationForRange("3M", "2026-06-03", "2026-09-03")).toBe("week")
    expect(aggregationForRange("6M", "2026-03-03", "2026-09-03")).toBe("month")
    expect(aggregationForRange("YTD", "2026-01-01", "2026-09-03")).toBe("month")
    expect(aggregationForRange("ALL", null, "2026-09-03")).toBe("month")
    expect(aggregationForRange("CUSTOM", "2026-08-20", "2026-09-03")).toBe("day")
    expect(aggregationForRange("CUSTOM", "2026-06-01", "2026-09-03")).toBe("week")
    expect(aggregationForRange("CUSTOM", "2025-09-03", "2026-09-03")).toBe("month")
  })
})

describe("getPerformanceByPeriod", () => {
  it("returns no buckets for ALL without realized trades", () => {
    expect(getPerformanceByPeriod([], "ALL", NOW).buckets).toEqual([])
    expect(
      getPerformanceByPeriod(
        [trade({ status: "ACTIVE", resultR: null, pnl: null })],
        "ALL",
        NOW
      ).buckets
    ).toEqual([])
  })

  it("uses one column per day on 30D", () => {
    const result = getPerformanceByPeriod(SAMPLE, "30D", NOW)
    expect(result.aggregation).toBe("day")
    const day = result.buckets.find((bucket) => bucket.startDate === "2026-08-24")
    expect(day).toMatchObject({
      netR: 1.4,
      pnl: 280,
      trades: 1,
      wins: 1,
      losses: 0,
      winRate: 100,
    })
    expect(result.buckets.some((bucket) => bucket.startDate === "2026-08-10")).toBe(
      true
    )
    expect(result.totals).toMatchObject({ trades: 3, wins: 2, losses: 1, netR: 2.6 })
  })

  it("uses one column per week on 3M", () => {
    const result = getPerformanceByPeriod(SAMPLE, "3M", NOW)
    expect(result.aggregation).toBe("week")
    expect(isoWeekStart("2026-08-24")).toBe("2026-08-24")
    const week = result.buckets.find((bucket) => bucket.key === "2026-08-24")
    expect(week).toMatchObject({
      trades: 2,
      wins: 1,
      losses: 1,
      netR: 0.4,
      winRate: 50,
    })
    expect(performanceRangeLabel(week!)).toBe("24.–30. 8. 2026")
    expect(performanceTickLabel(week!, "week", "cs", false)).toBe("24.–30.8.")
    expect(isoWeekNumber("2026-08-24")).toBe(35)
    expect(performanceTickLabel(week!, "week", "cs", true)).toBe("T35")
  })

  it("uses one column per month on YTD", () => {
    const result = getPerformanceByPeriod(SAMPLE, "YTD", NOW)
    expect(result.aggregation).toBe("month")
    expect(result.buckets[0]?.key).toBe("2026-01")
    const august = result.buckets.find((bucket) => bucket.key === "2026-08")
    expect(august).toMatchObject({ trades: 3, netR: 2.6, pnl: 520 })
    expect(performanceTickLabel(august!, "month", "cs", false)).toBe("Srp")
  })

  it("omits an empty current period", () => {
    const result = getPerformanceByPeriod(SAMPLE, "30D", NOW)
    expect(result.buckets.some((bucket) => bucket.startDate === "2026-09-03")).toBe(
      false
    )
  })

  it("builds buckets from the mock journal", () => {
    const result = getPerformanceByPeriod(MOCK_TRADES, "ALL", NOW)
    expect(result.aggregation).toBe("month")
    expect(result.buckets.length).toBeGreaterThan(0)
    expect(result.totals.trades).toBeGreaterThan(0)
  })
})
