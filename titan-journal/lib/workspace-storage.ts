import { DEFAULT_CURRENCY, resolveCurrency } from "@/lib/currency"
import {
  createDemoPlaybook,
  isLegacyTitanFactory,
  normalizePlaybookName,
  TITAN_SWING_PLAYBOOK_ID,
} from "@/lib/playbooks"
import type {
  AccountCapital,
  AccountRisk,
  Density,
  JournalMode,
  Language,
  Playbook,
  PlaybookField,
  ThemeId,
  TradingMarket,
  UserPreferences,
  UserProfile,
} from "@/types/playbook"
import { LANGUAGES, THEMES, TRADING_MARKETS } from "@/types/playbook"
import { normalizeAccount, type Account } from "@/types/trade"

export const PREFERENCES_STORAGE_KEY = "titan-journal.preferences.v1"
export const PROFILE_STORAGE_KEY = "titan-journal.profile.v1"
export const PLAYBOOKS_STORAGE_KEY = "titan-journal.playbooks.v1"

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "Trader",
  traderType: "",
  bio: "",
  avatar: null,
  capital: {
    Personal: 10_000,
    Funded: 0,
    Backtesting: 100_000,
  },
  riskByAccount: {
    Personal: 1,
    Funded: 1,
    Backtesting: 1,
  },
  riskPercent: 1,
  markets: ["Forex"],
  currency: DEFAULT_CURRENCY,
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  journalMode: "simple",
  theme: "dark",
  density: "comfortable",
  language: "en",
  sidebarCollapsed: false,
  defaultAccount: "Personal",
  defaultRisk: 1,
  defaultPlaybookId: TITAN_SWING_PLAYBOOK_ID,
}

const DEFAULT_PLAYBOOKS: Playbook[] = [createDemoPlaybook()]

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readRaw(key: string): string | null {
  if (!canUseLocalStorage()) return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function readJson(key: string): unknown {
  const raw = readRaw(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseLocalStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private mode / quota must not crash the tree.
  }
}

function asAccount(value: unknown): Account {
  return normalizeAccount(value)
}

function asTheme(value: unknown): ThemeId {
  if (value === "slate") return "dark"
  return typeof value === "string" && (THEMES as readonly string[]).includes(value)
    ? (value as ThemeId)
    : DEFAULT_PREFERENCES.theme
}

function asLanguage(value: unknown): Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value)
    ? (value as Language)
    : DEFAULT_PREFERENCES.language
}

export function isDarkTheme(theme: ThemeId): boolean {
  return theme !== "light"
}

export function hydratePreferences(raw: unknown): UserPreferences {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const theme = asTheme(row.theme)
  const density: Density =
    row.density === "compact" ||
    row.density === "comfortable" ||
    row.density === "large"
      ? row.density
      : DEFAULT_PREFERENCES.density
  const journalMode: JournalMode =
    row.journalMode === "advanced" ? "advanced" : "simple"
  const defaultRisk =
    typeof row.defaultRisk === "number" && Number.isFinite(row.defaultRisk)
      ? row.defaultRisk
      : DEFAULT_PREFERENCES.defaultRisk

  return {
    journalMode,
    theme,
    density,
    language: asLanguage(row.language),
    sidebarCollapsed: row.sidebarCollapsed === true,
    defaultAccount: asAccount(row.defaultAccount),
    defaultRisk,
    defaultPlaybookId:
      typeof row.defaultPlaybookId === "string" && row.defaultPlaybookId
        ? row.defaultPlaybookId
        : DEFAULT_PREFERENCES.defaultPlaybookId,
  }
}

function hydrateAvatar(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  if (!raw.startsWith("data:image/")) return null
  if (raw.length > 400_000) return null
  return raw
}

function asMoney(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }
  return fallback
}

function hydrateCapital(raw: unknown): AccountCapital {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  return {
    Personal: asMoney(row.Personal, DEFAULT_PROFILE.capital.Personal),
    Funded: asMoney(row.Funded, DEFAULT_PROFILE.capital.Funded),
    Backtesting: asMoney(
      row.Backtesting,
      asMoney(row.Challenge, DEFAULT_PROFILE.capital.Backtesting)
    ),
  }
}

function asRisk(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed >= 0) return parsed
  }
  return fallback
}

function hydrateRiskByAccount(raw: unknown, fallbackRisk: number): AccountRisk {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  return {
    Personal: asRisk(row.Personal, fallbackRisk),
    Funded: asRisk(row.Funded, fallbackRisk),
    Backtesting: asRisk(row.Backtesting, fallbackRisk),
  }
}

function hydrateMarkets(raw: unknown): TradingMarket[] {
  if (!Array.isArray(raw)) return [...DEFAULT_PROFILE.markets]
  return TRADING_MARKETS.filter((market) => raw.includes(market))
}

export function hydrateProfile(
  raw: unknown,
  fallbackRisk = DEFAULT_PROFILE.riskPercent
): UserProfile {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const riskPercent =
    typeof row.riskPercent === "number" && Number.isFinite(row.riskPercent)
      ? row.riskPercent
      : fallbackRisk
  const riskByAccount = hydrateRiskByAccount(
    row.riskByAccount,
    riskPercent
  )
  return {
    displayName:
      typeof row.displayName === "string" && row.displayName.trim()
        ? row.displayName.trim()
        : DEFAULT_PROFILE.displayName,
    traderType: typeof row.traderType === "string" ? row.traderType : "",
    bio: typeof row.bio === "string" ? row.bio : "",
    avatar: hydrateAvatar(row.avatar),
    capital: hydrateCapital(row.capital),
    riskByAccount,
    riskPercent: riskByAccount.Personal,
    markets: hydrateMarkets(row.markets),
    currency: resolveCurrency(
      typeof row.currency === "string" ? row.currency : DEFAULT_PROFILE.currency
    ),
  }
}

function hydrateField(raw: unknown, index: number): PlaybookField | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  if (typeof row.id !== "string" || typeof row.name !== "string") return null
  const type =
    row.type === "select" ||
    row.type === "yes_no" ||
    row.type === "number" ||
    row.type === "text" ||
    row.type === "multi_select"
      ? row.type
      : "text"
  const options = Array.isArray(row.options)
    ? row.options.filter((item): item is string => typeof item === "string")
    : []
  return {
    id: row.id,
    name: row.name,
    type,
    options,
    order: typeof row.order === "number" ? row.order : index,
  }
}

export function hydratePlaybook(raw: unknown): Playbook | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  if (typeof row.id !== "string" || typeof row.name !== "string") return null
  const fields = Array.isArray(row.fields)
    ? row.fields
        .map((item, index) => hydrateField(item, index))
        .filter((item): item is PlaybookField => item != null)
    : []
  const playbook: Playbook = {
    id: row.id,
    name: normalizePlaybookName(row.id, row.name),
    description: typeof row.description === "string" ? row.description : "",
    color: typeof row.color === "string" ? row.color : null,
    icon: typeof row.icon === "string" && row.icon.trim() ? row.icon.trim().slice(0, 2) : null,
    status: row.status === "archived" ? "archived" : "active",
    fields,
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : new Date(0).toISOString(),
  }
  if (isLegacyTitanFactory(playbook)) return createDemoPlaybook()
  return playbook
}

function cloneDefaultPlaybooks(): Playbook[] {
  return DEFAULT_PLAYBOOKS.map((item) => ({
    ...item,
    fields: item.fields.map((field) => ({ ...field })),
  }))
}

export function hydratePlaybooks(raw: unknown): Playbook[] {
  if (raw == null || !Array.isArray(raw)) return cloneDefaultPlaybooks()
  return raw
    .map((item) => hydratePlaybook(item))
    .filter((item): item is Playbook => item != null)
}

type Listener = () => void

function createStore<T>(key: string, read: () => T, fallback: T) {
  const listeners = new Set<Listener>()
  let cachedRaw: string | null | undefined
  let cached: T = fallback

  function snapshot(): T {
    if (!canUseLocalStorage()) return fallback
    const raw = readRaw(key)
    if (raw == null) return fallback
    if (raw === cachedRaw) return cached
    cachedRaw = raw
    cached = read()
    return cached
  }

  function seed() {
    if (readRaw(key) == null) writeJson(key, fallback)
  }

  return {
    get(): T {
      return snapshot()
    },
    set(value: T): T {
      writeJson(key, value)
      cachedRaw = readRaw(key)
      cached = value
      listeners.forEach((listener) => listener())
      return value
    },
    subscribe(listener: Listener) {
      seed()
      snapshot()
      listeners.add(listener)
      if (typeof window !== "undefined") {
        window.addEventListener("storage", listener)
      }
      return () => {
        listeners.delete(listener)
        if (typeof window !== "undefined") {
          window.removeEventListener("storage", listener)
        }
      }
    },
  }
}

export const preferencesStore = createStore(
  PREFERENCES_STORAGE_KEY,
  () => hydratePreferences(readJson(PREFERENCES_STORAGE_KEY)),
  DEFAULT_PREFERENCES
)

export const profileStore = createStore(
  PROFILE_STORAGE_KEY,
  () =>
    hydrateProfile(
      readJson(PROFILE_STORAGE_KEY),
      hydratePreferences(readJson(PREFERENCES_STORAGE_KEY)).defaultRisk
    ),
  DEFAULT_PROFILE
)

export const playbookStore = createStore(
  PLAYBOOKS_STORAGE_KEY,
  () => hydratePlaybooks(readJson(PLAYBOOKS_STORAGE_KEY)),
  DEFAULT_PLAYBOOKS
)

export function applyDocumentAppearance(preferences: UserPreferences) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = preferences.theme
  root.dataset.density = preferences.density
  root.lang = preferences.language === "cs" ? "cs" : "en"
  const dark = isDarkTheme(preferences.theme)
  root.style.colorScheme = dark ? "dark" : "light"
  root.classList.toggle("dark", dark)
}

export const THEME_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${PREFERENCES_STORAGE_KEY}")||"{}");var ok=["light","dark","gold","cyberpunk"];var t=p.theme==="slate"?"dark":ok.indexOf(p.theme)>=0?p.theme:"dark";var d=p.density==="compact"||p.density==="large"||p.density==="comfortable"?p.density:"comfortable";var lang=p.language==="cs"?"cs":"en";var r=document.documentElement;r.setAttribute("data-theme",t);r.setAttribute("data-density",d);r.setAttribute("lang",lang);var dark=t!=="light";r.style.colorScheme=dark?"dark":"light";r.classList.toggle("dark",dark);}catch(e){}`
