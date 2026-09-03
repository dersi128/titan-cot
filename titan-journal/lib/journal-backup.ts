import { isoDateLocal } from "@/lib/date-range"
import { hydrateTrades } from "@/lib/trade-hydration"
import {
  hydratePlaybooks,
  hydratePreferences,
  hydrateProfile,
} from "@/lib/workspace-storage"
import type { Playbook, UserPreferences, UserProfile } from "@/types/playbook"
import type { Trade } from "@/types/trade"

export const JOURNAL_BACKUP_APP = "titan-journal"
export const JOURNAL_BACKUP_VERSION = 1

export type JournalBackup = {
  app: typeof JOURNAL_BACKUP_APP
  version: number
  exportedAt: string
  trades: Trade[]
  profile: UserProfile
  preferences: UserPreferences
  playbooks: Playbook[]
}

export function buildJournalBackup(input: {
  trades: Trade[]
  profile: UserProfile
  preferences: UserPreferences
  playbooks: Playbook[]
  now?: Date
}): JournalBackup {
  return {
    app: JOURNAL_BACKUP_APP,
    version: JOURNAL_BACKUP_VERSION,
    exportedAt: (input.now ?? new Date()).toISOString(),
    trades: input.trades,
    profile: input.profile,
    preferences: input.preferences,
    playbooks: input.playbooks,
  }
}

export function parseJournalBackup(raw: unknown): JournalBackup | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  if (row.app != null && row.app !== JOURNAL_BACKUP_APP) return null
  if (!Array.isArray(row.trades)) return null

  const trades = hydrateTrades(row.trades)
  const profile = hydrateProfile(row.profile)
  const preferences = hydratePreferences(row.preferences)
  const playbooks = hydratePlaybooks(row.playbooks)

  return {
    app: JOURNAL_BACKUP_APP,
    version:
      typeof row.version === "number" && Number.isFinite(row.version)
        ? row.version
        : JOURNAL_BACKUP_VERSION,
    exportedAt:
      typeof row.exportedAt === "string" ? row.exportedAt : new Date().toISOString(),
    trades,
    profile,
    preferences,
    playbooks,
  }
}

export function backupFilename(now = new Date()): string {
  return `titan-journal-${isoDateLocal(now)}.json`
}
