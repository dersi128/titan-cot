export const PLAYBOOK_FIELD_TYPES = [
  "select",
  "yes_no",
  "number",
  "text",
  "multi_select",
] as const
export type PlaybookFieldType = (typeof PLAYBOOK_FIELD_TYPES)[number]

export const PLAYBOOK_STATUSES = ["active", "archived"] as const
export type PlaybookStatus = (typeof PLAYBOOK_STATUSES)[number]

export type PlaybookField = {
  id: string
  name: string
  type: PlaybookFieldType
  options: string[]
  order: number
}

export type Playbook = {
  id: string
  name: string
  description: string
  color: string | null
  status: PlaybookStatus
  fields: PlaybookField[]
  createdAt: string
}

export type TradeFieldValue = {
  fieldId: string
  value: string | number | boolean | string[] | null
}

export const JOURNAL_MODES = ["simple", "advanced"] as const
export type JournalMode = (typeof JOURNAL_MODES)[number]

export const THEMES = ["light", "slate", "dark"] as const
export type ThemeId = (typeof THEMES)[number]

export const DENSITIES = ["compact", "comfortable", "large"] as const
export type Density = (typeof DENSITIES)[number]

export type UserProfile = {
  displayName: string
  traderType: string
  bio: string
}

export type UserPreferences = {
  journalMode: JournalMode
  theme: ThemeId
  density: Density
  defaultAccount: "Personal" | "Challenge" | "Funded"
  defaultRisk: number
  defaultPlaybookId: string
}
