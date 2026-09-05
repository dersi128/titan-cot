import { describe, expect, it } from "vitest"

import {
  BREAKEVEN_R,
  displayResultR,
  statsResultR,
  tradeOutcome,
} from "@/lib/trade-outcome"

describe("tradeOutcome", () => {
  it("marks |R| under 0.5 as BE", () => {
    expect(tradeOutcome({ resultR: 0.4, pnl: 51 })).toBe("BE")
    expect(tradeOutcome({ resultR: -0.05, pnl: -4.5 })).toBe("BE")
    expect(tradeOutcome({ resultR: 0, pnl: 20 })).toBe("BE")
    expect(tradeOutcome({ resultR: 0.49 })).toBe("BE")
  })

  it("keeps 0.5R and above as win or loss", () => {
    expect(tradeOutcome({ resultR: BREAKEVEN_R, pnl: 50 })).toBe("WIN")
    expect(tradeOutcome({ resultR: -BREAKEVEN_R, pnl: -50 })).toBe("LOSS")
    expect(tradeOutcome({ resultR: 1, pnl: 130 })).toBe("WIN")
    expect(tradeOutcome({ resultR: -0.8, pnl: -20 })).toBe("LOSS")
  })

  it("zeros R for stats and display when the trade is BE", () => {
    expect(statsResultR({ resultR: 0.4, pnl: 51 })).toBe(0)
    expect(displayResultR({ resultR: 0.4, pnl: 51 })).toBe(0)
    expect(statsResultR({ resultR: 2, pnl: 260 })).toBe(2)
  })
})
