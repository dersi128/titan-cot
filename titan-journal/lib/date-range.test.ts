import { describe, expect, it } from "vitest"

import { rangeStartIso } from "@/lib/date-range"

describe("rangeStartIso", () => {
  const now = new Date(2026, 8, 3)

  it("covers the common dashboard windows", () => {
    expect(rangeStartIso("ALL", now)).toBeNull()
    expect(rangeStartIso("YTD", now)).toBe("2026-01-01")
    expect(rangeStartIso("30D", now)).toBe("2026-08-04")
    expect(rangeStartIso("1Y", now)).toBe("2025-09-03")
    expect(rangeStartIso("7D", now)).toBe("2026-08-27")
  })
})
