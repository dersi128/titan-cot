import { describe, expect, it } from "vitest"

import { bestAndWorstPlaybook, statsByPlaybook } from "@/lib/analytics"
import { MOCK_TRADES } from "@/lib/mock-data"

describe("playbook analytics", () => {
  it("groups realized trades by playbook name", () => {
    const groups = statsByPlaybook(MOCK_TRADES)
    expect(groups.length).toBeGreaterThan(0)
    expect(groups[0]?.key).toBe("TITAN Swing")
    expect(groups[0]?.trades).toBeGreaterThan(0)
  })

  it("returns best and worst from the same grouping", () => {
    const { best, worst } = bestAndWorstPlaybook(MOCK_TRADES)
    expect(best?.key).toBe("TITAN Swing")
    expect(worst?.key).toBe("TITAN Swing")
  })
})
