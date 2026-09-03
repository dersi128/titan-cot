"use client"

import { useId, useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { SegmentedControl } from "@/components/layout/segmented-control"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatChartDate,
  formatDate,
  formatSignedPercentPoints,
  formatSignedR,
  formatSignedUsd,
} from "@/lib/format"
import { LOCALE } from "@/lib/locale"
import { useLabels } from "@/lib/use-labels"
import type { EquityPoint } from "@/lib/trade-calculations"

const EQUITY_METRICS = ["pnl", "r", "pct"] as const
type EquityMetric = (typeof EQUITY_METRICS)[number]

type ChartPoint = EquityPoint & { pnl: number; pct: number }

function EquityTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
  metric: EquityMetric
}) {
  const { copy } = useLabels()
  if (!active || !payload?.[0]) return null
  const point = payload[0].payload
  const value =
    metric === "r"
      ? formatSignedR(point.r)
      : metric === "pct"
        ? formatSignedPercentPoints(point.pct)
        : formatSignedUsd(point.pnl)

  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="text-muted-foreground">
        {point.date ? formatDate(point.date) : point.label}
      </p>
      <p className="mt-1 tabular-nums text-foreground">
        {metric === "r"
          ? copy.dashboard.byR
          : metric === "pct"
            ? copy.dashboard.percent
            : copy.dashboard.byPnl}{" "}
        {value}
      </p>
      <p className="tabular-nums text-muted-foreground">
        {copy.dashboard.equity} {formatSignedUsd(point.equity)}
      </p>
    </div>
  )
}

export function EquityCurve({
  data,
  defaultMetric = "pnl",
}: {
  data: EquityPoint[]
  defaultMetric?: EquityMetric
}) {
  const { copy } = useLabels()
  const fillId = `equityFill-${useId().replace(/:/g, "")}`
  const [metric, setMetric] = useState<EquityMetric>(defaultMetric)
  const start = data[0]?.equity ?? 0
  const chart = useMemo<ChartPoint[]>(
    () =>
      data.map((point) => ({
        ...point,
        pnl: Math.round((point.equity - start) * 100) / 100,
        pct: start === 0 ? 0 : Math.round(((point.equity - start) / start) * 1000) / 10,
      })),
    [data, start]
  )
  const labels: Record<EquityMetric, string> = {
    pnl: copy.dashboard.byPnl,
    r: copy.dashboard.byR,
    pct: copy.dashboard.percent,
  }
  const dataKey: EquityMetric = metric
  const last = chart[chart.length - 1]?.[metric] ?? 0
  const stroke =
    last > 0 ? "var(--bull)" : last < 0 ? "var(--bear)" : "var(--chart-1)"

  return (
    <Card size="sm" className="h-full min-h-[300px] gap-0 py-0">
      <CardHeader className="shrink-0 px-4 pt-3 pb-1">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <CardTitle>{copy.dashboard.equityCurve}</CardTitle>
          <SegmentedControl
            size="sm"
            options={EQUITY_METRICS}
            value={metric}
            onChange={setMetric}
            labels={labels}
            aria-label={copy.dashboard.equityCurve}
          />
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-1 pb-2">
        <div className="min-h-[240px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
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
                width={64}
                tickFormatter={(value: number) => {
                  if (metric === "r") return `${Math.round(value)}R`
                  if (metric === "pct") return `${Math.round(value)}%`
                  return Math.round(value).toLocaleString(LOCALE)
                }}
              />
              <Tooltip
                cursor={{ stroke, strokeWidth: 1 }}
                content={<EquityTooltip metric={metric} />}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={stroke}
                fill={`url(#${fillId})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5, fill: stroke, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
