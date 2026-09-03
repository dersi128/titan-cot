import { describe, expect, it } from "vitest"

import { MOCK_TRADES } from "@/lib/mock-data"
import {
  buildPerformanceCandles,
  isoWeekPeriod,
  monthWeekPeriod,
  parsePerformancePeriod,
  performanceTickLabel,
  weekdayPeriod,
} from "@/lib/performance-candles"
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

describe("isoWeekPeriod", () => {
  it("uses ISO weeks", () => {
    expect(isoWeekPeriod("2026-08-24")).toBe("2026-W35")
    expect(isoWeekPeriod("2026-08-28")).toBe("2026-W35")
    expect(isoWeekPeriod("2026-08-31")).toBe("2026-W36")
  })
})

describe("buildPerformanceCandles", () => {
  it("returns nothing without realized trades", () => {
    expect(buildPerformanceCandles([], 10_000)).toEqual([])
    expect(
      buildPerformanceCandles(
        [trade({ status: "ACTIVE", pnl: null, resultR: null })],
        10_000
      )
    ).toEqual([])
  })

  it("sums PnL inside a week", () => {
    const candles = buildPerformanceCandles(
      [
        trade({ id: "a", date: "2026-08-24", pnl: 200, resultR: 2 }),
        trade({
          id: "b",
          date: "2026-08-26",
          createdAt: "2026-08-26T00:00:00.000Z",
          pnl: -80,
          resultR: -1,
        }),
        trade({
          id: "c",
          date: "2026-08-28",
          createdAt: "2026-08-28T00:00:00.000Z",
          pnl: 160,
          resultR: 1.4,
        }),
      ],
      10_000,
      "week"
    )

    expect(candles).toHaveLength(1)
    expect(candles[0]).toEqual({
      period: "2026-W35",
      open: 0,
      high: 280,
      low: 0,
      close: 280,
      pnl: 280,
      pnlPercent: 2.8,
      resultR: 2.4,
    })
  })

  it("keeps each week as its own PnL column", () => {
    const candles = buildPerformanceCandles(
      [
        trade({ id: "a", date: "2026-08-28", pnl: 200, resultR: 2 }),
        trade({
          id: "b",
          date: "2026-08-31",
          createdAt: "2026-08-31T00:00:00.000Z",
          pnl: -50,
          resultR: -0.5,
        }),
      ],
      10_000,
      "week"
    )

    expect(candles.map((candle) => candle.period)).toEqual([
      "2026-W35",
      "2026-W36",
    ])
    expect(candles[1]).toMatchObject({
      open: 0,
      close: -50,
      high: 0,
      low: -50,
      pnl: -50,
    })
  })

  it("groups by month", () => {
    const candles = buildPerformanceCandles(
      [
        trade({ id: "a", date: "2026-07-31", pnl: 100, resultR: 1 }),
        trade({
          id: "b",
          date: "2026-08-10",
          createdAt: "2026-08-10T00:00:00.000Z",
          pnl: 50,
          resultR: 0.5,
        }),
      ],
      5_000,
      "month"
    )
    expect(candles.map((candle) => candle.period)).toEqual(["2026-07", "2026-08"])
    expect(parsePerformancePeriod(candles[1]!.period)).toEqual({
      kind: "month",
      year: 2026,
      month: 8,
    })
    expect(candles[1]).toMatchObject({ open: 0, close: 50, pnl: 50 })
  })

  it("builds candles from the mock journal", () => {
    const weekly = buildPerformanceCandles(MOCK_TRADES, 10_000, "week")
    const monthly = buildPerformanceCandles(MOCK_TRADES, 10_000, "month")
    expect(weekly.length).toBeGreaterThan(0)
    expect(monthly.length).toBeGreaterThan(0)
    expect(monthly.every((candle) => candle.high >= candle.close)).toBe(true)
    expect(monthly.every((candle) => candle.low <= candle.open)).toBe(true)
  })

  it("groups by weekday, week of month, and months in the year", () => {
    expect(weekdayPeriod("2026-08-24")).toBe("WD-1")
    expect(monthWeekPeriod("2026-08-24")).toBe("2026-08-w4")
    const weekdays = buildPerformanceCandles(
      [
        trade({ id: "a", date: "2026-08-24", pnl: 100, resultR: 1 }),
        trade({
          id: "b",
          date: "2026-08-25",
          createdAt: "2026-08-25T00:00:00.000Z",
          pnl: -40,
          resultR: -0.4,
        }),
      ],
      10_000,
      "weekday"
    )
    expect(weekdays.map((candle) => candle.period)).toEqual([
      "WD-1",
      "WD-2",
      "WD-3",
      "WD-4",
      "WD-5",
      "WD-6",
      "WD-7",
    ])
    expect(weekdays[0]).toMatchObject({ pnl: 100, resultR: 1 })
    expect(weekdays[1]).toMatchObject({ pnl: -40, resultR: -0.4 })
    expect(parsePerformancePeriod("WD-1")).toEqual({ kind: "weekday", weekday: 1 })

    const monthWeeks = buildPerformanceCandles(
      [trade({ id: "a", date: "2026-08-24", pnl: 100, resultR: 1 })],
      10_000,
      "monthWeek"
    )
    expect(monthWeeks.map((candle) => candle.period)).toEqual([
      "2026-08-w1",
      "2026-08-w2",
      "2026-08-w3",
      "2026-08-w4",
      "2026-08-w5",
    ])
    expect(monthWeeks[3]).toMatchObject({ pnl: 100, resultR: 1 })
    expect(parsePerformancePeriod(monthWeeks[3]!.period)).toEqual({
      kind: "monthWeek",
      year: 2026,
      month: 8,
      week: 4,
    })

    const yearMonths = buildPerformanceCandles(
      [trade({ id: "a", date: "2026-08-24", pnl: 100, resultR: 1 })],
      10_000,
      "yearMonth"
    )
    expect(yearMonths).toHaveLength(8)
    expect(yearMonths.map((candle) => candle.period)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
    ])
    expect(yearMonths[7]).toMatchObject({ period: "2026-08", pnl: 100 })
    expect(yearMonths[0]?.pnl).toBe(0)
  })
})

describe("performanceTickLabel", () => {
  const weekdays = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]

  it("uses readable Czech axis labels", () => {
    expect(performanceTickLabel("2026-08", "cs", weekdays)).toBe("Srp")
    expect(performanceTickLabel("2026-W35", "cs", weekdays)).toBe("T35")
    expect(performanceTickLabel("WD-1", "cs", weekdays)).toBe("Po")
    expect(performanceTickLabel("2026-08-w4", "cs", weekdays)).toBe("T4")
    expect(performanceTickLabel("2026-08-w4", "cs", weekdays, true)).toBe("Srp T4")
  })

  it("uses readable English axis labels", () => {
    expect(performanceTickLabel("2026-08", "en", weekdays)).toBe("Aug")
    expect(performanceTickLabel("2026-W35", "en", weekdays)).toBe("W35")
  })
})
