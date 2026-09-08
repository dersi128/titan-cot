"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { CalendarMetric } from "@/components/calendar/pnl-calendar"
import {
  formatCompactSigned,
  formatSignedMoney,
  formatSignedR,
} from "@/lib/format"
import {
  monthAxisTicks,
  type MonthProgressPoint,
} from "@/lib/pnl-calendar"

export function MonthProgress({
  points,
  metric,
  currency,
  lastDay,
}: {
  points: MonthProgressPoint[]
  metric: CalendarMetric
  currency: string
  lastDay: number
}) {
  if (points.length === 0) {
    return <div className="h-[180px]" />
  }

  const ticks = monthAxisTicks(Math.max(1, lastDay))

  function formatValue(value: number) {
    return metric === "r" ? formatSignedR(value) : formatSignedMoney(value, currency)
  }

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="monthProgressFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--bull)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--bull)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            dataKey="day"
            domain={[0, lastDay]}
            ticks={ticks}
            allowDecimals={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={52}
            domain={[
              (min: number) => Math.min(0, min),
              (max: number) => Math.max(0, max),
            ]}
            tickFormatter={(value: number) =>
              metric === "r"
                ? `${Math.round(value * 10) / 10}R`
                : formatCompactSigned(value)
            }
          />
          <Tooltip
            cursor={{ stroke: "color-mix(in srgb, var(--bull) 35%, transparent)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null
              const point = payload[0].payload as MonthProgressPoint
              if (point.day <= 0) return null
              return (
                <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
                  <p className="text-muted-foreground">{point.day}</p>
                  <p className="mt-1 font-mono tabular-nums">{formatValue(point.value)}</p>
                </div>
              )
            }}
          />
          <Area
            type="linear"
            dataKey="value"
            stroke="var(--bull)"
            fill="url(#monthProgressFill)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
