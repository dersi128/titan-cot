"use client"

import { formatSignedMoney, formatSignedR, signedClassName } from "@/lib/format"
import { prefersMoneyMetrics } from "@/lib/locale"
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
  const { copy, language } = useLabels()
  const moneyFirst = prefersMoneyMetrics(language)
  const last7Value = moneyFirst ? snapshots.last7Days.pnl : snapshots.last7Days.r
  const monthPrimary = moneyFirst ? snapshots.thisMonth.pnl : snapshots.thisMonth.r
  const monthSecondary = moneyFirst ? snapshots.thisMonth.r : snapshots.thisMonth.pnl
  const winPct = Math.round(snapshots.winShare * 100)
  const lossPct = Math.round(snapshots.lossShare * 100)
  const vs = snapshots.vsLastMonth
  const vsLabel =
    vs == null
      ? "—"
      : `${vs > 0 ? "+" : ""}${vs}% ${vs >= 0 ? copy.dashboard.better : copy.dashboard.worse}`

  const card =
    "titan-kpi flex h-full min-h-[6.75rem] flex-col rounded-[12px] px-4 py-3"
  const title = "text-[11px] font-medium tracking-wide text-muted-foreground"
  const value =
    "font-mono text-[18px] font-medium leading-7 tabular-nums"

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className={card}>
        <p className={title}>{copy.dashboard.profitVsLoss}</p>
        <div className="mt-1 flex min-h-7 items-center">
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/80">
            <span className="h-full bg-bull" style={{ width: `${winPct}%` }} />
            <span className="h-full bg-bear" style={{ width: `${lossPct}%` }} />
          </div>
        </div>
        <p className="mt-2 text-[12px] text-muted-foreground">
          <span className="text-bull">{winPct}%</span> {copy.dashboard.wins}
          <span className="mx-1.5 text-border">·</span>
          <span className="text-bear">{lossPct}%</span> {copy.dashboard.losses}
        </p>
      </article>

      <article className={card}>
        <p className={title}>{copy.dashboard.last7Days}</p>
        <div className="mt-1 flex min-h-7 items-center justify-between gap-3">
          <p className={cn(value, signedClassName(last7Value))}>
            {moneyFirst
              ? formatSignedMoney(last7Value, currency)
              : formatSignedR(last7Value)}
          </p>
          <Sparkline values={snapshots.last7Days.spark} />
        </div>
      </article>

      <article className={card}>
        <p className={title}>{copy.dashboard.thisMonth}</p>
        <p className={cn("mt-1 min-h-7", value, signedClassName(monthPrimary))}>
          {moneyFirst
            ? formatSignedMoney(monthPrimary, currency)
            : formatSignedR(monthPrimary)}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          <span className={signedClassName(monthSecondary)}>
            {moneyFirst
              ? formatSignedR(monthSecondary)
              : formatSignedMoney(monthSecondary, currency)}
          </span>
          <span className="mx-1.5">·</span>
          {copy.dashboard.winRateShort}{" "}
          {snapshots.thisMonth.winRate == null
            ? "—"
            : `${Math.round(snapshots.thisMonth.winRate * 100)}%`}
        </p>
      </article>

      <article className={card}>
        <p className={title}>{copy.dashboard.vsLastMonth}</p>
        <p className={cn("mt-1 min-h-7", value, signedClassName(vs))}>
          {vsLabel}
        </p>
      </article>
    </div>
  )
}
