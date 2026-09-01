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
import { formatChartDate, formatDate, formatSignedUsd } from "@/lib/format"
import { copy } from "@/lib/labels"
import { LOCALE } from "@/lib/locale"
import type { EquityPoint } from "@/lib/trade-calculations"

export function EquityCurve({ data }: { data: EquityPoint[] }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{copy.dashboard.equityCurve}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickFormatter={formatChartDate}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(value: number) =>
                  Math.round(value).toLocaleString(LOCALE)
                }
              />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value) => [
                  formatSignedUsd(Number(value ?? 0)),
                  copy.dashboard.equity,
                ]}
                labelFormatter={(_, payload) =>
                  formatDate(payload?.[0]?.payload?.date || "")
                }
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
