"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatChartDate,
  formatDate,
  formatSignedR,
  formatSignedUsd,
} from "@/lib/format"
import { LOCALE } from "@/lib/locale"
import { useLabels } from "@/lib/use-labels"
import type { EquityPoint } from "@/lib/trade-calculations"

function EquityTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: EquityPoint }>
}) {
  const { copy } = useLabels()
  if (!active || !payload?.[0]) return null
  const point = payload[0].payload

  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="text-muted-foreground">
        {point.date ? formatDate(point.date) : point.label}
      </p>
      <p className="mt-1 tabular-nums text-foreground">
        {copy.dashboard.equity} {formatSignedUsd(point.equity)}
      </p>
      <p className="tabular-nums text-muted-foreground">
        R {formatSignedR(point.r)}
      </p>
    </div>
  )
}

export function EquityCurve({
  data,
  fill = false,
}: {
  data: EquityPoint[]
  fill?: boolean
}) {
  const { copy } = useLabels()
  return (
    <Card
      size="sm"
      className={fill ? "h-full min-h-0 gap-0 py-0 lg:min-h-0" : undefined}
    >
      <CardHeader className="shrink-0 border-b border-border py-2">
        <CardTitle>{copy.dashboard.equityCurve}</CardTitle>
      </CardHeader>
      <CardContent className={fill ? "flex min-h-0 flex-1 flex-col pt-2 pb-2" : "pt-3"}>
        <div className={fill ? "min-h-[140px] flex-1 lg:min-h-0" : "h-52"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
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
                width={76}
                tickFormatter={(value: number) =>
                  Math.round(value).toLocaleString(LOCALE)
                }
              />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }}
                content={<EquityTooltip />}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="var(--chart-1)"
                fill="url(#equityFill)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
