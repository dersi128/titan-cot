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

import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  DATE_RANGES,
  useWorkspaceChrome,
} from "@/components/layout/workspace-chrome"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatChartDate,
  formatDate,
  formatSignedR,
  formatSignedUsd,
} from "@/lib/format"
import { copy } from "@/lib/labels"
import { LOCALE } from "@/lib/locale"
import type { EquityPoint } from "@/lib/trade-calculations"

function EquityTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: EquityPoint }>
}) {
  if (!active || !payload?.[0]) return null
  const point = payload[0].payload

  return (
    <div className="rounded-[10px] border border-[rgba(46,168,255,0.18)] bg-[#0c121a] px-3 py-2 text-[12px] shadow-lg">
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

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  const { range, setRange } = useWorkspaceChrome()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-white/[0.06] py-3">
        <CardTitle>{copy.dashboard.equityCurve}</CardTitle>
        <SegmentedControl
          aria-label={copy.shell.range}
          size="sm"
          options={DATE_RANGES}
          value={range}
          onChange={setRange}
        />
      </CardHeader>
      <CardContent className="pt-3">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ea8ff" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#2ea8ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8a96a8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={28}
                tickFormatter={formatChartDate}
              />
              <YAxis
                tick={{ fill: "#8a96a8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={64}
                tickFormatter={(value: number) =>
                  Math.round(value).toLocaleString(LOCALE)
                }
              />
              <Tooltip
                cursor={{ stroke: "rgba(46,168,255,0.35)", strokeWidth: 1 }}
                content={<EquityTooltip />}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#2ea8ff"
                fill="url(#equityFill)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3, fill: "#2ea8ff", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
