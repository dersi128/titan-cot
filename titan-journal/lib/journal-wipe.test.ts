import { describe, expect, it } from "vitest"

import { confirmsJournalWipe, JOURNAL_WIPE_CONFIRM } from "@/lib/journal-wipe"

describe("confirmsJournalWipe", () => {
  it("accepts DELETE in any common casing", () => {
    expect(JOURNAL_WIPE_CONFIRM).toBe("DELETE")
    expect(confirmsJournalWipe("DELETE")).toBe(true)
    expect(confirmsJournalWipe("Delete")).toBe(true)
    expect(confirmsJournalWipe(" delete ")).toBe(true)
  })

  it("rejects empty or other words", () => {
    expect(confirmsJournalWipe("")).toBe(false)
    expect(confirmsJournalWipe("ANO")).toBe(false)
    expect(confirmsJournalWipe("DELETE!")).toBe(false)
  })
})
