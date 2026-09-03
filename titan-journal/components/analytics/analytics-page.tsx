"use client"

import dynamic from "next/dynamic"
import { useMemo, type ReactNode } from "react"
import {
  ArrowDown,
  ArrowUp,
  CircleCheck,
  CircleX,
  Hash,
  Percent,
  Scale,
  Sigma,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import { EdgeBadge } from "@/components/analytics/edge-badge"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  accountEdge,
  cappedGroups,
  changePct,
  type GroupStats,
} from "@/lib/analytics"
import { previousRangeBounds } from "@/lib/date-range"
import {
  formatNumber,
  formatPercent,
  formatSignedPercentPoints,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { buildEquityCurve } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

const EquityCurve = dynamic(
  () =>
    import("@/components/dashboard/equity-curve").then((mod) => mod.EquityCurve),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full rounded-[10px]" />,
  }
)

const PerformanceBars = dynamic(
  () =>
    import("@/components/dashboard/performance-bars").then(
      (mod) => mod.PerformanceBars
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[260px] w-full rounded-[10px]" />,
  }
)

function playbookKey(trade: Trade) {
  return trade.playbookId || trade.strategy
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  valueClassName,
  highlight = false,
  badge,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  valueClassName?: string
  highlight?: boolean
  badge?: ReactNode
}) {
  return (
    <article
      className={cn(
        "titan-kpi rounded-[10px] px-4 py-3",
        highlight &&
          "border-primary/55 shadow-[0_0_28px_color-mix(in_srgb,var(--primary)_22%,transparent)]"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
          {label}
        </p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-[22px] font-semibold tracking-tight tabular-nums",
          valueClassName
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
      {badge ? <p className="mt-1.5 text-[11px]">{badge}</p> : null}
    </article>
  )
}

function StatCard({
  label,
  value,
  hint,
  valueClassName,
  hintClassName,
  icon,
}: {
  label: string
  value: string
  hint?: string
  valueClassName?: string
  hintClassName?: string
  icon?: ReactNode
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-1.5 font-mono text-[18px] font-medium tabular-nums",
          valueClassName
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className={cn("mt-1 text-[11px] text-muted-foreground", hintClassName)}>
          {hint}
        </p>
      ) : null}
    </article>
  )
}

function BarTrack({
  value,
  max,
  tone,
}: {
  value: number
  max: number
  tone: "primary" | "signed"
}) {
  const width = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0
  const color =
    tone === "primary"
      ? "bg-primary"
      : value > 0
        ? "bg-bull"
        : value < 0
          ? "bg-bear"
          : "bg-muted-foreground/50"
  return (
    <div className="h-1.5 w-full rounded-full bg-muted/80">
      <div
        className={cn("h-full rounded-full", color)}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function SetupTable({
  rows,
  names,
}: {
  rows: GroupStats[]
  names: Record<string, string>
}) {
  const { copy } = useLabels()
  const pfMax = Math.max(2, ...rows.map((row) => row.profitFactor ?? 0))
  return (
    <section className="titan-glass rounded-[10px] p-4">
      <h2 className="text-sm font-semibold">{copy.analytics.bySetup}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{copy.analytics.empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-[12px]">
            <thead className="text-[11px] text-muted-foreground">
              <tr>
                <th className="pb-2 font-medium">{copy.analytics.setup}</th>
                <th className="pb-2 font-medium">{copy.analytics.trades}</th>
                <th className="pb-2 font-medium">{copy.dashboard.winRate}</th>
                <th className="pb-2 font-medium">{copy.analytics.expectancy}</th>
                <th className="pb-2 font-medium">{copy.analytics.profitFactor}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-border">
                  <td className="py-2 pr-3 font-medium">
                    {names[row.key] ?? row.key}
                  </td>
                  <td className="py-2 pr-3 font-mono tabular-nums">{row.trades}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">
                    {formatPercent(row.winRate)}
                  </td>
                  <td
                    className={cn(
                      "py-2 pr-3 font-mono tabular-nums",
                      signedClassName(row.averageR)
                    )}
                  >
                    {formatSignedR(row.averageR)}
                  </td>
                  <td className="py-2">
                    <div className="flex min-w-[88px] items-center gap-2">
                      <span className="w-8 font-mono tabular-nums">
                        {formatNumber(row.profitFactor)}
                      </span>
                      <BarTrack
                        value={row.profitFactor ?? 0}
                        max={pfMax}
                        tone="primary"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function MarketTable({ rows }: { rows: GroupStats[] }) {
  const { copy } = useLabels()
  const expMax = Math.max(
    0.01,
    ...rows.map((row) => Math.abs(row.averageR ?? 0))
  )
  return (
    <section className="titan-glass rounded-[10px] p-4">
      <h2 className="text-sm font-semibold">{copy.analytics.byMarket}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{copy.analytics.empty}</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_auto_minmax(0,1.2fr)] items-center gap-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">{row.key}</p>
                <p className="text-[11px] text-muted-foreground">
                  {row.trades} {copy.analytics.trades}
                </p>
              </div>
              <p
                className={cn(
                  "font-mono text-[12px] tabular-nums",
                  signedClassName(row.averageR)
                )}
              >
                {formatSignedR(row.averageR)}
              </p>
              <BarTrack
                value={row.averageR ?? 0}
                max={expMax}
                tone="signed"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function AnalyticsPage() {
  const { copy } = useLabels()
  const { playbooks } = useWorkspace()
  const { custom } = useWorkspaceChrome()
  const { trades, accountTrades, range, capital, profile } =
    useScopedTrades()
  const edge = useMemo(() => accountEdge(trades), [trades])
  const previous = useMemo(
    () => previousRangeBounds(range, new Date(), custom),
    [range, custom]
  )
  const previousEdge = useMemo(() => {
    if (!previous) return null
    const list = accountTrades.filter(
      (trade) => trade.date >= previous.start && trade.date <= previous.end
    )
    return accountEdge(list)
  }, [accountTrades, previous])
  const tradeDelta = previousEdge
    ? changePct(edge.trades, previousEdge.trades)
    : null
  const playbookNames = useMemo(
    () => Object.fromEntries(playbooks.map((item) => [item.id, item.name])),
    [playbooks]
  )
  const setupRows = useMemo(
    () =>
      [...cappedGroups(trades, playbookKey, 6, copy.analytics.others)].sort(
        (a, b) => (b.averageR ?? -999) - (a.averageR ?? -999)
      ),
    [copy.analytics.others, trades]
  )
  const marketRows = useMemo(
    () =>
      [...cappedGroups(trades, (trade) => trade.symbol, 7, copy.analytics.others)].sort(
        (a, b) => (b.averageR ?? -999) - (a.averageR ?? -999)
      ),
    [copy.analytics.others, trades]
  )
  const equity = useMemo(
    () => buildEquityCurve(trades, capital),
    [trades, capital]
  )

  return (
    <PageFrame>
      <PageHeader
        title={copy.analytics.title}
        description={copy.analytics.description}
      />
      <div className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <KpiCard
            label={copy.analytics.edge}
            value={formatSignedR(edge.averageR)}
            hint={copy.analytics.expectedPerTrade}
            valueClassName={signedClassName(edge.averageR)}
            highlight
            icon={<TrendingUp className="size-3.5 text-primary" />}
            badge={edge.trades > 0 ? <EdgeBadge edge={edge.edge} /> : null}
          />
          <KpiCard
            label={copy.dashboard.winRate}
            value={formatPercent(edge.winRate)}
            hint={
              edge.trades > 0
                ? `${edge.wins} / ${edge.trades} ${copy.analytics.trades}`
                : undefined
            }
            icon={<Percent className="size-3.5 text-muted-foreground" />}
          />
          <KpiCard
            label={copy.dashboard.profitFactor}
            value={formatNumber(edge.profitFactor)}
            hint={copy.analytics.profitFactorHint}
            icon={<Scale className="size-3.5 text-muted-foreground" />}
          />
          <KpiCard
            label={copy.analytics.avgWin}
            value={formatSignedR(edge.avgWinR)}
            valueClassName="text-bull"
            icon={<ArrowUp className="size-3.5 text-bull" />}
          />
          <KpiCard
            label={copy.analytics.avgLoss}
            value={formatSignedR(edge.avgLossR)}
            valueClassName="text-bear"
            icon={<ArrowDown className="size-3.5 text-bear" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <PerformanceBars
            trades={trades}
            currency={profile.currency}
          />
          <EquityCurve data={equity} defaultMetric="r" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label={copy.analytics.tradeCount}
            value={String(edge.trades)}
            hint={
              tradeDelta == null
                ? undefined
                : `${formatSignedPercentPoints(tradeDelta)} ${copy.analytics.vsPrevious}`
            }
            hintClassName={tradeDelta == null ? undefined : signedClassName(tradeDelta)}
            icon={<Hash className="size-3.5 text-muted-foreground" />}
          />
          <StatCard
            label={copy.analytics.winningTrades}
            value={`${edge.wins}`}
            hint={formatPercent(edge.winRate)}
            icon={<CircleCheck className="size-3.5 text-bull" />}
          />
          <StatCard
            label={copy.analytics.losingTrades}
            value={`${edge.losses}`}
            hint={
              edge.wins + edge.losses > 0
                ? formatPercent(edge.losses / (edge.wins + edge.losses))
                : "—"
            }
            icon={<CircleX className="size-3.5 text-bear" />}
          />
          <StatCard
            label={copy.dashboard.maxDrawdown}
            value={formatSignedR(edge.maxDrawdownR)}
            valueClassName={signedClassName(edge.maxDrawdownR)}
            icon={<TrendingDown className="size-3.5 text-bear" />}
          />
          <StatCard
            label={`${copy.analytics.expectancy} (R)`}
            value={formatSignedR(edge.averageR)}
            valueClassName={signedClassName(edge.averageR)}
            icon={<Sigma className="size-3.5 text-muted-foreground" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <SetupTable rows={setupRows} names={playbookNames} />
          <MarketTable rows={marketRows} />
        </div>
      </div>
    </PageFrame>
  )
}
