"use client"

import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatSignedMoney,
  formatSignedPercentPoints,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { LOCALE } from "@/lib/locale"
import { formatMonthTitle } from "@/lib/pnl-calendar"
import {
  buildPerformanceCandles,
  parsePerformancePeriod,
  PERFORMANCE_PERIODS,
  type PerformanceCandle,
  type PerformancePeriod,
} from "@/lib/performance-candles"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Language } from "@/types/playbook"
import type { Trade } from "@/types/trade"

function periodTitle(
  candle: PerformanceCandle,
  language: Language,
  weekWord: string,
  weekdays: readonly string[]
): string {
  const parsed = parsePerformancePeriod(candle.period)
  if (!parsed) return candle.period
  if (parsed.kind === "weekday") {
    return weekdays[parsed.weekday - 1] ?? candle.period
  }
  if (parsed.kind === "week") return `${weekWord} ${parsed.week}`
  if (parsed.kind === "monthWeek") {
    const month = formatMonthTitle(
      { year: parsed.year, month: parsed.month },
      language
    )
    return `${weekWord} ${parsed.week} · ${month}`
  }
  return formatMonthTitle({ year: parsed.year, month: parsed.month }, language)
}

function tickLabel(
  candle: PerformanceCandle,
  weekdays: readonly string[]
): string {
  const parsed = parsePerformancePeriod(candle.period)
  if (!parsed) return candle.period
  if (parsed.kind === "weekday") return weekdays[parsed.weekday - 1] ?? candle.period
  if (parsed.kind === "week") return `W${parsed.week}`
  if (parsed.kind === "monthWeek") return `T${parsed.week}`
  return String(parsed.month)
}

function BarTooltip({
  active,
  payload,
  currency,
  language,
  weekWord,
  weekdays,
}: {
  active?: boolean
  payload?: Array<{ payload: PerformanceCandle }>
  currency: string
  language: Language
  weekWord: string
  weekdays: readonly string[]
}) {
  const { copy } = useLabels()
  if (!active || !payload?.[0]) return null
  const candle = payload[0].payload

  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium capitalize text-foreground">
        {periodTitle(candle, language, weekWord, weekdays)}
      </p>
      <p className={cn("mt-1 font-mono tabular-nums", signedClassName(candle.pnl))}>
        {formatSignedMoney(candle.pnl, currency)}
        <span className="ml-2 text-muted-foreground">
          {formatSignedR(candle.resultR)} · {formatSignedPercentPoints(candle.pnlPercent)}
        </span>
      </p>
    </div>
  )
}

export function PerformanceBars({
  trades,
  startCapital,
  currency,
}: {
  trades: Trade[]
  startCapital: number
  currency: string
}) {
  const { copy, language } = useLabels()
  const [period, setPeriod] = useState<PerformancePeriod>("week")
  const candles = useMemo(
    () => buildPerformanceCandles(trades, startCapital, period),
    [trades, startCapital, period]
  )
  const weekdays = copy.calendar.weekdays
  const periodLabels: Record<PerformancePeriod, string> = {
    week: copy.dashboard.byWeek,
    month: copy.dashboard.byMonth,
    weekday: copy.dashboard.byWeekday,
    monthWeek: copy.dashboard.byMonthWeek,
    yearMonth: copy.dashboard.byYearMonth,
  }

  return (
    <Card size="sm" className="h-full min-h-[240px] gap-0 py-0">
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{copy.dashboard.performance}</CardTitle>
          <SegmentedControl
            size="sm"
            options={PERFORMANCE_PERIODS}
            value={period}
            onChange={setPeriod}
            labels={periodLabels}
            aria-label={copy.dashboard.performance}
          />
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-2 pb-2">
        {candles.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            {copy.dashboard.performanceEmpty}
          </p>
        ) : (
          <div className="min-h-[200px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candles} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(_, index) => tickLabel(candles[index]!, weekdays)}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(value: number) => Math.round(value).toLocaleString(LOCALE)}
                />
                <Tooltip
                  cursor={{ fill: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}
                  content={
                    <BarTooltip
                      currency={currency}
                      language={language}
                      weekWord={copy.dashboard.byWeek}
                      weekdays={weekdays}
                    />
                  }
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {candles.map((candle) => (
                    <Cell
                      key={candle.period}
                      fill={candle.pnl >= 0 ? "var(--bull)" : "var(--bear)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
