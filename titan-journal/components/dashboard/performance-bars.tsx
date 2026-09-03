"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { SegmentedControl } from "@/components/layout/segmented-control"
import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatSignedMoney,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { LOCALE } from "@/lib/locale"
import { formatMonthTitle, parseIsoDate } from "@/lib/pnl-calendar"
import {
  getPerformanceByPeriod,
  performanceRangeLabel,
  performanceTickLabel,
  type PerformanceAggregation,
  type PerformanceBucket,
} from "@/lib/performance-by-period"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Language } from "@/types/playbook"
import type { Trade } from "@/types/trade"

const METRICS = ["r", "pnl"] as const
type Metric = (typeof METRICS)[number]

type ChartRow = PerformanceBucket & { chartValue: number }

function rangeHeading(
  bucket: PerformanceBucket,
  aggregation: PerformanceAggregation,
  language: Language
): string {
  if (aggregation === "month") {
    const parsed = parseIsoDate(bucket.startDate)
    if (parsed) return formatMonthTitle({ year: parsed.year, month: parsed.month }, language)
  }
  return performanceRangeLabel(bucket)
}

function BarTooltip({
  active,
  payload,
  currency,
  aggregation,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartRow }>
  currency: string
  aggregation: PerformanceAggregation
}) {
  const { copy, language } = useLabels()
  if (!active || !payload?.[0]) return null
  const bucket = payload[0].payload
  const rows: Array<{ label: string; value: string; tone?: string }> = []
  if (bucket.trades > 0) {
    rows.push({
      label: copy.dashboard.result,
      value: formatSignedR(bucket.netR),
      tone: signedClassName(bucket.netR),
    })
    rows.push({
      label: copy.dashboard.pnl,
      value: formatSignedMoney(bucket.pnl, currency),
      tone: signedClassName(bucket.pnl),
    })
    rows.push({
      label: copy.dashboard.totalTrades,
      value: String(bucket.trades),
    })
    if (bucket.winRate != null) {
      rows.push({
        label: copy.dashboard.winRate,
        value: `${Math.round(bucket.winRate)} %`,
      })
    }
    if (bucket.wins > 0) {
      rows.push({ label: copy.dashboard.wins, value: String(bucket.wins) })
    }
    if (bucket.losses > 0) {
      rows.push({ label: copy.dashboard.losses, value: String(bucket.losses) })
    }
  }

  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-foreground">
        {rangeHeading(bucket, aggregation, language)}
      </p>
      {rows.map((row) => (
        <p key={row.label} className="mt-1 flex justify-between gap-6">
          <span className="text-muted-foreground">{row.label}</span>
          <span className={cn("font-mono tabular-nums", row.tone)}>{row.value}</span>
        </p>
      ))}
    </div>
  )
}

export function PerformanceBars({
  trades,
  currency,
}: {
  trades: Trade[]
  currency: string
}) {
  const { copy, language } = useLabels()
  const { range, custom } = useWorkspaceChrome()
  const [metric, setMetric] = useState<Metric>("r")
  const result = useMemo(
    () => getPerformanceByPeriod(trades, range, new Date(), custom),
    [trades, range, custom]
  )
  const compact = result.buckets.length > 8
  const rows = useMemo<ChartRow[]>(() => {
    const values = result.buckets.map((bucket) =>
      metric === "r" ? bucket.netR : bucket.pnl
    )
    const maxAbs = Math.max(1, ...values.map((value) => Math.abs(value)))
    const marker = maxAbs * 0.04
    return result.buckets.map((bucket, index) => {
      const value = values[index]!
      return {
        ...bucket,
        chartValue: value === 0 ? marker : value,
      }
    })
  }, [metric, result.buckets])
  const metricLabels: Record<Metric, string> = {
    r: copy.dashboard.r,
    pnl: copy.dashboard.pnl,
  }
  const tickEvery = Math.max(1, Math.ceil(result.buckets.length / 8))
  const { totals } = result
  const summaryParts = [
    metric === "r" ? formatSignedR(totals.netR) : formatSignedMoney(totals.pnl, currency),
    totals.trades > 0 ? `${totals.trades} ${copy.dashboard.totalTrades.toLowerCase()}` : null,
    totals.winRate != null ? `${Math.round(totals.winRate)} % ${copy.dashboard.winRateShort}` : null,
  ].filter(Boolean)

  return (
    <Card size="sm" className="h-full gap-0 py-0">
      <CardHeader className="shrink-0 px-4 pt-3 pb-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle>{copy.dashboard.performance}</CardTitle>
              {totals.trades > 0 ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {summaryParts.join(" · ")}
                </p>
              ) : null}
            </div>
            <SegmentedControl
              size="sm"
              options={METRICS}
              value={metric}
              onChange={setMetric}
              labels={metricLabels}
              aria-label={copy.dashboard.performance}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-2">
        {result.buckets.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            {copy.dashboard.performanceEmpty}
          </p>
        ) : (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid
                  stroke="color-mix(in srgb, var(--border) 70%, transparent)"
                  vertical={false}
                />
                <XAxis
                  dataKey="key"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={tickEvery - 1}
                  tickFormatter={(_, index) =>
                    performanceTickLabel(
                      result.buckets[index]!,
                      result.aggregation,
                      language,
                      compact
                    )
                  }
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(value: number) => {
                    const rounded = Math.round(value * 10) / 10
                    if (metric === "r") return `${rounded}R`
                    return Math.round(value).toLocaleString(LOCALE)
                  }}
                />
                <ReferenceLine
                  y={0}
                  stroke="color-mix(in srgb, var(--muted-foreground) 45%, transparent)"
                />
                <Tooltip
                  cursor={{ fill: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}
                  content={<BarTooltip currency={currency} aggregation={result.aggregation} />}
                />
                <Bar
                  dataKey="chartValue"
                  maxBarSize={26}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive
                  animationDuration={200}
                >
                  {rows.map((row) => {
                    const value = metric === "r" ? row.netR : row.pnl
                    const fill =
                      value > 0
                        ? "var(--bull)"
                        : value < 0
                          ? "var(--bear)"
                          : "color-mix(in srgb, var(--muted-foreground) 55%, transparent)"
                    return (
                      <Cell
                        key={row.key}
                        fill={fill}
                        fillOpacity={row.incomplete ? 0.55 : 1}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
