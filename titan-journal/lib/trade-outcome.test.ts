import { describe, expect, it } from "vitest"

import {
  BREAKEVEN_PNL_USD,
  displayResultR,
  statsResultR,
  tradeOutcome,
} from "@/lib/trade-outcome"

describe("tradeOutcome", () => {
  it("marks |pnl| up to $130 as BE when it is not a full 1R", () => {
    expect(tradeOutcome({ resultR: 0.4, pnl: 51 })).toBe("BE")
    expect(tradeOutcome({ resultR: -0.05, pnl: -4.5 })).toBe("BE")
    expect(tradeOutcome({ resultR: 0.9, pnl: BREAKEVEN_PNL_USD })).toBe("BE")
    expect(tradeOutcome({ resultR: 0, pnl: 20 })).toBe("BE")
  })

  it("keeps a full 1R as win or loss even around $130", () => {
    expect(tradeOutcome({ resultR: 1, pnl: 130 })).toBe("WIN")
    expect(tradeOutcome({ resultR: -1, pnl: -130 })).toBe("LOSS")
    expect(tradeOutcome({ resultR: 2, pnl: 260 })).toBe("WIN")
  })

  it("does not treat larger leftovers as BE", () => {
    expect(tradeOutcome({ resultR: 0.5, pnl: 150 })).toBe("WIN")
    expect(tradeOutcome({ resultR: -0.8, pnl: -200 })).toBe("LOSS")
  })

  it("zeros R for stats and display when the trade is BE", () => {
    expect(statsResultR({ resultR: 0.4, pnl: 51 })).toBe(0)
    expect(displayResultR({ resultR: 0.4, pnl: 51 })).toBe(0)
    expect(statsResultR({ resultR: 2, pnl: 260 })).toBe(2)
  })
})
