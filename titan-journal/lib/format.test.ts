import { describe, expect, it } from "vitest"

import {
  formatCompactSigned,
  formatCompactSignedR,
  formatDate,
  formatMoney,
  formatPercent,
  formatSignedMoney,
  formatSignedPercentPoints,
  formatYesNo,
} from "@/lib/format"
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

  it("formats yes/no as Yes/No by default and Ano/Ne in Czech", () => {
    expect(formatYesNo(true)).toBe("Yes")
    expect(formatYesNo(false)).toBe("No")
    expect(formatYesNo(true, { YES: "Ano", NO: "Ne" })).toBe("Ano")
  })

  it("formats money with the given currency, not a hardcoded USD symbol", () => {
    const eur = formatMoney(1240, "EUR")
    expect(eur).toContain("1")
    expect(eur).toMatch(/EUR|€/)
    expect(formatSignedMoney(-180, "EUR")).toMatch(/^-/)
  })

  it("compacts calendar-sized PnL with a locale decimal", () => {
    expect(formatCompactSigned(0)).toBe("0")
    expect(formatCompactSigned(null)).toBe("—")
    expect(formatCompactSigned(240)).toBe("+240")
    expect(formatCompactSigned(-180)).toBe("-180")
    expect(formatCompactSigned(1240)).toBe("+1,2k")
    expect(formatCompactSigned(-15000)).toBe("-15k")
    expect(formatCompactSignedR(0)).toBe("0R")
    expect(formatCompactSignedR(1.95)).toBe("+2R")
    expect(formatCompactSignedR(-1.3)).toBe("-1,3R")
    expect(formatCompactSignedR(12.4)).toBe("+12R")
  })

  it("formats signed percent points", () => {
    expect(formatSignedPercentPoints(2.8)).toBe("+2,8 %")
    expect(formatSignedPercentPoints(-1)).toBe("-1 %")
  })
})
