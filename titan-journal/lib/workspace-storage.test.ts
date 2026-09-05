import { describe, expect, it } from "vitest"

import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import {
  hydratePlaybook,
  hydratePlaybooks,
  hydratePreferences,
  hydrateProfile,
} from "@/lib/workspace-storage"

describe("workspace hydration", () => {
  it("defaults journal mode to simple and theme to dark", () => {
    expect(hydratePreferences(null)).toMatchObject({
      journalMode: "simple",
      theme: "dark",
      density: "comfortable",
      language: "en",
      sidebarCollapsed: false,
    })
    expect(hydratePreferences({ sidebarCollapsed: true }).sidebarCollapsed).toBe(true)
    expect(hydratePreferences({ theme: "slate" }).theme).toBe("dark")
    expect(hydratePreferences({ journalMode: "advanced", theme: "light" })).toMatchObject({
      journalMode: "advanced",
      theme: "light",
    })
    expect(hydratePreferences({ theme: "cyberpunk" }).theme).toBe("cyberpunk")
    expect(hydratePreferences({ theme: "gold" }).theme).toBe("gold")
    expect(hydratePreferences({ language: "cs" }).language).toBe("cs")
    expect(hydratePreferences({ language: "sk" }).language).toBe("sk")
    expect(hydratePreferences({ language: "nope" }).language).toBe("en")
    expect(hydratePreferences({ defaultAccount: "Challenge" }).defaultAccount).toBe(
      "Backtesting"
    )
  })

  it("hydrates a stored playbook that predates icon", () => {
    const playbook = hydratePlaybook({
      id: "pb-breakout",
      name: "Breakout",
      description: "Range break",
      color: "#2f9e6a",
      status: "active",
      createdAt: "2026-09-01T00:00:00.000Z",
      fields: [
        {
          id: "session",
          name: "Session",
          type: "select",
          options: ["London", "NY"],
          order: 0,
        },
      ],
    })
    expect(playbook).toMatchObject({
      id: "pb-breakout",
      name: "Breakout",
      icon: null,
      color: "#2f9e6a",
    })
    expect(playbook?.fields[0]?.name).toBe("Session")
  })

  it("seeds Demo when nothing is stored", () => {
    const playbooks = hydratePlaybooks(null)
    expect(playbooks).toHaveLength(1)
    expect(playbooks[0]?.id).toBe(TITAN_SWING_PLAYBOOK_ID)
    expect(playbooks[0]?.name).toBe("Demo")
    expect(playbooks[0]?.fields.map((item) => item.id)).toEqual([
      "demo-setup",
      "demo-session",
    ])
  })

  it("keeps an empty stored playbook list empty", () => {
    expect(hydratePlaybooks([])).toEqual([])
  })

  it("does not inject Demo when the stored list has other playbooks", () => {
    const playbooks = hydratePlaybooks([
      { id: "pb-other", name: "Scalping", fields: [] },
    ])
    expect(playbooks).toHaveLength(1)
    expect(playbooks[0]?.id).toBe("pb-other")
  })

  it("replaces a stored TITAN Swing factory with Demo", () => {
    const playbooks = hydratePlaybooks([
      {
        id: TITAN_SWING_PLAYBOOK_ID,
        name: "Swing",
        fields: [
          { id: "titan-trend", name: "Trend", type: "select", options: [], order: 0 },
        ],
      },
    ])
    expect(playbooks[0]?.name).toBe("Demo")
    expect(playbooks[0]?.fields.some((item) => item.id === "titan-trend")).toBe(
      false
    )
  })

  it("renames a stored TITAN Swing playbook to Demo", () => {
    const playbook = hydratePlaybook({
      id: TITAN_SWING_PLAYBOOK_ID,
      name: "TITAN Swing",
      fields: [],
    })
    expect(playbook?.name).toBe("Demo")
  })

  it("falls back to a display name", () => {
    expect(hydrateProfile({ displayName: "  Maya  " }).displayName).toBe("Maya")
    expect(hydrateProfile({}).displayName).toBe("Trader")
    expect(hydrateProfile({}).avatar).toBeNull()
    expect(
      hydrateProfile({ avatar: "data:image/jpeg;base64,abc" }).avatar
    ).toBe("data:image/jpeg;base64,abc")
    expect(hydrateProfile({ avatar: "https://evil.example/x.png" }).avatar).toBeNull()
  })

  it("fills capital, risk, markets, and currency on an old profile", () => {
    const profile = hydrateProfile({ displayName: "Maya" })
    expect(profile.capital).toEqual({
      Personal: 10_000,
      Funded: 0,
      Backtesting: 100_000,
    })
    expect(profile.riskPercent).toBe(1)
    expect(profile.riskByAccount).toEqual({
      Personal: 1,
      Funded: 1,
      Backtesting: 1,
    })
    expect(profile.markets).toEqual(["Forex"])
    expect(profile.currency).toBe("USD")
  })

  it("inherits settings risk when the profile has none", () => {
    expect(hydrateProfile({}, 2).riskPercent).toBe(2)
    expect(hydrateProfile({}, 2).riskByAccount.Funded).toBe(2)
    expect(hydrateProfile({ riskPercent: 0.5 }, 2).riskPercent).toBe(0.5)
    expect(hydrateProfile({ riskPercent: 0.5 }, 2).riskByAccount.Personal).toBe(0.5)
  })

  it("keeps saved capital and an empty market list", () => {
    const profile = hydrateProfile({
      capital: { Personal: 25000, Backtesting: 50_000, Funded: 200_000 },
      riskPercent: 0.75,
      markets: ["Index", "Forex", "Unknown"],
    })
    expect(profile.capital.Personal).toBe(25_000)
    expect(profile.riskByAccount.Funded).toBe(0.75)
    expect(
      hydrateProfile({
        riskPercent: 1,
        riskByAccount: { Personal: 0.5, Funded: 2, Backtesting: 1.25 },
      }).riskByAccount
    ).toEqual({ Personal: 0.5, Funded: 2, Backtesting: 1.25 })
    expect(profile.markets).toEqual(["Forex", "Index"])
    expect(
      hydrateProfile({ markets: [] }).markets
    ).toEqual([])
    expect(hydrateProfile({ currency: "eur" }).currency).toBe("EUR")
    expect(hydrateProfile({ currency: "nope" }).currency).toBe("USD")
    expect(
      hydrateProfile({ capital: { Challenge: 50_000 } }).capital.Backtesting
    ).toBe(50_000)
  })
})
