import { describe, expect, it } from "vitest"

import { copyCs, copyEn, copySk, labelsFor } from "@/lib/labels"

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

describe("CZ/SK/EN dictionaries", () => {
  it("keeps the same keys in Czech, Slovak, and English copy", () => {
    expect(stringKeys(copyCs).sort()).toEqual(stringKeys(copyEn).sort())
    expect(stringKeys(copySk).sort()).toEqual(stringKeys(copyEn).sort())
  })

  it("switches chrome labels with language", () => {
    expect(labelsFor("en").copy.nav.dashboard).toBe("Dashboard")
    expect(labelsFor("cs").copy.nav.dashboard).toBe("Přehled")
    expect(labelsFor("en").ACCOUNT_LABELS.Personal).toBe("Personal capital")
    expect(labelsFor("cs").ACCOUNT_LABELS.Personal).toBe("Osobní kapitál")
    expect(labelsFor("cs").ACCOUNT_LABELS.Funded).toBe("Prop")
    expect(labelsFor("cs").ACCOUNT_LABELS.Backtesting).toBe("Backtesting")
    expect(labelsFor("cs").DATE_RANGE_LABELS.ALL).toBe("Vše")
    expect(labelsFor("cs").copy.dashboard.hello).toBe("Ahoj, {name}")
    expect(labelsFor("cs").copy.dashboard.overview["30D"]).toContain("30 dní")
    expect(labelsFor("cs").DATE_RANGE_LABELS["6M"]).toBe("6M")
    expect(labelsFor("cs").DATE_RANGE_LABELS.CUSTOM).toBe("Vlastní")
    expect(labelsFor("cs").copy.nav.hints.journal).toBe("Všechny obchody")
    expect(labelsFor("en").copy.sidebar.motto).toBe("Discipline creates freedom.")
    expect(labelsFor("cs").copy.sidebar.themes.gold).toBe("Modro-zlatý")
    expect(labelsFor("cs").copy.calendar.openTrade).toBe("Otevřený obchod")
    expect(labelsFor("cs").copy.calendar.today).toBe("Dnes")
    expect(labelsFor("cs").copy.calendar.openDetail).toBe("Otevřít detail")
    expect(labelsFor("cs").copy.calendar.totalResult).toBe("Výsledek")
    expect(labelsFor("en").copy.form.resultHint).toContain("closed")
    expect(labelsFor("cs").copy.dashboard.performance).toBe("Výkon v čase")
    expect(labelsFor("en").copy.dashboard.performance).toBe("Performance over time")
    expect(labelsFor("cs").copy.settings.exportJournal).toBe("Export")
    expect(labelsFor("cs").copy.settings.importAdded).toContain("{n}")
    expect(labelsFor("cs").copy.analytics.edgeYes).toBe("Má edge")
    expect(labelsFor("cs").copy.analytics.perTrade).toBe("na obchod")
    expect(labelsFor("cs").copy.analytics.bySetup).toBe("Výsledky podle setupů")
    expect(labelsFor("en").copy.analytics.byPlan).toBe("By plan")
    expect(labelsFor("cs").copy.analytics.byEmotion).toBe("Podle emoce")
    expect(labelsFor("sk").PLAN_FOLLOWED_LABELS.Partially).toBe("Čiastočne")
    expect(labelsFor("cs").EXECUTION_QUALITY_LABELS.Poor).toBe("Špatná")
    expect(labelsFor("sk").EMOTION_LABELS.Calm).toBe("Pokoj")
    expect(labelsFor("en").copy.detail.executionQuality).toBe("Execution")
    expect(labelsFor("en").copy.analytics.byFields).toBe("By playbook fields")
    expect(labelsFor("cs").copy.analytics.value).toBe("Hodnota")
    expect(labelsFor("cs").copy.journal.clearFilters).toBe("Vymazat filtry")
    expect(labelsFor("en").copy.journal.clearAllHint).toContain("DELETE")
    expect(labelsFor("cs").copy.playbook.active).toBe("Aktivní")
    expect(labelsFor("cs").copy.playbook.updated).toBe("Aktualizováno")
    expect(labelsFor("en").copy.playbook.cumulativeR).toBe("Cumulative R")
    expect(labelsFor("cs").copy.playbook.delete).toBe("Smazat")
    expect(labelsFor("sk").copy.nav.dashboard).toBe("Prehľad")
    expect(labelsFor("sk").copy.journal.title).toBe("Denník")
    expect(labelsFor("sk").ACCOUNT_LABELS.Personal).toBe("Osobný kapitál")
    expect(labelsFor("sk").DATE_RANGE_LABELS.ALL).toBe("Všetko")
    expect(labelsFor("sk").copy.playbook.delete).toBe("Zmazať")
    expect(labelsFor("cs").copy.form.templates).toBe("Šablony obchodů")
    expect(labelsFor("en").copy.form.preview).toBe("Preview")
    expect(labelsFor("cs").copy.form.screenshotUrl).toBe("URL obrázku")
    expect(labelsFor("en").copy.form.screenshotHint).toContain("paste")
    expect(labelsFor("cs").copy.emptyStart.title).toBe("Tvůj journal je připravený.")
    expect(labelsFor("en").copy.emptyStart.sample).toBe("Show sample journal")
    expect(labelsFor("cs").copy.guide.skip).toBe("Přeskočit")
    expect(labelsFor("en").copy.guide.open).toBe("Guide")
    expect(labelsFor("cs").copy.guide.start).toBe("Začít průvodce")
    expect(labelsFor("cs").copy.guide.welcomeTitle).toBe("Vítej v TITAN JOURNAL")
    expect(labelsFor("cs").copy.guide.edgeLoop).toContain("Zapisuj")
    expect(labelsFor("cs").copy.guide.importFormats).toContain("CSV")
    expect(labelsFor("cs").copy.guide.welcomeBody).toMatch(/Křivk/i)
    expect(labelsFor("cs").copy.guide.welcomeBody).not.toMatch(/Křivka Curve/i)
    expect(labelsFor("cs").copy.journal.empty).toBe(
      "Pro tento výběr nejsou žádné obchody."
    )
    expect(labelsFor("en").copy.journal.empty).toBe(
      "There are no trades for this selection."
    )
    expect(labelsFor("en").copy.dashboard.averageR).toBe("Avg R")
    expect(labelsFor("en").copy.analytics.profitFactor).toBe("Profit Factor")
    expect(labelsFor("cs").copy.dashboard.winRateWhy).toContain("BE")
    expect(labelsFor("en").copy.guide.overviewLead).toContain("Avg R")
    expect(labelsFor("cs").copy.guide.playbookLead.toLowerCase()).toContain("setup")
    expect(labelsFor("cs").copy.settings.guideOpen).toBe("Otevřít průvodce")
    expect(labelsFor("cs").copy.profile.riskMoney).toBe("Riziko na obchod")
    expect(labelsFor("cs").copy.profile.riskWhy).toContain("PnL")
    expect(labelsFor("en").copy.calendar.weekdays).toHaveLength(7)
    expect(labelsFor("sk").copy.calendar.weekdays).toHaveLength(7)
  })
})
