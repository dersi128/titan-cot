import { describe, expect, it } from "vitest"

import { copyCs, copyEn, labelsFor } from "@/lib/labels"

function stringKeys(value: unknown, prefix = ""): string[] {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, nested]) => {
      const path = prefix ? `${prefix}.${key}` : key
      if (nested && typeof nested === "object") return stringKeys(nested, path)
      return [path]
    })
  }
  return prefix ? [prefix] : []
}

describe("CZ/EN dictionaries", () => {
  it("keeps the same keys in Czech and English copy", () => {
    expect(stringKeys(copyCs).sort()).toEqual(stringKeys(copyEn).sort())
  })

  it("switches chrome labels with language", () => {
    expect(labelsFor("en").copy.nav.dashboard).toBe("Dashboard")
    expect(labelsFor("cs").copy.nav.dashboard).toBe("Přehled")
    expect(labelsFor("en").ACCOUNT_LABELS.Personal).toBe("Own capital")
    expect(labelsFor("cs").ACCOUNT_LABELS.Personal).toBe("Vlastní kapitál")
    expect(labelsFor("cs").YES_NO_LABELS.YES).toBe("Ano")
    expect(labelsFor("cs").ASSET_CLASS_LABELS.Stock).toBe("Akcie")
    expect(labelsFor("cs").DATE_RANGE_LABELS.ALL).toBe("Vše")
    expect(labelsFor("cs").copy.nav.calendar).toBe("Kalendář")
    expect(labelsFor("cs").copy.calendar.openTrade).toBe("Otevřít obchod")
    expect(labelsFor("cs").copy.dashboard.performance).toBe("Výkon za období")
    expect(labelsFor("en").copy.dashboard.performance).toBe("Performance by period")
    expect(labelsFor("en").copy.calendar.weekdays).toHaveLength(7)
  })
})
