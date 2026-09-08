export const GUIDE_STORAGE_KEY = "titan-journal.guide.v1"

/** Fill this when the support inbox is ready. */
export const SUPPORT_EMAIL = ""

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function loadGuideSeen(): boolean {
  if (!canUseLocalStorage()) return false
  try {
    const raw = window.localStorage.getItem(GUIDE_STORAGE_KEY)
    if (!raw) return false
    const parsed: unknown = JSON.parse(raw)
    return Boolean(
      parsed &&
        typeof parsed === "object" &&
        (parsed as { seen?: unknown }).seen === true
    )
  } catch {
    return false
  }
}

export function saveGuideSeen() {
  if (!canUseLocalStorage()) return
  try {
    window.localStorage.setItem(GUIDE_STORAGE_KEY, JSON.stringify({ seen: true }))
  } catch {
    // Private mode / quota must not crash the tree.
  }
}
