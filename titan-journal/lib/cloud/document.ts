import { buildJournalBackup, parseJournalBackup, type JournalBackup } from "@/lib/journal-backup"
import { tradeRepository, TRADES_STORAGE_KEY } from "@/lib/storage"
import { profileStore, preferencesStore, playbookStore, PROFILE_STORAGE_KEY, PREFERENCES_STORAGE_KEY, PLAYBOOKS_STORAGE_KEY, DEFAULT_PROFILE, DEFAULT_PREFERENCES } from "@/lib/workspace-storage"
import { installMemory } from "./persistence"

export function captureDocument(): JournalBackup {
  return buildJournalBackup({ trades: tradeRepository.getAll(), profile: profileStore.get(), preferences: preferencesStore.get(), playbooks: playbookStore.get() })
}
export function emptyDocument(): JournalBackup {
  return buildJournalBackup({ trades: [], profile: DEFAULT_PROFILE, preferences: DEFAULT_PREFERENCES, playbooks: [] })
}
export function localDocument(): JournalBackup {
  const read = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null")
  const parsed = parseJournalBackup({ trades: read(TRADES_STORAGE_KEY) ?? [], profile: read(PROFILE_STORAGE_KEY), preferences: read(PREFERENCES_STORAGE_KEY), playbooks: read(PLAYBOOKS_STORAGE_KEY) })
  if (!parsed) throw new Error("Invalid local journal")
  return parsed
}
export function validateDocument(raw: unknown): JournalBackup {
  const doc = raw as JournalBackup | null
  if (!doc || doc.app !== "titan-journal" || doc.version !== 1 || !Array.isArray(doc.trades) ||
      !Array.isArray(doc.playbooks) || !doc.profile || !doc.preferences) throw new Error("Invalid cloud journal")
  const parsed = parseJournalBackup(doc)
  if (!parsed || parsed.trades.length !== doc.trades.length || parsed.playbooks.length !== doc.playbooks.length) throw new Error("Invalid cloud journal")
  if (new TextEncoder().encode(JSON.stringify(doc)).length > 4_000_000) throw new Error("Journal exceeds test storage limit (4 MB)")
  return parsed
}
export function applyDocument(doc: JournalBackup) {
  installMemory({
    [TRADES_STORAGE_KEY]: JSON.stringify(doc.trades),
    [PROFILE_STORAGE_KEY]: JSON.stringify(doc.profile),
    [PREFERENCES_STORAGE_KEY]: JSON.stringify(doc.preferences),
    [PLAYBOOKS_STORAGE_KEY]: JSON.stringify(doc.playbooks),
  })
}
