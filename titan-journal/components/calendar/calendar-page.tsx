"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { PnlCalendar } from "@/components/calendar/pnl-calendar"
import { EmptyJournal } from "@/components/layout/empty-journal"
import { TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { DirectionBadge } from "@/components/trades/trade-badges"
import { ResultR } from "@/components/trades/result-r"
import { tradeRowProps } from "@/components/trades/trade-row"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { accountEquity } from "@/lib/account-scope"
import { accountEdge } from "@/lib/analytics"
import {
  formatMoney,
  formatNumber,
  formatPercent,
  formatSignedMoney,
  formatSignedPercentPoints,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { todayIsoDate } from "@/lib/locale"
import {
  buildMonthCalendar,
  calendarInsights,
  defaultSelectedDate,
  formatCalendarDayTitle,
  initialCalendarMonth,
} from "@/lib/pnl-calendar"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

const MonthProgress = dynamic(
  () =>
    import("@/components/calendar/month-progress").then((mod) => mod.MonthProgress),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[160px] w-full rounded-[10px]" />,
  }
)

function StatCard({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string
  value: string
  hint?: string
  valueClassName?: string
}) {
  return (
    <article className="titan-kpi rounded-[10px] px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-mono text-[18px] font-medium tabular-nums", valueClassName)}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </article>
  )
}

function OverviewRow({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <p className="flex items-baseline justify-between gap-3 text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-mono tabular-nums", className)}>{value}</span>
    </p>
  )
}

function RBars({ rows }: { rows: Array<{ label: string; value: number | null }> }) {
  const maxAbs = Math.max(1, ...rows.map((row) => Math.abs(row.value ?? 0)))
  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const value = row.value ?? 0
        const width = row.value == null ? "0%" : `${(Math.abs(value) / maxAbs) * 100}%`
        return (
          <div key={row.label} className="flex items-center gap-2">
            <span className="w-[4.5rem] shrink-0 text-[11px] text-muted-foreground">
              {row.label}
            </span>
            <div className="h-1.5 min-w-0 flex-1 rounded-full bg-muted">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  value > 0 ? "bg-bull" : value < 0 ? "bg-bear" : "bg-muted-foreground/40"
                )}
                style={{ width }}
              />
            </div>
            <span
              className={cn(
                "w-14 text-right font-mono text-[11px] tabular-nums",
                signedClassName(row.value)
              )}
            >
              {row.value == null ? "—" : formatSignedR(row.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DayTrades({
  trades,
  title,
  empty,
  currency,
}: {
  trades: Trade[]
  title: string
  empty: string
  currency: string
}) {
  const { copy } = useLabels()
  const router = useRouter()

  return (
    <Card size="sm" className="flex min-h-[220px] flex-1 flex-col gap-0 py-0">
      <CardHeader className="shrink-0 border-b border-border py-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto px-0 pt-0">
        {trades.length === 0 ? (
          <p className="px-4 py-6 text-center text-[12px] text-muted-foreground">{empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 text-[11px]">{copy.journal.symbol}</TableHead>
                <TableHead className="text-[11px]">{copy.journal.direction}</TableHead>
                <TableHead className="text-[11px]">{copy.journal.playbook}</TableHead>
                <TableHead className="text-[11px]">{copy.journal.r}</TableHead>
                <TableHead className="text-[11px]">{copy.journal.pnl}</TableHead>
                <TableHead className="px-4 text-[11px]">{copy.detail.notes}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id} {...tradeRowProps(trade.id, router.push)}>
                  <TableCell className="px-4 font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <DirectionBadge direction={trade.direction} />
                  </TableCell>
                  <TableCell>{trade.strategy}</TableCell>
                  <TableCell>
                    <ResultR value={trade.resultR} />
                  </TableCell>
                  <TableCell className={signedClassName(trade.pnl)}>
                    {formatSignedMoney(trade.pnl, currency)}
                  </TableCell>
                  <TableCell className="max-w-[10rem] truncate px-4 text-muted-foreground">
                    {trade.notes.trim() || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function CalendarPage() {
  const { copy, language } = useLabels()
  const { accountTrades, isReady, account, capital, profile } = useScopedTrades()
  const [cursor, setCursor] = useState(() =>
    initialCalendarMonth(accountTrades, todayIsoDate())
  )
  const calendar = useMemo(
    () => buildMonthCalendar(accountTrades, cursor),
    [accountTrades, cursor]
  )
  const insights = useMemo(() => calendarInsights(calendar), [calendar])
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
  const edge = accountEdge(monthTrades)
  const ending = accountEquity(capital, edge.netPnl)
  const change = capital > 0 ? edge.netPnl / capital : null
  const avgPerDay =
    insights.tradingDays > 0
      ? (Math.round((edge.trades / insights.tradingDays) * 10) / 10).toString()
      : null

  return (
    <PageFrame>
      <div className="flex flex-col gap-3 pb-4">
        <PageHeader
          title={copy.calendar.title}
          description={copy.calendar.description}
        />
        {!isReady ? (
          <TableSkeleton rows={8} />
        ) : accountTrades.length === 0 ? (
          <EmptyJournal />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.9fr)]">
              <PnlCalendar
                calendar={calendar}
                cursor={cursor}
                onCursor={setCursor}
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                currency={profile.currency}
              />
              <div className="flex min-w-0 flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    label={copy.calendar.totalResult}
                    value={formatSignedR(edge.totalR)}
                    valueClassName={signedClassName(edge.totalR)}
                  />
                  <StatCard
                    label={copy.analytics.tradeCount}
                    value={String(edge.trades)}
                    hint={
                      avgPerDay
                        ? copy.calendar.avgPerDay.replace("{n}", avgPerDay)
                        : undefined
                    }
                  />
                  <StatCard
                    label={copy.dashboard.winRate}
                    value={formatPercent(edge.winRate)}
                    hint={edge.trades > 0 ? `${edge.wins}/${edge.trades}` : undefined}
                  />
                  <StatCard
                    label={copy.dashboard.profitFactor}
                    value={formatNumber(edge.profitFactor)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard
                    label={copy.calendar.bestDay}
                    value={
                      insights.bestDay ? formatSignedR(insights.bestDay.totalR) : "—"
                    }
                    hint={
                      insights.bestDay
                        ? formatCalendarDayTitle(insights.bestDay.date, language)
                        : undefined
                    }
                    valueClassName={signedClassName(insights.bestDay?.totalR)}
                  />
                  <StatCard
                    label={copy.calendar.worstDay}
                    value={
                      insights.worstDay ? formatSignedR(insights.worstDay.totalR) : "—"
                    }
                    hint={
                      insights.worstDay
                        ? formatCalendarDayTitle(insights.worstDay.date, language)
                        : undefined
                    }
                    valueClassName={signedClassName(insights.worstDay?.totalR)}
                  />
                </div>
                <DayTrades
                  trades={dayTrades}
                  title={copy.calendar.tradesOn.replace(
                    "{date}",
                    formatCalendarDayTitle(selectedDate, language)
                  )}
                  empty={copy.calendar.emptyDay}
                  currency={profile.currency}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-4">
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b border-border py-2">
                  <CardTitle>{copy.calendar.monthOverview}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 py-3">
                  <OverviewRow
                    label={copy.dashboard.startingCapital}
                    value={formatMoney(capital, profile.currency)}
                  />
                  <OverviewRow
                    label={copy.calendar.endingCapital}
                    value={formatMoney(ending, profile.currency)}
                  />
                  <OverviewRow
                    label={copy.calendar.equityChange}
                    value={formatSignedPercentPoints(
                      change == null ? null : change * 100
                    )}
                    className={signedClassName(change)}
                  />
                  <OverviewRow
                    label={copy.dashboard.maxDrawdown}
                    value={formatSignedR(edge.maxDrawdownR)}
                    className={signedClassName(edge.maxDrawdownR)}
                  />
                  <OverviewRow
                    label={copy.analytics.expectancy}
                    value={formatSignedR(edge.averageR)}
                    className={signedClassName(edge.averageR)}
                  />
                </CardContent>
              </Card>
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b border-border py-2">
                  <CardTitle>{copy.calendar.byWeek}</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <RBars
                    rows={insights.weeks.map((week) => ({
                      label: copy.calendar.week.replace("{n}", String(week.index)),
                      value: week.totalR,
                    }))}
                  />
                </CardContent>
              </Card>
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b border-border py-2">
                  <CardTitle>{copy.calendar.byWeekday}</CardTitle>
                </CardHeader>
                <CardContent className="py-3">
                  <RBars
                    rows={insights.weekdays.map((day) => ({
                      label: copy.calendar.weekdays[day.weekday] ?? "",
                      value: day.averageR,
                    }))}
                  />
                </CardContent>
              </Card>
              <Card size="sm" className="gap-0 py-0">
                <CardHeader className="border-b border-border py-2">
                  <CardTitle>{copy.calendar.monthProgress}</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <MonthProgress points={insights.progress} />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageFrame>
  )
}
