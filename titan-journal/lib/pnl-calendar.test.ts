import { describe, expect, it } from "vitest"

import { MOCK_TRADES } from "@/lib/mock-data"
import {
  buildMonthCalendar,
  calendarDayHref,
  calendarInsights,
  defaultSelectedDate,
  formatCalendarDayTitle,
  formatMonthShort,
  formatMonthTitle,
  initialCalendarMonth,
  shiftMonth,
} from "@/lib/pnl-calendar"
import type { Trade } from "@/types/trade"

function trade(partial: Partial<Trade>): Trade {
  return {
    id: partial.id ?? "t",
    createdAt: "2026-08-01T00:00:00.000Z",
    date: partial.date ?? "2026-08-10",
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
    pnl: partial.pnl === undefined ? 130 : partial.pnl,
    notes: "",
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

describe("shiftMonth", () => {
  it("wraps across years", () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    })
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    })
  })
})

describe("buildMonthCalendar", () => {
  it("builds a 6x7 grid starting Monday and sums the month", () => {
    const calendar = buildMonthCalendar(
      [
        trade({ date: "2026-08-10", pnl: 200, resultR: 2 }),
        trade({ id: "t2", date: "2026-08-10", pnl: -50, resultR: -1 }),
        trade({ id: "t3", date: "2026-08-28", pnl: 130, resultR: 1 }),
        trade({ id: "skip", date: "2026-08-11", status: "ACTIVE", pnl: null, resultR: null }),
        trade({ id: "july", date: "2026-07-31", pnl: 999, resultR: 5 }),
      ],
      { year: 2026, month: 8 }
    )

    expect(calendar.days).toHaveLength(42)
    expect(calendar.days[0]).toMatchObject({ date: "2026-07-27", inMonth: false })
    expect(calendar.days[5]).toMatchObject({
      date: "2026-08-01",
      day: 1,
      inMonth: true,
    })

    const tenth = calendar.days.find((day) => day.date === "2026-08-10")
    expect(tenth).toMatchObject({ pnl: 150, totalR: 1, trades: 2, inMonth: true })
    expect(tenth?.items.map((item) => item.id)).toEqual(["t", "t2"])
    expect(calendarDayHref(tenth!)).toBeNull()

    const twentyEighth = calendar.days.find((day) => day.date === "2026-08-28")
    expect(calendarDayHref(twentyEighth!)).toBe("/journal/t3")
    expect(calendar.netPnl).toBe(280)
    expect(calendar.totalR).toBe(2)
    expect(calendar.tradeCount).toBe(3)
  })

  it("keeps REVIEWED trades and ignores cancelled ideas", () => {
    const calendar = buildMonthCalendar(
      [
        trade({ status: "REVIEWED", pnl: 80, resultR: 0.5 }),
        trade({ id: "c", status: "CANCELLED", pnl: -400, resultR: -2 }),
      ],
      { year: 2026, month: 8 }
    )
    expect(calendar.netPnl).toBe(80)
    expect(calendar.tradeCount).toBe(1)
  })
})

describe("initialCalendarMonth", () => {
  it("stays on the current month when it has realized trades", () => {
    expect(
      initialCalendarMonth(
        [trade({ date: "2026-09-02", pnl: 10, resultR: 1 })],
        "2026-09-03"
      )
    ).toEqual({ year: 2026, month: 9 })
  })

  it("opens the latest realized month when this month is empty", () => {
    expect(
      initialCalendarMonth(
        [trade({ date: "2026-08-28", pnl: 10, resultR: 1 })],
        "2026-09-03"
      )
    ).toEqual({ year: 2026, month: 8 })
  })

  it("falls back to today when nothing is realized", () => {
    expect(initialCalendarMonth([], "2026-09-03")).toEqual({
      year: 2026,
      month: 9,
    })
  })

  it("opens August 2026 for the mock journal in September", () => {
    expect(initialCalendarMonth(MOCK_TRADES, "2026-09-03")).toEqual({
      year: 2026,
      month: 8,
    })
    expect(buildMonthCalendar(MOCK_TRADES, { year: 2026, month: 8 }).tradeCount).toBeGreaterThan(0)
  })
})

describe("formatMonthTitle", () => {
  it("localizes the month name", () => {
    expect(formatMonthTitle({ year: 2026, month: 8 }, "en")).toBe("August 2026")
    expect(formatMonthTitle({ year: 2026, month: 8 }, "cs").toLowerCase()).toContain("srpen")
  })
})

describe("formatMonthShort", () => {
  it("uses short Czech and English month names", () => {
    expect(formatMonthShort({ year: 2026, month: 8 }, "cs")).toBe("Srp")
    expect(formatMonthShort({ year: 2026, month: 1 }, "cs")).toBe("Led")
    expect(formatMonthShort({ year: 2026, month: 8 }, "en")).toBe("Aug")
  })
})

describe("calendarInsights", () => {
  it("picks best and worst days and groups weeks", () => {
    const calendar = buildMonthCalendar(
      [
        trade({ date: "2026-08-10", pnl: 200, resultR: 2 }),
        trade({ id: "t2", date: "2026-08-10", pnl: -50, resultR: -1 }),
        trade({ id: "t3", date: "2026-08-28", pnl: -130, resultR: -1 }),
      ],
      { year: 2026, month: 8 }
    )
    const insights = calendarInsights(calendar)
    expect(insights.bestDay?.date).toBe("2026-08-10")
    expect(insights.worstDay?.date).toBe("2026-08-28")
    expect(insights.tradingDays).toBe(2)
    expect(insights.weeks.some((week) => week.totalR === 1)).toBe(true)
    expect(insights.weeks.some((week) => week.totalR === -1)).toBe(true)
    expect(insights.progress.at(-1)?.cumulativeR).toBe(0)
    expect(defaultSelectedDate(calendar, "2026-09-03")).toBe("2026-08-28")
    expect(defaultSelectedDate(calendar, "2026-08-10")).toBe("2026-08-10")
    expect(formatCalendarDayTitle("2026-08-15", "cs")).toBe("15. srp 2026")
    expect(formatCalendarDayTitle("2026-08-15", "en")).toBe("15 Aug 2026")
  })
})
