import { describe, expect, it } from "vitest"

import {
  capitalForAccount,
  dollarsPerR,
  filterTradesByAccount,
  filterTradesByScope,
  realizedResultFromInputs,
  riskForAccount,
  suggestedPnl,
} from "@/lib/account-scope"
import { MOCK_TRADES } from "@/lib/mock-data"
import { DEFAULT_PROFILE } from "@/lib/workspace-storage"

describe("account scope", () => {
  it("keeps Personal and Backtesting books separate", () => {
    const personal = filterTradesByAccount(MOCK_TRADES, "Personal")
    const backtesting = filterTradesByAccount(MOCK_TRADES, "Backtesting")
    expect(personal.every((trade) => trade.account === "Personal")).toBe(true)
    expect(backtesting.every((trade) => trade.account === "Backtesting")).toBe(true)
    expect(personal.length).toBeGreaterThan(0)
    expect(backtesting.length).toBeGreaterThan(0)
    expect(personal.length).not.toBe(backtesting.length)
  })

  it("applies a date range after the account filter", () => {
    const scoped = filterTradesByScope(
      MOCK_TRADES,
      { account: "Personal", range: "30D" },
      new Date("2026-09-02T12:00:00")
    )
    expect(scoped.every((trade) => trade.account === "Personal")).toBe(true)
    expect(scoped.every((trade) => trade.date >= "2026-08-03")).toBe(true)
    expect(scoped.length).toBeLessThan(
      filterTradesByAccount(MOCK_TRADES, "Personal").length
    )
  })

  it("sizes 1R from capital and risk percent", () => {
    expect(dollarsPerR(10_000, 1)).toBe(100)
    expect(suggestedPnl(2, 10_000, 1)).toBe(200)
    expect(suggestedPnl(-1, 100_000, 1)).toBe(-1000)
    expect(dollarsPerR(0, 1)).toBe(0)
    expect(
      capitalForAccount(DEFAULT_PROFILE.capital, "Backtesting")
    ).toBe(100_000)
  })

  it("reads risk per account and falls back to the old global percent", () => {
    expect(riskForAccount(DEFAULT_PROFILE, "Personal")).toBe(1)
    expect(
      riskForAccount(
        {
          ...DEFAULT_PROFILE,
          riskByAccount: { Personal: 0.5, Funded: 2, Backtesting: 1.25 },
        },
        "Funded"
      )
    ).toBe(2)
    expect(
      riskForAccount(
        {
          ...DEFAULT_PROFILE,
          riskByAccount: undefined as never,
          riskPercent: 0.75,
        },
        "Backtesting"
      )
    ).toBe(0.75)
  })

  it("closes a new trade when R is filled", () => {
    expect(realizedResultFromInputs("", "", 10_000, 1)).toBeNull()
    expect(realizedResultFromInputs("2", "", 10_000, 1)).toEqual({
      status: "CLOSED",
      resultR: 2,
      pnl: 200,
    })
    expect(realizedResultFromInputs("-1", "-80", 10_000, 1)).toEqual({
      status: "CLOSED",
      resultR: -1,
      pnl: -80,
    })
  })
})
