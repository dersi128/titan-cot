"use client"

import { useMemo, useState } from "react"
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
import { LOCALE, prefersMoneyMetrics } from "@/lib/locale"
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
  const { copy, language } = useLabels()
  const preferredMetric: EquityMetric = prefersMoneyMetrics(language)
    ? "pnl"
    : defaultMetric
  const [pickedMetric, setPickedMetric] = useState<EquityMetric | null>(null)
  const metric = pickedMetric ?? preferredMetric
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

  return (
    <Card size="sm" className="gap-0 py-0" data-guide="equity">
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <CardTitle>{copy.dashboard.equityCurve}</CardTitle>
          <SegmentedControl
            size="sm"
            options={EQUITY_METRICS}
            value={metric}
            onChange={setPickedMetric}
            labels={labels}
            aria-label={copy.dashboard.equityCurve}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-2">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bull)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--bull)" stopOpacity={0} />
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
                cursor={{ stroke: "var(--bull)", strokeWidth: 1 }}
                content={<EquityTooltip metric={metric} />}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="var(--bull)"
                fill="url(#equityFill)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "var(--bull)", strokeWidth: 0 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
