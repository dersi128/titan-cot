import { describe, expect, it } from "vitest"

import { TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import {
  hydratePlaybook,
  hydratePlaybooks,
  hydratePreferences,
  hydrateProfile,
} from "@/lib/workspace-storage"

describe("workspace hydration", () => {
  it("defaults journal mode to simple and theme to slate", () => {
    expect(hydratePreferences(null)).toMatchObject({
      journalMode: "simple",
      theme: "slate",
      density: "comfortable",
    })
    expect(hydratePreferences({ journalMode: "advanced", theme: "light" })).toMatchObject({
      journalMode: "advanced",
      theme: "light",
    })
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

  it("keeps TITAN Swing when the stored list omits it", () => {
    const playbooks = hydratePlaybooks([
      { id: "pb-other", name: "Scalping", fields: [] },
    ])
    expect(playbooks[0]?.id).toBe(TITAN_SWING_PLAYBOOK_ID)
    expect(playbooks.some((item) => item.id === "pb-other")).toBe(true)
  })

  it("falls back to a display name", () => {
    expect(hydrateProfile({ displayName: "  Maya  " }).displayName).toBe("Maya")
    expect(hydrateProfile({}).displayName).toBe("Trader")
  })
})
