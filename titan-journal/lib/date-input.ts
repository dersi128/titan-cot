import type { Language } from "@/types/playbook"

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function toIso(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return `${year}-${pad(month)}-${pad(day)}`
}

export function splitIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = ISO.exec(iso.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!toIso(year, month, day)) return null
  return { year, month, day }
}

export function datePlaceholder(language: Language): string {
  if (language === "en") return "mm/dd/yyyy"
  return "d. m. rrrr"
}

export function formatIsoDisplay(iso: string, language: Language): string {
  const parts = splitIsoDate(iso)
  if (!parts) return ""
  if (language === "en") {
    return `${parts.month}/${parts.day}/${parts.year}`
  }
  return `${parts.day}. ${parts.month}. ${parts.year}`
}

export function parseDateInput(raw: string, language: Language): string | null {
  const value = raw.trim()
  if (!value) return ""
  const iso = splitIsoDate(value)
  if (iso) return `${iso.year}-${pad(iso.month)}-${pad(iso.day)}`

  const dotted = value.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/)
  if (dotted) {
    return toIso(Number(dotted[3]), Number(dotted[2]), Number(dotted[1]))
  }

  const slashed = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashed) {
    const year = Number(slashed[3])
    if (language === "en") {
      return toIso(year, Number(slashed[1]), Number(slashed[2]))
    }
    return toIso(year, Number(slashed[2]), Number(slashed[1]))
  }

  return null
}
