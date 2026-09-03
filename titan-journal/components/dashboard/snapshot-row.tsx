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
  const w = 88
  const h = 28
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * w
      const y = h - ((value - min) / span) * h
      return `${x},${y}`
    })
    .join(" ")
  const up = (values[values.length - 1] ?? 0) >= 0

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden>
      <polyline
        fill="none"
        stroke={up ? "var(--bull)" : "var(--bear)"}
        strokeWidth="1.6"
        points={points}
      />
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
  const winPct = Math.round(snapshots.winShare * 100)
  const lossPct = Math.round(snapshots.lossShare * 100)
  const vs = snapshots.vsLastMonth
  const vsLabel =
    vs == null
      ? "—"
      : `${vs > 0 ? "+" : ""}${vs}% ${vs >= 0 ? copy.dashboard.better : copy.dashboard.worse}`

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <article className="titan-kpi rounded-[10px] px-3 py-2.5">
        <p className="text-[11px] font-medium text-muted-foreground">
          {copy.dashboard.profitVsLoss}
        </p>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
          <span
            className="h-full bg-bull"
            style={{ width: `${winPct}%` }}
          />
          <span
            className="h-full bg-bear"
            style={{ width: `${lossPct}%` }}
          />
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          <span className="text-bull">{winPct}%</span> {copy.dashboard.wins}
          <span className="mx-1.5 text-border">·</span>
          <span className="text-bear">{lossPct}%</span> {copy.dashboard.losses}
        </p>
      </article>

      <article className="titan-kpi flex items-end justify-between gap-3 rounded-[10px] px-3 py-2.5">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">
            {copy.dashboard.last7Days}
          </p>
          <p
            className={cn(
              "mt-1 font-mono text-[18px] font-medium tabular-nums",
              signedClassName(snapshots.last7Days.r)
            )}
          >
            {formatSignedR(snapshots.last7Days.r)}
          </p>
        </div>
        <Sparkline values={snapshots.last7Days.spark} />
      </article>

      <article className="titan-kpi rounded-[10px] px-3 py-2.5">
        <p className="text-[11px] font-medium text-muted-foreground">
          {copy.dashboard.thisMonth}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[18px] font-medium tabular-nums",
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

      <article className="titan-kpi rounded-[10px] px-3 py-2.5">
        <p className="text-[11px] font-medium text-muted-foreground">
          {copy.dashboard.vsLastMonth}
        </p>
        <p
          className={cn(
            "mt-1 font-mono text-[18px] font-medium tabular-nums",
            signedClassName(vs)
          )}
        >
          {vsLabel}
        </p>
      </article>
    </div>
  )
}
