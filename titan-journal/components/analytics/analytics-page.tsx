"use client"

import dynamic from "next/dynamic"
import { useMemo, type ReactNode } from "react"
import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { EdgeBadge } from "@/components/analytics/edge-badge"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const MIX_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

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
  dot,
}: {
  label: string
  value: string
  hint?: string
  valueClassName?: string
  hintClassName?: string
  dot?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-4 py-3">
      <div className="flex items-center gap-2">
        {dot ? (
          <span className="size-2 rounded-full" style={{ background: dot }} />
        ) : null}
        <p className="text-[11px] text-muted-foreground">{label}</p>
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

type MixSlice = {
  key: string
  label: string
  trades: number
  share: number
  color: string
}

function MixTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: MixSlice }>
}) {
  if (!active || !payload?.[0]) return null
  const slice = payload[0].payload
  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium">{slice.label}</p>
      <p className="mt-0.5 font-mono tabular-nums">
        {slice.trades}
        <span className="ml-2 text-muted-foreground">
          {Math.round(slice.share * 100)}%
        </span>
      </p>
    </div>
  )
}

function SetupMix({
  rows,
  names,
  colors,
}: {
  rows: GroupStats[]
  names: Record<string, string>
  colors: Record<string, string>
}) {
  const { copy } = useLabels()
  const total = rows.reduce((sum, row) => sum + row.trades, 0)
  const slices = rows.map((row, index) => ({
    key: row.key,
    label: names[row.key] ?? row.key,
    trades: row.trades,
    share: total > 0 ? row.trades / total : 0,
    color: colors[row.key] || MIX_COLORS[index % MIX_COLORS.length],
  }))

  return (
    <Card size="sm" className="h-full gap-0 py-0">
      <CardHeader className="border-b border-border py-2">
        <CardTitle>{copy.analytics.tradeMix}</CardTitle>
      </CardHeader>
      <CardContent className="pt-3 pb-3">
        {slices.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            {copy.analytics.empty}
          </p>
        ) : (
          <div className="flex flex-col items-stretch gap-3">
            <div className="relative mx-auto aspect-square size-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="trades"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="68%"
                    outerRadius="92%"
                    paddingAngle={slices.length > 1 ? 2 : 0}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {slices.map((slice) => (
                      <Cell key={slice.key} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<MixTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] text-muted-foreground">
                  {copy.dashboard.totalTradesLabel}
                </p>
                <p className="font-mono text-[16px] font-medium tabular-nums">
                  {total}
                </p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {slices.map((slice) => (
                <li
                  key={slice.key}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-[11px]"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: slice.color }}
                  />
                  <span className="truncate">{slice.label}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {Math.round(slice.share * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
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
  const playbookColors = useMemo(
    () =>
      Object.fromEntries(
        playbooks
          .filter((item) => item.color)
          .map((item) => [item.id, item.color as string])
      ),
    [playbooks]
  )
  const setupMix = useMemo(
    () => cappedGroups(trades, playbookKey, 6, copy.analytics.others),
    [copy.analytics.others, trades]
  )
  const setupRows = useMemo(
    () =>
      [...setupMix].sort(
        (a, b) => (b.averageR ?? -999) - (a.averageR ?? -999)
      ),
    [setupMix]
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
            icon={<TrendingUp className="size-4 text-primary" />}
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
          />
          <KpiCard
            label={copy.dashboard.profitFactor}
            value={formatNumber(edge.profitFactor)}
            hint={copy.analytics.profitFactorHint}
          />
          <KpiCard
            label={copy.analytics.avgWin}
            value={formatSignedR(edge.avgWinR)}
            valueClassName="text-bull"
            icon={<ArrowUp className="size-4 text-bull" />}
          />
          <KpiCard
            label={copy.analytics.avgLoss}
            value={formatSignedR(edge.avgLossR)}
            valueClassName="text-bear"
            icon={<ArrowDown className="size-4 text-bear" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <PerformanceBars
            trades={trades}
            currency={profile.currency}
            showRange={false}
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
          />
          <StatCard
            label={copy.analytics.winningTrades}
            value={`${edge.wins}`}
            hint={formatPercent(edge.winRate)}
            dot="var(--bull)"
          />
          <StatCard
            label={copy.analytics.losingTrades}
            value={`${edge.losses}`}
            hint={
              edge.wins + edge.losses > 0
                ? formatPercent(edge.losses / (edge.wins + edge.losses))
                : "—"
            }
            dot="var(--bear)"
          />
          <StatCard
            label={copy.dashboard.maxDrawdown}
            value={formatSignedR(edge.maxDrawdownR)}
            valueClassName={signedClassName(edge.maxDrawdownR)}
          />
          <StatCard
            label={`${copy.analytics.expectancy} (R)`}
            value={formatSignedR(edge.averageR)}
            valueClassName={signedClassName(edge.averageR)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)_minmax(220px,0.75fr)]">
          <SetupTable rows={setupRows} names={playbookNames} />
          <MarketTable rows={marketRows} />
          <SetupMix
            rows={setupMix}
            names={playbookNames}
            colors={playbookColors}
          />
        </div>
      </div>
    </PageFrame>
  )
}
