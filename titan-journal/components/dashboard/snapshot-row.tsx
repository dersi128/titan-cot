"use client"

import { formatSignedMoney, formatSignedR, signedClassName } from "@/lib/format"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { DashboardSnapshots } from "@/lib/dashboard-snapshots"

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 0)
  const span = max - min || 1
  const w = 120
  const h = 36
  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * w
    const y = h - ((value - min) / span) * h
    return { x, y }
  })
  const line = coords.map((point) => `${point.x},${point.y}`).join(" ")
  const area = `${line} ${w},${h} 0,${h}`
  const up = (values[values.length - 1] ?? 0) >= 0
  const stroke = up ? "var(--bull)" : "var(--bear)"
  const fill = up
    ? "color-mix(in srgb, var(--bull) 22%, transparent)"
    : "color-mix(in srgb, var(--bear) 22%, transparent)"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <polygon fill={fill} points={area} />
      <polyline fill="none" stroke={stroke} strokeWidth="1.7" points={line} />
    </svg>
  )
}

export function SnapshotRow({
  snapshots,
  currency,
}: {
  snapshots: DashboardSnapshots
  currency: string
}) {
  const { copy } = useLabels()
  const vs = snapshots.vsLastMonth
  const vsLabel =
    vs == null
      ? "—"
      : `${vs > 0 ? "+" : ""}${vs}% ${vs >= 0 ? copy.dashboard.better : copy.dashboard.worse}`

  return (
    <div className="titan-glass grid overflow-hidden rounded-[10px] sm:grid-cols-3">
      <article className="flex items-end justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground">
            {copy.dashboard.last7Days}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[20px] font-medium tabular-nums",
              signedClassName(snapshots.last7Days.r)
            )}
          >
            {formatSignedR(snapshots.last7Days.r)}
          </p>
        </div>
        <Sparkline values={snapshots.last7Days.spark} />
      </article>

      <article className="border-t border-border px-4 py-3 sm:border-t-0 sm:border-l">
        <p className="text-[11px] font-medium text-muted-foreground">
          {copy.dashboard.thisMonth}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[20px] font-medium tabular-nums",
            signedClassName(snapshots.thisMonth.r)
          )}
        >
          {formatSignedR(snapshots.thisMonth.r)}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          <span className={signedClassName(snapshots.thisMonth.pnl)}>
            {formatSignedMoney(snapshots.thisMonth.pnl, currency)}
          </span>
          <span className="mx-1.5">·</span>
          {copy.dashboard.winRateShort}{" "}
          {snapshots.thisMonth.winRate == null
            ? "—"
            : `${Math.round(snapshots.thisMonth.winRate * 100)}%`}
        </p>
      </article>

      <article className="border-t border-border px-4 py-3 sm:border-t-0 sm:border-l">
        <p className="text-[11px] font-medium text-muted-foreground">
          {copy.dashboard.vsLastMonth}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[20px] font-medium tabular-nums",
            signedClassName(vs)
          )}
        >
          {vsLabel}
        </p>
      </article>
    </div>
  )
}
