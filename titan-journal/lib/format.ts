import { DEFAULT_CURRENCY, resolveCurrency } from "@/lib/currency"
import { LOCALE } from "@/lib/locale"
import { STATUS_LABELS, YES_NO_LABELS } from "@/lib/labels"
import type { TradeStatus } from "@/types/trade"

type YesNoLabels = { YES: string; NO: string }

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

export function formatCompactSigned(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  if (value === 0) return "0"
  const sign = value > 0 ? "+" : "-"
  const abs = Math.abs(value)
  const body =
    abs >= 10_000
      ? `${Math.round(abs / 1000)}k`
      : abs >= 1000
        ? `${(Math.round(abs / 100) / 10).toFixed(1).replace(/\.0$/, "")}k`
        : String(Math.round(abs))
  return `${sign}${body}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)} %`
}

export function formatSignedPercentPoints(
  value: number | null | undefined
): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const body = Math.abs(value).toLocaleString(LOCALE, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })
  if (value > 0) return `+${body} %`
  if (value < 0) return `-${body} %`
  return `0 %`
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return value.toLocaleString(LOCALE, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  })
}

export function formatYesNo(
  value: boolean,
  labels: YesNoLabels = YES_NO_LABELS
): string {
  return value ? labels.YES : labels.NO
}

export function formatStatusLabel(
  status: TradeStatus,
  labels: Record<TradeStatus, string> = STATUS_LABELS
): string {
  return labels[status]
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
