import { describe, expect, it } from "vitest"

import {
  formatIsoDisplay,
  parseDateInput,
  splitIsoDate,
} from "@/lib/date-input"

describe("date-input", () => {
  it("formats Czech and English without timezone shifts", () => {
    expect(formatIsoDisplay("2026-09-10", "cs")).toBe("10. 9. 2026")
    expect(formatIsoDisplay("2026-09-10", "sk")).toBe("10. 9. 2026")
    expect(formatIsoDisplay("2026-09-10", "en")).toBe("9/10/2026")
    expect(formatIsoDisplay("2026-10-25", "cs")).toBe("25. 10. 2026")
    expect(formatIsoDisplay("", "cs")).toBe("")
  })

  it("parses typed dates back to YYYY-MM-DD", () => {
    expect(parseDateInput("10. 9. 2026", "cs")).toBe("2026-09-10")
    expect(parseDateInput("10.9.2026", "cs")).toBe("2026-09-10")
    expect(parseDateInput("9/10/2026", "en")).toBe("2026-09-10")
    expect(parseDateInput("10/9/2026", "cs")).toBe("2026-09-10")
    expect(parseDateInput("2026-09-10", "cs")).toBe("2026-09-10")
    expect(parseDateInput("", "cs")).toBe("")
  })

  it("rejects impossible days and keeps DST boundary dates stable", () => {
    expect(parseDateInput("31. 4. 2026", "cs")).toBeNull()
    expect(parseDateInput("2026-02-29", "cs")).toBeNull()
    expect(splitIsoDate("2026-03-29")).toEqual({ year: 2026, month: 3, day: 29 })
    expect(parseDateInput("25. 10. 2026", "cs")).toBe("2026-10-25")
    expect(formatIsoDisplay("2026-03-29", "cs")).toBe("29. 3. 2026")
  })
})
