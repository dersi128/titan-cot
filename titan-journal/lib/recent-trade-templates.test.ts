import { describe, expect, it } from "vitest"

import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import { recentTradeTemplates } from "@/lib/recent-trade-templates"
import type { Trade } from "@/types/trade"

function trade(partial: Partial<Trade>): Trade {
  return {
    id: partial.id ?? "t",
    createdAt: partial.createdAt ?? "2026-08-01T00:00:00.000Z",
    date: partial.date ?? "2026-08-24",
    symbol: partial.symbol ?? "EURUSD",
    assetClass: "Forex",
    marketType: "Major",
    cotEnabled: true,
    direction: partial.direction ?? "LONG",
    strategy: "Swing",
    playbookId: partial.playbookId ?? TITAN_SWING_PLAYBOOK_ID,
    account: partial.account ?? "Personal",
    status: "CLOSED",
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
    riskPercent: partial.riskPercent ?? 1,
    plannedRRR: 2,
    resultR: 1,
    pnl: 200,
    notes: "",
    screenshot: null,
    fieldValues: [],
    review: null,
  }
}

describe("recentTradeTemplates", () => {
  it("returns unique recent symbol/direction/playbook combos", () => {
    const templates = recentTradeTemplates([
      trade({
        id: "old",
        date: "2026-08-01",
        createdAt: "2026-08-01T00:00:00.000Z",
        symbol: "AUDUSD",
        direction: "LONG",
      }),
      trade({
        id: "dup",
        date: "2026-08-20",
        createdAt: "2026-08-20T00:00:00.000Z",
        symbol: "EURUSD",
        direction: "LONG",
        riskPercent: 0.5,
      }),
      trade({
        id: "latest",
        date: "2026-08-24",
        createdAt: "2026-08-24T00:00:00.000Z",
        symbol: "EURUSD",
        direction: "LONG",
        riskPercent: 1.25,
      }),
      trade({
        id: "short",
        date: "2026-08-22",
        createdAt: "2026-08-22T00:00:00.000Z",
        symbol: "EURUSD",
        direction: "SHORT",
      }),
    ])

    expect(templates.map((item) => item.key)).toEqual([
      `EURUSD|LONG|${TITAN_SWING_PLAYBOOK_ID}`,
      `EURUSD|SHORT|${TITAN_SWING_PLAYBOOK_ID}`,
      `AUDUSD|LONG|${TITAN_SWING_PLAYBOOK_ID}`,
    ])
    expect(templates[0]?.riskPercent).toBe(1.25)
  })

  it("skips archived playbooks and empty symbols", () => {
    const templates = recentTradeTemplates(
      [
        trade({ id: "empty", symbol: "  " }),
        trade({ id: "archived", playbookId: "pb-old", symbol: "XAUUSD" }),
        trade({ id: "ok", symbol: "NVDA", direction: "SHORT" }),
      ],
      6,
      new Set([TITAN_SWING_PLAYBOOK_ID])
    )

    expect(templates).toEqual([
      {
        key: `NVDA|SHORT|${TITAN_SWING_PLAYBOOK_ID}`,
        symbol: "NVDA",
        direction: "SHORT",
        playbookId: TITAN_SWING_PLAYBOOK_ID,
        account: "Personal",
        riskPercent: 1,
      },
    ])
  })
})
