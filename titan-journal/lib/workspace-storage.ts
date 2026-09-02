import { createTitanSwingPlaybook, TITAN_SWING_PLAYBOOK_ID } from "@/lib/playbooks"
import type {
  Density,
  JournalMode,
  Playbook,
  PlaybookField,
  ThemeId,
  UserPreferences,
  UserProfile,
} from "@/types/playbook"
import { ACCOUNTS, type Account } from "@/types/trade"

export const PREFERENCES_STORAGE_KEY = "titan-journal.preferences.v1"
export const PROFILE_STORAGE_KEY = "titan-journal.profile.v1"
export const PLAYBOOKS_STORAGE_KEY = "titan-journal.playbooks.v1"

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "Trader",
  traderType: "",
  bio: "",
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  journalMode: "simple",
  theme: "slate",
  density: "comfortable",
  defaultAccount: "Personal",
  defaultRisk: 1,
  defaultPlaybookId: TITAN_SWING_PLAYBOOK_ID,
}

const DEFAULT_PLAYBOOKS: Playbook[] = [createTitanSwingPlaybook()]

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function readJson(key: string): unknown {
  if (!canUseLocalStorage()) return null
  const raw = window.localStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseLocalStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function asAccount(value: unknown): Account {
  return typeof value === "string" && (ACCOUNTS as readonly string[]).includes(value)
    ? (value as Account)
    : DEFAULT_PREFERENCES.defaultAccount
}

export function hydratePreferences(raw: unknown): UserPreferences {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const theme: ThemeId =
    row.theme === "light" || row.theme === "slate" || row.theme === "dark"
      ? row.theme
      : DEFAULT_PREFERENCES.theme
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
    defaultAccount: asAccount(row.defaultAccount),
    defaultRisk,
    defaultPlaybookId:
      typeof row.defaultPlaybookId === "string" && row.defaultPlaybookId
        ? row.defaultPlaybookId
        : DEFAULT_PREFERENCES.defaultPlaybookId,
  }
}

export function hydrateProfile(raw: unknown): UserProfile {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  return {
    displayName:
      typeof row.displayName === "string" && row.displayName.trim()
        ? row.displayName.trim()
        : DEFAULT_PROFILE.displayName,
    traderType: typeof row.traderType === "string" ? row.traderType : "",
    bio: typeof row.bio === "string" ? row.bio : "",
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
  return {
    id: row.id,
    name: row.name,
    description: typeof row.description === "string" ? row.description : "",
    color: typeof row.color === "string" ? row.color : null,
    status: row.status === "archived" ? "archived" : "active",
    fields,
    createdAt:
      typeof row.createdAt === "string"
        ? row.createdAt
        : new Date(0).toISOString(),
  }
}

export function hydratePlaybooks(raw: unknown): Playbook[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_PLAYBOOKS.map((item) => ({
    ...item,
    fields: item.fields.map((field) => ({ ...field })),
  }))
  const playbooks = raw
    .map((item) => hydratePlaybook(item))
    .filter((item): item is Playbook => item != null)
  if (!playbooks.some((item) => item.id === TITAN_SWING_PLAYBOOK_ID)) {
    playbooks.unshift(createTitanSwingPlaybook())
  }
  return playbooks
}

type Listener = () => void

function createStore<T>(key: string, read: () => T, fallback: T) {
  const listeners = new Set<Listener>()
  let cachedRaw: string | null | undefined
  let cached: T = fallback
  let started = false

  function snapshot(): T {
    if (!canUseLocalStorage()) return fallback
    if (!started) {
      started = true
      if (readJson(key) == null) writeJson(key, fallback)
    }
    const raw = window.localStorage.getItem(key)
    if (raw === cachedRaw) return cached
    cachedRaw = raw
    cached = read()
    return cached
  }

  return {
    get(): T {
      return snapshot()
    },
    set(value: T): T {
      writeJson(key, value)
      cachedRaw = canUseLocalStorage() ? window.localStorage.getItem(key) : JSON.stringify(value)
      cached = value
      listeners.forEach((listener) => listener())
      return value
    },
    subscribe(listener: Listener) {
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
  () => hydrateProfile(readJson(PROFILE_STORAGE_KEY)),
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
  root.style.colorScheme = preferences.theme === "light" ? "light" : "dark"
  root.classList.toggle("dark", preferences.theme !== "light")
}

export const THEME_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("${PREFERENCES_STORAGE_KEY}")||"{}");var t=p.theme==="light"||p.theme==="dark"||p.theme==="slate"?p.theme:"slate";var d=p.density==="compact"||p.density==="large"||p.density==="comfortable"?p.density:"comfortable";var r=document.documentElement;r.setAttribute("data-theme",t);r.setAttribute("data-density",d);r.style.colorScheme=t==="light"?"light":"dark";r.classList.toggle("dark",t!=="light");}catch(e){}`
