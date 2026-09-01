import type { TradeStatus } from "@/types/trade"

export function formatSignedUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const abs = Math.abs(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
  if (value > 0) return `+${abs}`
  if (value < 0) return `-${abs}`
  return abs
}

export function formatSignedR(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  const body = Number.isInteger(abs) ? String(abs) : abs.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")
  if (value > 0) return `+${body}R`
  if (value < 0) return `-${body}R`
  return "0R"
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${Math.round(value * 100)}%`
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return value.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "")
}

export function formatYesNo(value: boolean): "YES" | "NO" {
  return value ? "YES" : "NO"
}

export function formatStatusLabel(status: TradeStatus): string {
  return status
}

export function formatDate(value: string): string {
  if (!value) return "—"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function signedClassName(value: number | null | undefined): string {
  if (value == null || value === 0) return "text-muted-foreground"
  return value > 0 ? "text-bull" : "text-bear"
}
