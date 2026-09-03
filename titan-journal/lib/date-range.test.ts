import { describe, expect, it } from "vitest"

import { rangeBounds, previousRangeBounds, rangeStartIso, tradeInRange } from "@/lib/date-range"

describe("rangeStartIso", () => {
  const now = new Date(2026, 8, 3)

  it("covers the dashboard windows", () => {
    expect(rangeStartIso("ALL", now)).toBeNull()
    expect(rangeStartIso("YTD", now)).toBe("2026-01-01")
    expect(rangeStartIso("30D", now)).toBe("2026-08-04")
    expect(rangeStartIso("3M", now)).toBe("2026-06-03")
    expect(rangeStartIso("6M", now)).toBe("2026-03-03")
  })

  it("uses custom bounds", () => {
    expect(
      rangeBounds("CUSTOM", now, { start: "2026-07-01", end: "2026-07-15" })
    ).toEqual({ start: "2026-07-01", end: "2026-07-15" })
    expect(
      tradeInRange({ date: "2026-07-10" }, "CUSTOM", now, {
        start: "2026-07-01",
        end: "2026-07-15",
      })
    ).toBe(true)
    expect(
      tradeInRange({ date: "2026-08-01" }, "CUSTOM", now, {
        start: "2026-07-01",
        end: "2026-07-15",
      })
    ).toBe(false)
  })
})

describe("previousRangeBounds", () => {
  const now = new Date(2026, 8, 3)

  it("shifts a 30D window back by the same span", () => {
    expect(previousRangeBounds("30D", now)).toEqual({
      start: "2026-07-04",
      end: "2026-08-03",
    })
  })

  it("has no previous window for all-time", () => {
    expect(previousRangeBounds("ALL", now)).toBeNull()
  })
})
