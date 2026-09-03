import { describe, expect, it } from "vitest"

import { formatDate, formatMoney, formatPercent, formatSignedMoney, formatYesNo } from "@/lib/format"
import { LOCALE, TIMEZONE } from "@/lib/locale"

describe("cs-CZ locale", () => {
  it("uses Czech locale and Prague timezone", () => {
    expect(LOCALE).toBe("cs-CZ")
    expect(TIMEZONE).toBe("Europe/Prague")
  })

  it("formats dates in Czech", () => {
    expect(formatDate("2026-08-28")).toBe("28. 8. 2026")
  })

  it("formats percent with a space", () => {
    expect(formatPercent(0.48)).toBe("48 %")
  })

  it("formats yes/no as Yes/No", () => {
    expect(formatYesNo(true)).toBe("Yes")
    expect(formatYesNo(false)).toBe("No")
  })

  it("formats money with the given currency, not a hardcoded USD symbol", () => {
    const eur = formatMoney(1240, "EUR")
    expect(eur).toContain("1")
    expect(eur).toMatch(/EUR|€/)
    expect(formatSignedMoney(-180, "EUR")).toMatch(/^-/)
  })
})
