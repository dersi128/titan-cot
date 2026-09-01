export const LOCALE = "cs-CZ"
export const TIMEZONE = "Europe/Prague"

export function todayIsoDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE })
}
