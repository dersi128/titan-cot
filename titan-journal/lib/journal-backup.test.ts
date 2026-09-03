import { describe, expect, it } from "vitest"

import {
  backupFilename,
  buildJournalBackup,
  parseJournalBackup,
} from "@/lib/journal-backup"
import { MOCK_TRADES } from "@/lib/mock-data"
import {
  DEFAULT_PREFERENCES,
  DEFAULT_PROFILE,
  hydratePlaybooks,
} from "@/lib/workspace-storage"

describe("journal backup", () => {
  it("round-trips trades, profile, and playbooks", () => {
    const backup = buildJournalBackup({
      trades: MOCK_TRADES.slice(0, 3),
      profile: { ...DEFAULT_PROFILE, displayName: "Dersisvan" },
      preferences: { ...DEFAULT_PREFERENCES, language: "cs" },
      playbooks: hydratePlaybooks(null),
      now: new Date("2026-09-03T12:00:00.000Z"),
    })

    const parsed = parseJournalBackup(JSON.parse(JSON.stringify(backup)))
    expect(parsed).not.toBeNull()
    expect(parsed?.trades).toHaveLength(3)
    expect(parsed?.profile.displayName).toBe("Dersisvan")
    expect(parsed?.preferences.language).toBe("cs")
    expect(parsed?.playbooks.length).toBeGreaterThan(0)
    expect(backupFilename(new Date(2026, 8, 3))).toBe("titan-journal-2026-09-03.json")
  })

  it("rejects files that are not a journal backup", () => {
    expect(parseJournalBackup(null)).toBeNull()
    expect(parseJournalBackup("nope")).toBeNull()
    expect(parseJournalBackup({ app: "other", trades: [] })).toBeNull()
    expect(parseJournalBackup({ app: "titan-journal" })).toBeNull()
  })
})
