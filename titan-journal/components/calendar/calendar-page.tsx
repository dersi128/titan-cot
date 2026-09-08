"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Trophy,
  TrendingDown,
  TrendingUp,
} from "lucide-react"

import {
  PnlCalendar,
  type CalendarMetric,
} from "@/components/calendar/pnl-calendar"
import { EmptyJournal } from "@/components/layout/empty-journal"
import { PageFrame } from "@/components/layout/page-header"
import { SegmentedControl } from "@/components/layout/segmented-control"
import { TableSkeleton } from "@/components/layout/loading-state"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useWorkspaceChrome } from "@/components/layout/workspace-chrome"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { accountEdge } from "@/lib/analytics"
import {
  formatPercent,
  formatSignedMoney,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { todayIsoDate } from "@/lib/locale"
import {
  buildMonthCalendar,
  buildMonthProgress,
  calendarWeekSlices,
  defaultSelectedDate,
  formatCalendarDayLong,
  formatCalendarRange,
  formatMonthTitle,
  initialCalendarMonth,
  shiftMonth,
} from "@/lib/pnl-calendar"
import { displayResultR } from "@/lib/trade-outcome"
import { formatRRR } from "@/lib/trade-calculations"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import { ACCOUNTS, type Trade } from "@/types/trade"

const CALENDAR_METRICS = ["pnl", "r"] as const

const MonthProgress = dynamic(
  () =>
    import("@/components/calendar/month-progress").then((mod) => mod.MonthProgress),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[180px] w-full rounded-[10px]" />,
  }
)

function tradeCountLabel(count: number, one: string, many: string) {
  return (count === 1 ? one : many).replace("{n}", String(count))
}

function formatValue(
  metric: CalendarMetric,
  r: number,
  pnl: number,
  currency: string
) {
  return metric === "r" ? formatSignedR(r) : formatSignedMoney(pnl, currency)
}

function StatCard({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string
  value: string
  icon: ReactNode
  valueClassName?: string
}) {
  return (
    <article className="titan-kpi flex items-center gap-3 rounded-[10px] px-3 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-0.5 font-mono text-[18px] font-medium tabular-nums",
            valueClassName
          )}
        >
          {value}
        </p>
      </div>
    </article>
  )
}

function WeekBars({
  weeks,
  metric,
  currency,
}: {
  weeks: ReturnType<typeof calendarWeekSlices>
  metric: CalendarMetric
  currency: string
}) {
  const { copy, language } = useLabels()
  const maxAbs = Math.max(
    1,
    ...weeks.map((week) => Math.abs(metric === "r" ? week.totalR : week.netPnl))
  )

  return (
    <div className="space-y-2.5">
      {weeks.map((week) => {
        const value = metric === "r" ? week.totalR : week.netPnl
        const empty = week.trades === 0
        const width = empty ? "0%" : `${(Math.abs(value) / maxAbs) * 100}%`
        return (
          <div key={week.index} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2">
            <div className="min-w-0">
              <p className="text-[12px] font-medium">
                {copy.calendar.week.replace("{n}", String(week.index))}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {formatCalendarRange(week.start, week.end, language)}
              </p>
            </div>
            <div className="h-1.5 min-w-0 rounded-full bg-muted">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  empty
                    ? "bg-muted-foreground/25"
                    : value > 0
                      ? "bg-bull"
                      : value < 0
                        ? "bg-bear"
                        : "bg-muted-foreground/40"
                )}
                style={{ width: empty ? "18%" : width }}
              />
            </div>
            <span
              className={cn(
                "w-[4.75rem] text-right font-mono text-[11px] tabular-nums",
                empty ? "text-muted-foreground" : signedClassName(value)
              )}
            >
              {empty ? "—" : formatValue(metric, week.totalR, week.netPnl, currency)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DayPanel({
  date,
  trades,
  metric,
  currency,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: {
  date: string
  trades: Trade[]
  metric: CalendarMetric
  currency: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}) {
  const { copy, language } = useLabels()
  const totalR = trades.reduce((sum, trade) => sum + (displayResultR(trade) ?? 0), 0)
  const totalPnl = trades.reduce(
    (sum, trade) => sum + (trade.pnl != null && Number.isFinite(trade.pnl) ? trade.pnl : 0),
    0
  )
  const total = metric === "r" ? totalR : totalPnl

  return (
    <Card size="sm" className="flex min-h-0 flex-1 flex-col gap-0 py-0">
      <CardHeader className="shrink-0 border-b border-border py-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="min-w-0 capitalize">
            {formatCalendarDayLong(date, language)}
          </CardTitle>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copy.calendar.previousDay}
              disabled={!canPrev}
              onClick={onPrev}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copy.calendar.nextDay}
              disabled={!canNext}
              onClick={onNext}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        {trades.length > 0 ? (
          <p className="mt-1 flex items-baseline gap-2 text-[12px]">
            <span className={cn("font-mono font-medium tabular-nums", signedClassName(total))}>
              {formatValue(metric, totalR, totalPnl, currency)}
            </span>
            <span className="text-muted-foreground">
              {tradeCountLabel(
                trades.length,
                copy.calendar.dayTradeOne,
                copy.calendar.dayTrades
              )}
            </span>
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-3">
        {trades.length === 0 ? (
          <p className="py-6 text-center text-[12px] text-muted-foreground">
            {copy.calendar.emptyDay}
          </p>
        ) : (
          trades.map((trade) => {
            const result = displayResultR(trade) ?? 0
            const pnl = trade.pnl ?? 0
            const value = metric === "r" ? result : pnl
            return (
              <article
                key={trade.id}
                className="overflow-hidden rounded-[10px] border border-border bg-elevated"
              >
                <div className="flex">
                  <span
                    className={cn(
                      "w-1 shrink-0",
                      value > 0 ? "bg-bull" : value < 0 ? "bg-bear" : "bg-muted-foreground/40"
                    )}
                  />
                  <div className="min-w-0 flex-1 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="min-w-0 truncate text-[13px] font-semibold">
                        {trade.symbol} • {trade.direction}
                      </p>
                      <p
                        className={cn(
                          "shrink-0 font-mono text-[13px] font-semibold tabular-nums",
                          signedClassName(value)
                        )}
                      >
                        {formatValue(metric, result, pnl, currency)}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                      {trade.strategy.trim() || copy.analytics.setup}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                      <p>{copy.calendar.risk.replace("{n}", String(trade.riskPercent))}</p>
                      <p>
                        {copy.detail.plannedRrr} {formatRRR(trade.plannedRRR)}
                      </p>
                      <p className={cn("font-mono tabular-nums", signedClassName(value))}>
                        {copy.detail.result} {formatValue(metric, result, pnl, currency)}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="mt-3 w-full bg-elevated">
                      <Link href={`/journal/${trade.id}`}>
                        {copy.calendar.openDetail}
                        <ChevronRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

export function CalendarPage() {
  const { copy, language, ACCOUNT_LABELS } = useLabels()
  const { account, setAccount } = useWorkspaceChrome()
  const { accountTrades, isReady, profile } = useScopedTrades()
  const [metric, setMetric] = useState<CalendarMetric>("pnl")
  const [cursor, setCursor] = useState(() =>
    initialCalendarMonth(accountTrades, todayIsoDate())
  )
  const calendar = useMemo(
    () => buildMonthCalendar(accountTrades, cursor),
    [accountTrades, cursor]
  )
  const [selectedDate, setSelectedDate] = useState(() =>
    defaultSelectedDate(calendar, todayIsoDate())
  )

  useEffect(() => {
    setCursor(initialCalendarMonth(accountTrades, todayIsoDate()))
    // Account switch / first load. Stay on the month the trader picked after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isReady])

  useEffect(() => {
    setSelectedDate((current) =>
      current.startsWith(calendar.key)
        ? current
        : defaultSelectedDate(calendar, todayIsoDate())
    )
  }, [calendar.key])

  const monthTrades = useMemo(
    () => accountTrades.filter((trade) => trade.date.startsWith(calendar.key)),
    [accountTrades, calendar.key]
  )
  const dayTrades = useMemo(
    () => accountTrades.filter((trade) => trade.date === selectedDate),
    [accountTrades, selectedDate]
  )
  const inMonth = useMemo(
    () => calendar.days.filter((day) => day.inMonth),
    [calendar.days]
  )
  const selectedIndex = inMonth.findIndex((day) => day.date === selectedDate)
  const weeks = useMemo(() => calendarWeekSlices(calendar), [calendar])
  const edge = accountEdge(monthTrades)
  const monthValue = metric === "r" ? calendar.totalR : calendar.netPnl
  const bestDay = useMemo(() => {
    const traded = inMonth.filter((day) => day.trades > 0)
    if (traded.length === 0) return null
    return traded.reduce((best, day) => {
      const current = metric === "r" ? day.totalR : day.pnl
      const lead = metric === "r" ? best.totalR : best.pnl
      return current > lead ? day : best
    })
  }, [inMonth, metric])
  const progress = useMemo(
    () => buildMonthProgress(calendar.days, metric, todayIsoDate()),
    [calendar.days, metric]
  )
  const lastDay = inMonth.at(-1)?.day ?? 31

  function goToday() {
    const today = todayIsoDate()
    const year = Number(today.slice(0, 4))
    const month = Number(today.slice(5, 7))
    if (Number.isFinite(year) && Number.isFinite(month)) {
      setCursor({ year, month })
    }
    setSelectedDate(today)
  }

  return (
    <PageFrame>
      <div className="flex flex-col gap-3 pb-4">
        <header className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-end">
          <div className="min-w-0">
            <h1 className="text-[length:var(--ui-title)] font-semibold tracking-tight text-foreground">
              {copy.calendar.title}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {copy.calendar.description}
            </p>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={copy.calendar.previousMonth}
              onClick={() => setCursor(shiftMonth(cursor, -1))}
            >
              <ChevronLeft />
            </Button>
            <button
              type="button"
              className="min-w-[9.5rem] px-1 text-center text-[15px] font-semibold capitalize"
              onClick={goToday}
              title={copy.calendar.today}
            >
              {formatMonthTitle(cursor, language)}
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={copy.calendar.nextMonth}
              onClick={() => setCursor(shiftMonth(cursor, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Select
              value={account}
              onValueChange={(next) => setAccount(next as (typeof ACCOUNTS)[number])}
            >
              <SelectTrigger size="sm" aria-label={copy.shell.account} className="min-w-[9.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {ACCOUNTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {ACCOUNT_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SegmentedControl
              size="sm"
              tone="strong"
              options={CALENDAR_METRICS}
              value={metric}
              onChange={setMetric}
              labels={{ r: copy.dashboard.byR, pnl: copy.journal.pnl }}
              aria-label={copy.calendar.totalResult}
            />
          </div>
        </header>

        {!isReady ? (
          <TableSkeleton rows={8} />
        ) : accountTrades.length === 0 ? (
          <EmptyJournal />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
              <StatCard
                label={copy.calendar.totalResult}
                value={formatValue(metric, calendar.totalR, calendar.netPnl, profile.currency)}
                valueClassName={signedClassName(monthValue)}
                icon={
                  monthValue >= 0 ? (
                    <TrendingUp className="size-4" aria-hidden />
                  ) : (
                    <TrendingDown className="size-4" aria-hidden />
                  )
                }
              />
              <StatCard
                label={copy.analytics.tradeCount}
                value={String(calendar.tradeCount)}
                icon={<Briefcase className="size-4" aria-hidden />}
              />
              <StatCard
                label={copy.dashboard.winRate}
                value={formatPercent(edge.winRate)}
                icon={<PieChart className="size-4" aria-hidden />}
              />
              <StatCard
                label={copy.calendar.bestDay}
                value={
                  bestDay
                    ? formatValue(metric, bestDay.totalR, bestDay.pnl, profile.currency)
                    : "—"
                }
                valueClassName={signedClassName(
                  bestDay ? (metric === "r" ? bestDay.totalR : bestDay.pnl) : null
                )}
                icon={<Trophy className="size-4" aria-hidden />}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.85fr)]">
              <PnlCalendar
                calendar={calendar}
                selectedDate={selectedDate}
                onCursor={setCursor}
                onSelect={setSelectedDate}
                metric={metric}
              />
              <DayPanel
                date={selectedDate}
                trades={dayTrades}
                metric={metric}
                currency={profile.currency}
                canPrev={selectedIndex > 0}
                canNext={selectedIndex >= 0 && selectedIndex < inMonth.length - 1}
                onPrev={() => {
                  const previous = inMonth[selectedIndex - 1]
                  if (previous) setSelectedDate(previous.date)
                }}
                onNext={() => {
                  const next = inMonth[selectedIndex + 1]
                  if (next) setSelectedDate(next.date)
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b border-border py-2">
                  <CardTitle>{copy.calendar.byWeek}</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <WeekBars weeks={weeks} metric={metric} currency={profile.currency} />
                </CardContent>
              </Card>
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b border-border py-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{copy.calendar.monthProgress}</CardTitle>
                    <p
                      className={cn(
                        "font-mono text-[12px] font-medium tabular-nums",
                        signedClassName(monthValue)
                      )}
                    >
                      {formatValue(metric, calendar.totalR, calendar.netPnl, profile.currency)}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <MonthProgress
                    points={progress}
                    metric={metric}
                    currency={profile.currency}
                    lastDay={lastDay}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageFrame>
  )
}
