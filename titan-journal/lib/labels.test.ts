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
    expect(labelsFor("cs").ACCOUNT_LABELS.Backtesting).toBe("Backtesting")
    expect(labelsFor("cs").DATE_RANGE_LABELS.ALL).toBe("Vše")
    expect(labelsFor("cs").copy.dashboard.hello).toBe("Ahoj, {name}")
    expect(labelsFor("cs").copy.dashboard.overview["30D"]).toContain("30 dní")
    expect(labelsFor("cs").DATE_RANGE_LABELS["6M"]).toBe("6M")
    expect(labelsFor("cs").DATE_RANGE_LABELS.CUSTOM).toBe("Vlastní")
    expect(labelsFor("cs").copy.nav.hints.journal).toBe("Všechny obchody")
    expect(labelsFor("en").copy.sidebar.motto).toBe("Discipline creates freedom.")
    expect(labelsFor("cs").copy.sidebar.themes.gold).toBe("Modro-zlatý")
    expect(labelsFor("cs").copy.calendar.openTrade).toBe("Otevřít obchod")
    expect(labelsFor("cs").copy.dashboard.performance).toBe("Výkon v čase")
    expect(labelsFor("en").copy.dashboard.performance).toBe("Performance over time")
    expect(labelsFor("cs").copy.settings.exportJournal).toBe("Export")
    expect(labelsFor("cs").copy.analytics.edgeYes).toBe("Má edge")
    expect(labelsFor("cs").copy.analytics.perTrade).toBe("na obchod")
    expect(labelsFor("cs").copy.analytics.bySetup).toBe("Výsledky podle setupů")
    expect(labelsFor("cs").copy.journal.clearFilters).toBe("Vymazat filtry")
    expect(labelsFor("cs").copy.playbook.active).toBe("Aktivní")
    expect(labelsFor("cs").copy.playbook.updated).toBe("Aktualizováno")
    expect(labelsFor("en").copy.playbook.cumulativeR).toBe("Cumulative R")
    expect(labelsFor("cs").copy.form.templates).toBe("Šablony obchodů")
    expect(labelsFor("en").copy.form.preview).toBe("Preview")
    expect(labelsFor("en").copy.calendar.weekdays).toHaveLength(7)
  })
})
