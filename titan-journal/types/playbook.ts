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
  icon: string | null
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

export const THEMES = ["light", "dark", "gold", "cyberpunk"] as const
export type ThemeId = (typeof THEMES)[number]

export const DENSITIES = ["compact", "comfortable", "large"] as const
export type Density = (typeof DENSITIES)[number]

export const LANGUAGES = ["cs", "en"] as const
export type Language = (typeof LANGUAGES)[number]

export const TRADING_MARKETS = [
  "Forex",
  "Index",
  "Commodity",
  "Metal",
  "Crypto",
  "Stock",
] as const
export type TradingMarket = (typeof TRADING_MARKETS)[number]

export type AccountCapital = {
  Personal: number
  Funded: number
  Backtesting: number
}

export type AccountRisk = {
  Personal: number
  Funded: number
  Backtesting: number
}

export type UserProfile = {
  displayName: string
  traderType: string
  bio: string
  avatar: string | null
  capital: AccountCapital
  riskByAccount: AccountRisk
  riskPercent: number
  markets: TradingMarket[]
  currency: string
}

export type UserPreferences = {
  journalMode: JournalMode
  theme: ThemeId
  density: Density
  language: Language
  sidebarCollapsed: boolean
  defaultAccount: "Personal" | "Funded" | "Backtesting"
  defaultRisk: number
  defaultPlaybookId: string
}
