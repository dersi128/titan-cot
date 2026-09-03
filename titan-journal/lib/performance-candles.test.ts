import { describe, expect, it } from "vitest"

import { MOCK_TRADES } from "@/lib/mock-data"
import {
  buildPerformanceCandles,
  isoWeekPeriod,
  parsePerformancePeriod,
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

  it("builds OHLC from running equity inside a week", () => {
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
      open: 10_000,
      high: 10_280,
      low: 10_000,
      close: 10_280,
      pnl: 280,
      pnlPercent: 2.8,
      resultR: 2.4,
    })
  })

  it("opens the next period at the previous close", () => {
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
      open: 10_200,
      close: 10_150,
      high: 10_200,
      low: 10_150,
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
    expect(candles[1]).toMatchObject({ open: 5_100, close: 5_150 })
  })

  it("builds candles from the mock journal", () => {
    const weekly = buildPerformanceCandles(MOCK_TRADES, 10_000, "week")
    const monthly = buildPerformanceCandles(MOCK_TRADES, 10_000, "month")
    expect(weekly.length).toBeGreaterThan(0)
    expect(monthly.length).toBeGreaterThan(0)
    expect(monthly.every((candle) => candle.high >= candle.close)).toBe(true)
    expect(monthly.every((candle) => candle.low <= candle.open)).toBe(true)
  })
})
