"use client"

import { useMemo, useState, type PointerEvent } from "react"
import { ResponsiveContainer } from "recharts"

import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  formatMoney,
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

const PAD = { top: 8, right: 8, bottom: 22, left: 52 }

function periodTitle(
  candle: PerformanceCandle,
  language: Language,
  weekWord: string
): string {
  const parsed = parsePerformancePeriod(candle.period)
  if (!parsed) return candle.period
  if (parsed.kind === "week") return `${weekWord} ${parsed.week}`
  return formatMonthTitle({ year: parsed.year, month: parsed.month }, language)
}

function tickLabel(candle: PerformanceCandle): string {
  const parsed = parsePerformancePeriod(candle.period)
  if (!parsed) return candle.period
  if (parsed.kind === "week") return `W${parsed.week}`
  return String(parsed.month)
}

function CandleTooltip({
  candle,
  currency,
  language,
  weekWord,
}: {
  candle: PerformanceCandle
  currency: string
  language: Language
  weekWord: string
}) {
  const { copy } = useLabels()
  const rows = [
    [copy.dashboard.candleOpen, formatMoney(candle.open, currency)],
    [copy.dashboard.candleHigh, formatMoney(candle.high, currency)],
    [copy.dashboard.candleLow, formatMoney(candle.low, currency)],
    [copy.dashboard.candleClose, formatMoney(candle.close, currency)],
    [copy.dashboard.change, formatSignedPercentPoints(candle.pnlPercent)],
    [
      copy.dashboard.result,
      `${formatSignedR(candle.resultR)} · ${formatSignedMoney(candle.pnl, currency)}`,
    ],
  ] as const

  return (
    <div className="rounded-[10px] border border-border bg-popover px-3 py-2 text-[12px] shadow-lg">
      <p className="font-medium capitalize text-foreground">
        {periodTitle(candle, language, weekWord)}
      </p>
      <dl className="mt-1.5 space-y-0.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd
              className={cn(
                "font-mono tabular-nums",
                label === copy.dashboard.change || label === copy.dashboard.result
                  ? signedClassName(candle.pnl)
                  : "text-foreground"
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function CandlePlot({
  data,
  width = 0,
  height = 0,
  currency,
  language,
  weekWord,
}: {
  data: PerformanceCandle[]
  width?: number
  height?: number
  currency: string
  language: Language
  weekWord: string
}) {
  const [active, setActive] = useState<number | null>(null)
  const innerW = Math.max(0, width - PAD.left - PAD.right)
  const innerH = Math.max(0, height - PAD.top - PAD.bottom)
  const lows = data.map((candle) => candle.low)
  const highs = data.map((candle) => candle.high)
  let minY = Math.min(...lows)
  let maxY = Math.max(...highs)
  if (!Number.isFinite(minY) || !Number.isFinite(maxY) || minY === maxY) {
    const mid = Number.isFinite(minY) ? minY : 0
    const pad = Math.max(50, Math.abs(mid) * 0.02)
    minY = mid - pad
    maxY = mid + pad
  } else {
    const pad = (maxY - minY) * 0.08
    minY -= pad
    maxY += pad
  }
  const span = maxY - minY || 1
  const y = (value: number) => PAD.top + ((maxY - value) / span) * innerH
  const slot = data.length > 0 ? innerW / data.length : innerW
  const bodyW = Math.max(3, Math.min(16, slot * 0.42))
  const ticks = [maxY, (maxY + minY) / 2, minY]
  const labelEvery = data.length > 10 ? 2 : 1

  function onMove(event: PointerEvent<SVGSVGElement>) {
    if (data.length === 0 || innerW <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left - PAD.left
    if (x < 0 || x > innerW) {
      setActive(null)
      return
    }
    const index = Math.max(0, Math.min(data.length - 1, Math.floor(x / slot)))
    setActive(index)
  }

  if (width < 8 || height < 8) return null

  return (
    <div className="relative h-full w-full">
      <svg
        width={width}
        height={height}
        className="h-full w-full"
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
      >
        {ticks.map((tick, index) => (
          <g key={index}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--border)"
              strokeOpacity={0.55}
            />
            <text
              x={PAD.left - 6}
              y={y(tick) + 3}
              textAnchor="end"
              fill="var(--muted-foreground)"
              fontSize="11"
            >
              {Math.round(tick).toLocaleString(LOCALE)}
            </text>
          </g>
        ))}
        {data.map((candle, index) => {
          const cx = PAD.left + slot * index + slot / 2
          const openY = y(candle.open)
          const closeY = y(candle.close)
          const highY = y(candle.high)
          const lowY = y(candle.low)
          const up = candle.close >= candle.open
          const color = up ? "var(--bull)" : "var(--bear)"
          const top = Math.min(openY, closeY)
          const bodyH = Math.max(2, Math.abs(closeY - openY))
          const lit = active === index
          return (
            <g key={candle.period} opacity={active == null || lit ? 1 : 0.45}>
              <line
                x1={cx}
                x2={cx}
                y1={highY}
                y2={lowY}
                stroke={color}
                strokeWidth={1}
              />
              <rect
                x={cx - bodyW / 2}
                y={top}
                width={bodyW}
                height={bodyH}
                fill={color}
                rx={1}
              />
              {index % labelEvery === 0 ? (
                <text
                  x={cx}
                  y={height - 6}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize="10"
                >
                  {tickLabel(candle)}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      {active != null && data[active] ? (
        <div className="pointer-events-none absolute top-1 right-1 z-10">
          <CandleTooltip
            candle={data[active]}
            currency={currency}
            language={language}
            weekWord={weekWord}
          />
        </div>
      ) : null}
    </div>
  )
}

export function PerformanceCandles({
  trades,
  startCapital,
  currency,
  fill = false,
}: {
  trades: Trade[]
  startCapital: number
  currency: string
  fill?: boolean
}) {
  const { copy, language } = useLabels()
  const [period, setPeriod] = useState<PerformancePeriod>("week")
  const candles = useMemo(
    () => buildPerformanceCandles(trades, startCapital, period),
    [trades, startCapital, period]
  )
  const periodLabels: Record<PerformancePeriod, string> = {
    week: copy.dashboard.byWeek,
    month: copy.dashboard.byMonth,
  }

  return (
    <Card
      size="sm"
      className={fill ? "h-full min-h-0 gap-0 py-0 lg:min-h-0" : undefined}
    >
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
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
      <CardContent
        className={fill ? "flex min-h-0 flex-1 flex-col pt-2 pb-2" : "pt-3"}
      >
        {candles.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            {copy.dashboard.performanceEmpty}
          </p>
        ) : (
          <div className={fill ? "min-h-[140px] flex-1 lg:min-h-0" : "h-52"}>
            <ResponsiveContainer width="100%" height="100%">
              <CandlePlot
                data={candles}
                currency={currency}
                language={language}
                weekWord={copy.dashboard.byWeek}
              />
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
