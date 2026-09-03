import {
  DATE_RANGES,
  defaultCustomRange,
  type CustomRange,
  type DateRange,
} from "@/lib/date-range"
import { normalizeAccount, type Account } from "@/types/trade"

export const CHROME_STORAGE_KEY = "titan-journal.chrome.v1"

export type ChromeSnapshot = {
  account: Account
  range: DateRange
  custom: CustomRange | null
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value)
}

export function hydrateCustomRange(raw: unknown): CustomRange | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  if (!isIsoDate(row.start) || !isIsoDate(row.end)) return null
  return { start: row.start, end: row.end }
}

export function hydrateChrome(raw: unknown): ChromeSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const row = raw as Record<string, unknown>
  const range = DATE_RANGES.includes(row.range as DateRange)
    ? (row.range as DateRange)
    : "ALL"
  const custom = hydrateCustomRange(row.custom)
  return {
    account: normalizeAccount(row.account),
    range,
    custom: range === "CUSTOM" ? custom ?? defaultCustomRange() : custom,
  }
}

export function loadChrome(): ChromeSnapshot | null {
  if (!canUseLocalStorage()) return null
  try {
    const raw = window.localStorage.getItem(CHROME_STORAGE_KEY)
    if (!raw) return null
    return hydrateChrome(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveChrome(snapshot: ChromeSnapshot) {
  if (!canUseLocalStorage()) return
  try {
    window.localStorage.setItem(CHROME_STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Private mode / quota must not crash the tree.
  }
}
