"use client"

import { useMemo, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatNumber, formatSignedMoney, formatSignedR, signedClassName } from "@/lib/format"
import { copy } from "@/lib/labels"
import {
  DISTRIBUTION_METRICS,
  marketDistribution,
  type AssetClassSlice,
  type DistributionMetric,
} from "@/lib/market-distribution"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

const METRIC_LABELS: Record<DistributionMetric, string> = {
  trades: copy.dashboard.byTrades,
  r: copy.dashboard.byR,
  pnl: copy.dashboard.byPnl,
}

function sliceLabel(slice: AssetClassSlice, metric: DistributionMetric, currency: string) {
  if (metric === "trades") return formatNumber(slice.trades, 0)
  if (metric === "r") return formatSignedR(slice.totalR)
  return formatSignedMoney(slice.netPnl, currency)
}

function DistributionTooltip({
  active,
  payload,
  metric,
  currency,
}: {
  active?: boolean
  payload?: Array<{ payload: AssetClassSlice }>
  metric: DistributionMetric
  currency: string
}) {
  if (!active || !payload?.[0]) return null
  const slice = payload[0].payload
  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium text-foreground">{slice.label}</p>
      <p className={cn("mt-0.5 font-mono tabular-nums", metric === "trades" ? "text-foreground" : signedClassName(slice.value))}>
        {sliceLabel(slice, metric, currency)}
        <span className="ml-2 text-muted-foreground">{Math.round(slice.share * 100)}%</span>
      </p>
    </div>
  )
}

export function MarketDistribution({
  trades,
  currency,
  fill = false,
}: {
  trades: Trade[]
  currency: string
  fill?: boolean
}) {
  const [metric, setMetric] = useState<DistributionMetric>("trades")
  const distribution = useMemo(
    () => marketDistribution(trades, metric),
    [trades, metric]
  )

  return (
    <Card
      size="sm"
      className={fill ? "h-full min-h-0 gap-0 py-0 lg:min-h-0" : undefined}
    >
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <CardTitle>{copy.dashboard.marketDistribution}</CardTitle>
          <SegmentedControl
            size="sm"
            options={DISTRIBUTION_METRICS}
            value={metric}
            onChange={setMetric}
            labels={METRIC_LABELS}
            aria-label={copy.dashboard.marketDistribution}
          />
        </div>
      </CardHeader>
      <CardContent
        className={
          fill
            ? "flex min-h-0 flex-1 flex-col pt-2 pb-2"
            : "pt-3"
        }
      >
        {distribution.slices.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            {copy.dashboard.marketDistributionEmpty}
          </p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col items-stretch gap-2">
            <div className="relative mx-auto aspect-square size-[120px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution.slices}
                    dataKey="slice"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius="68%"
                    outerRadius="92%"
                    paddingAngle={distribution.slices.length > 1 ? 2 : 0}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {distribution.slices.map((slice) => (
                      <Cell key={slice.assetClass} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <DistributionTooltip metric={metric} currency={currency} />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
                  {copy.dashboard.totalTradesLabel}
                </p>
                <p className="font-mono text-[18px] font-medium tabular-nums text-foreground">
                  {formatNumber(distribution.totalTrades, 0)}
                </p>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1">
              {distribution.slices.map((slice) => (
                <li
                  key={slice.assetClass}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 text-[12px]"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: slice.color }}
                    aria-hidden
                  />
                  <span className="truncate text-foreground">{slice.label}</span>
                  <span
                    className={cn(
                      "font-mono tabular-nums",
                      metric === "trades"
                        ? "text-muted-foreground"
                        : signedClassName(slice.value)
                    )}
                  >
                    {sliceLabel(slice, metric, currency)}
                  </span>
                  <span className="w-8 text-right font-mono tabular-nums text-muted-foreground">
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
