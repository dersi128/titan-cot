"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { EdgeBadge } from "@/components/analytics/edge-badge"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  accountEdge,
  statsByDirection,
  statsByPlaybook,
  statsBySymbol,
  type GroupStats,
} from "@/lib/analytics"
import {
  formatChartDate,
  formatDate,
  formatNumber,
  formatPercent,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { LOCALE } from "@/lib/locale"
import { buildEquityCurve } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Playbook, PlaybookStatus } from "@/types/playbook"
import type { Trade } from "@/types/trade"

function playbookTrades(trades: Trade[], playbook: Playbook) {
  return trades.filter(
    (trade) => trade.playbookId === playbook.id || trade.strategy === playbook.name
  )
}

function latestDate(trades: Trade[], fallback: string) {
  let latest = ""
  for (const trade of trades) {
    if (trade.date > latest) latest = trade.date
  }
  return latest || fallback
}

function StatusPill({
  status,
  activeLabel,
  archivedLabel,
}: {
  status: PlaybookStatus
  activeLabel: string
  archivedLabel: string
}) {
  const archived = status === "archived"
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        archived ? "bg-muted text-muted-foreground" : "bg-bull/15 text-bull"
      )}
    >
      {archived ? archivedLabel : activeLabel}
    </span>
  )
}

function Metric({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-[15px] font-medium tabular-nums", className)}>
        {value}
      </p>
    </article>
  )
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 font-mono text-[12px] tabular-nums", className)}>{value}</p>
    </div>
  )
}

function directionColor(key: string) {
  if (key === "SHORT") return "var(--bear)"
  if (key === "LONG") return "var(--bull)"
  return "var(--chart-3)"
}

function CumulativeRChart({
  trades,
  title,
}: {
  trades: Trade[]
  title: string
}) {
  const data = useMemo(() => buildEquityCurve(trades), [trades])
  if (data.length < 2) return null

  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="playbookRFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
              tickFormatter={formatChartDate}
            />
            <YAxis
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value: number) => `${Math.round(value)}R`}
            />
            <Tooltip
              cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const point = payload[0].payload as { date: string; r: number }
                return (
                  <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
                    <p className="text-muted-foreground">
                      {point.date ? formatDate(point.date) : "—"}
                    </p>
                    <p className="mt-1 font-mono tabular-nums text-foreground">
                      {formatSignedR(point.r)}
                    </p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="r"
              stroke="var(--chart-1)"
              fill="url(#playbookRFill)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function DirectionDonut({
  rows,
  labels,
  title,
}: {
  rows: GroupStats[]
  labels: Record<string, string>
  title: string
}) {
  const slices = rows.map((row) => ({
    key: row.key,
    label: labels[row.key] ?? row.key,
    trades: row.trades,
    color: directionColor(row.key),
  }))
  const total = slices.reduce((sum, slice) => sum + slice.trades, 0)
  if (total === 0) return null

  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative size-[112px] shrink-0">
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
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null
                  const slice = payload[0].payload as (typeof slices)[number]
                  return (
                    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
                      <p className="font-medium">{slice.label}</p>
                      <p className="mt-0.5 font-mono tabular-nums text-muted-foreground">
                        {slice.trades.toLocaleString(LOCALE)} ·{" "}
                        {Math.round((slice.trades / total) * 100)}%
                      </p>
                    </div>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="min-w-0 flex-1 space-y-1.5 text-[12px]">
          {slices.map((slice) => (
            <li key={slice.key} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: slice.color }}
                  aria-hidden
                />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {slice.trades} · {Math.round((slice.trades / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function PlaybookListPage() {
  const { copy, DIRECTION_LABELS } = useLabels()
  const { playbooks, savePlaybook } = useWorkspace()
  const { accountTrades } = useScopedTrades()
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const edgeByPlaybook = Object.fromEntries(
    statsByPlaybook(accountTrades).map((row) => [row.key, row])
  )
  const tradesByPlaybookId = useMemo(() => {
    const map = new Map<string, Trade[]>()
    for (const playbook of playbooks) {
      map.set(playbook.id, playbookTrades(accountTrades, playbook))
    }
    return map
  }, [accountTrades, playbooks])
  const visible = playbooks.filter((playbook) =>
    playbook.name.toLowerCase().includes(query.trim().toLowerCase())
  )
  const selected =
    visible.find((playbook) => playbook.id === selectedId) ?? visible[0] ?? null
  const selectedTrades = selected
    ? (tradesByPlaybookId.get(selected.id) ?? [])
    : []
  const selectedStats = useMemo(
    () => accountEdge(selectedTrades),
    [selectedTrades]
  )
  const directions = useMemo(
    () => statsByDirection(selectedTrades),
    [selectedTrades]
  )
  const markets = useMemo(
    () => statsBySymbol(selectedTrades).slice(0, 6),
    [selectedTrades]
  )
  const marketMax = Math.max(1, ...markets.map((row) => row.trades))

  return (
    <PageFrame>
      <PageHeader
        title={copy.playbook.title}
        description={copy.playbook.description}
        actions={
          <Button asChild>
            <Link href="/playbook/new">{copy.playbook.new}</Link>
          </Button>
        }
      />
      <div className="titan-glass mb-4 rounded-[10px] p-4">
        <p className="text-sm font-medium">{copy.playbook.howToTitle}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{copy.playbook.howTo}</p>
      </div>

      {playbooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.playbook.empty}</p>
      ) : (
        <>
          <div className="mb-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.playbook.search}
              className="h-8 max-w-sm text-[12px]"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.5fr)] lg:items-start">
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                {copy.playbook.all} · {visible.length}
              </p>
              {visible.map((playbook) => {
                const edge =
                  edgeByPlaybook[playbook.id] ?? edgeByPlaybook[playbook.name]
                const active = selected?.id === playbook.id
                const trades = tradesByPlaybookId.get(playbook.id) ?? []
                const updated = latestDate(trades, playbook.createdAt)
                return (
                  <button
                    key={playbook.id}
                    type="button"
                    onClick={() => setSelectedId(playbook.id)}
                    className={cn(
                      "w-full rounded-[10px] border p-3 text-left transition-colors",
                      active
                        ? "border-primary/50 bg-primary/10"
                        : "titan-glass border-transparent"
                    )}
                    style={
                      playbook.color
                        ? { borderLeft: `3px solid ${playbook.color}` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{
                            background: playbook.color ?? "var(--primary)",
                          }}
                          aria-hidden
                        />
                        <p className="truncate text-sm font-semibold">{playbook.name}</p>
                      </div>
                      <StatusPill
                        status={playbook.status}
                        activeLabel={copy.playbook.active}
                        archivedLabel={copy.playbook.archived}
                      />
                    </div>
                    {edge ? (
                      <>
                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          <MiniStat
                            label={copy.dashboard.winRate}
                            value={formatPercent(edge.winRate)}
                          />
                          <MiniStat
                            label={copy.dashboard.averageR}
                            value={formatSignedR(edge.averageR)}
                            className={signedClassName(edge.averageR)}
                          />
                          <MiniStat
                            label={copy.dashboard.profitFactor}
                            value={formatNumber(edge.profitFactor)}
                          />
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {edge.trades} {copy.analytics.trades}
                          {" · "}
                          {copy.playbook.updated} {formatDate(updated)}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {playbook.fields.length} {copy.playbook.fieldCount}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {selected ? (
              <section className="titan-glass space-y-4 rounded-[10px] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          background: selected.color ?? "var(--primary)",
                        }}
                        aria-hidden
                      />
                      <h2 className="text-base font-semibold">{selected.name}</h2>
                      <StatusPill
                        status={selected.status}
                        activeLabel={copy.playbook.active}
                        archivedLabel={copy.playbook.archived}
                      />
                    </div>
                    {selected.description ? (
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        {selected.description}
                      </p>
                    ) : null}
                    {selectedStats.trades > 0 ? (
                      <p className="mt-1 text-[12px]">
                        <EdgeBadge edge={selectedStats.edge} />
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/playbook/${selected.id}`}>{copy.playbook.edit}</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() =>
                        savePlaybook({
                          ...selected,
                          status:
                            selected.status === "archived" ? "active" : "archived",
                        })
                      }
                    >
                      {selected.status === "archived"
                        ? copy.playbook.restore
                        : copy.playbook.archive}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                  <Metric
                    label={copy.analytics.tradeCount}
                    value={String(selectedStats.trades)}
                  />
                  <Metric
                    label={copy.dashboard.winRate}
                    value={formatPercent(selectedStats.winRate)}
                  />
                  <Metric
                    label={copy.analytics.expectancy}
                    value={formatSignedR(selectedStats.averageR)}
                    className={signedClassName(selectedStats.averageR)}
                  />
                  <Metric
                    label={copy.dashboard.profitFactor}
                    value={formatNumber(selectedStats.profitFactor)}
                  />
                  <Metric
                    label={copy.dashboard.totalR}
                    value={formatSignedR(selectedStats.totalR)}
                    className={signedClassName(selectedStats.totalR)}
                  />
                </div>

                {selected.fields.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium">{copy.playbook.fields}</p>
                    <ul className="mt-2 grid gap-1 text-[13px] sm:grid-cols-2">
                      {selected.fields.map((field) => (
                        <li key={field.id} className="text-muted-foreground">
                          <span className="text-foreground">{field.name}</span>
                          {field.options.length > 0
                            ? ` · ${field.options.join(", ")}`
                            : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedStats.trades > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(200px,0.8fr)]">
                    <CumulativeRChart
                      trades={selectedTrades}
                      title={copy.playbook.cumulativeR}
                    />
                    <DirectionDonut
                      rows={directions}
                      labels={DIRECTION_LABELS}
                      title={copy.analytics.byDirection}
                    />
                  </div>
                ) : null}

                {markets.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium">{copy.playbook.topMarkets}</p>
                    <ul className="mt-2 space-y-2">
                      {markets.map((row) => (
                        <li
                          key={row.key}
                          className="grid grid-cols-[5rem_1fr_auto] items-center gap-2 text-[12px]"
                        >
                          <span className="truncate font-medium">{row.key}</span>
                          <div className="h-1.5 rounded-full bg-muted/80">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.round((row.trades / marketMax) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-muted-foreground">
                            {row.trades}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        </>
      )}
    </PageFrame>
  )
}
