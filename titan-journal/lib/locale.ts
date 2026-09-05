export const LOCALE = "cs-CZ"
export const TIMEZONE = "Europe/Prague"

export function todayIsoDate(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE })
}

export function dateLocale(language: string): string {
  if (language === "sk") return "sk-SK"
  if (language === "cs") return "cs-CZ"
  return "en-US"
}

export function usesDayMonthFormat(language: string): boolean {
  return language === "cs" || language === "sk"
}
