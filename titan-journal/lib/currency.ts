export const DEFAULT_CURRENCY = "USD"

const ISO_CURRENCY = /^[A-Z]{3}$/

export function resolveCurrency(value: string | null | undefined): string {
  if (!value) return DEFAULT_CURRENCY
  const code = value.trim().toUpperCase()
  return ISO_CURRENCY.test(code) ? code : DEFAULT_CURRENCY
}
