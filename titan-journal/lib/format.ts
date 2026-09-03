import { DEFAULT_CURRENCY, resolveCurrency } from "@/lib/currency"
import { LOCALE } from "@/lib/locale"
import { STATUS_LABELS, YES_NO_LABELS } from "@/lib/labels"
import type { TradeStatus } from "@/types/trade"

export function formatMoney(
  value: number | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const code = resolveCurrency(currency)
  try {
    return value.toLocaleString(LOCALE, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    })
  } catch {
    return value.toLocaleString(LOCALE, {
      style: "currency",
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: 0,
    })
  }
}

export function formatSignedMoney(
  value: number | null | undefined,
  currency: string = DEFAULT_CURRENCY
): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const abs = formatMoney(Math.abs(value), currency)
  if (value > 0) return `+${abs}`
  if (value < 0) return `-${abs}`
  return abs
}

export function formatUsd(value: number | null | undefined): string {
  return formatMoney(value, DEFAULT_CURRENCY)
}

export function formatSignedUsd(value: number | null | undefined): string {
  return formatSignedMoney(value, DEFAULT_CURRENCY)
}

export function formatSignedR(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  const body = abs.toLocaleString(LOCALE, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
  if (value > 0) return `+${body}R`
  if (value < 0) return `-${body}R`
  return `0R`
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)} %`
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return value.toLocaleString(LOCALE, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  })
}

export function formatYesNo(value: boolean): string {
  return value ? YES_NO_LABELS.YES : YES_NO_LABELS.NO
}

export function formatStatusLabel(status: TradeStatus): string {
  return STATUS_LABELS[status]
}

export function formatDate(value: string): string {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
}

export function formatChartDate(value: string): string {
  if (!value) return ""
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "numeric",
  })
}

export function signedClassName(value: number | null | undefined): string {
  if (value == null || value === 0) return "text-muted-foreground"
  return value > 0 ? "text-bull" : "text-bear"
}
