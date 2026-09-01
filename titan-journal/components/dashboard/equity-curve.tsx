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
      <CardHeader className="border-b border-white/[0.06]">
        <CardTitle>{copy.dashboard.equityCurve}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ea8ff" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2ea8ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#8a96a8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tickFormatter={formatChartDate}
              />
              <YAxis
                tick={{ fill: "#8a96a8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={72}
                tickFormatter={(value: number) =>
                  Math.round(value).toLocaleString(LOCALE)
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#0a1018",
                  border: "1px solid rgba(46,168,255,0.25)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#e8eef4",
                  boxShadow: "0 0 20px -8px rgba(46,168,255,0.35)",
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
                stroke="#2ea8ff"
                fill="url(#equityFill)"
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
