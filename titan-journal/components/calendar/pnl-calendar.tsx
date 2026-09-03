"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  formatCompactSigned,
  formatSignedMoney,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { todayIsoDate } from "@/lib/locale"
import {
  buildMonthCalendar,
  calendarDayHref,
  formatMonthTitle,
  initialCalendarMonth,
  shiftMonth,
  type CalendarDay,
} from "@/lib/pnl-calendar"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import type { Trade } from "@/types/trade"

function dayTone(day: CalendarDay): string {
  if (!day.inMonth || day.trades === 0) {
    return day.inMonth ? "text-muted-foreground" : "text-muted-foreground/45"
  }
  if (day.pnl > 0) return "bg-bull/15 text-bull"
  if (day.pnl < 0) return "bg-bear/15 text-bear"
  return "bg-muted/70 text-muted-foreground"
}

function dayCellClass(day: CalendarDay, isToday: boolean) {
  return cn(
    "flex h-full min-h-0 w-full flex-col items-center justify-center rounded-[8px] px-1 py-1 text-center",
    dayTone(day),
    isToday && "ring-1 ring-primary/55",
    day.inMonth && day.items.length > 0 && "cursor-pointer hover:brightness-125"
  )
}

function DayBody({ day }: { day: CalendarDay }) {
  return (
    <>
      <span className="text-[12px] leading-none">{day.day}</span>
      {day.inMonth && day.trades > 0 ? (
        <span className="mt-1 max-w-full truncate font-mono text-[12px] leading-none tabular-nums">
          {formatCompactSigned(day.pnl)}
        </span>
      ) : null}
    </>
  )
}

function DayCell({
  day,
  isToday,
  openTrade,
  openTrades,
}: {
  day: CalendarDay
  isToday: boolean
  openTrade: string
  openTrades: string
}) {
  const router = useRouter()
  const href = calendarDayHref(day)
  const className = dayCellClass(day, isToday)

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        aria-label={`${openTrade} ${day.items[0].symbol}`}
      >
        <DayBody day={day} />
      </Link>
    )
  }

  if (day.inMonth && day.items.length > 1) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className={className} aria-label={openTrades}>
          <DayBody day={day} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {day.items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              onSelect={() => router.push(`/journal/${item.id}`)}
            >
              <span>{item.symbol}</span>
              <span
                className={cn(
                  "ml-auto font-mono tabular-nums",
                  signedClassName(item.pnl)
                )}
              >
                {formatCompactSigned(item.pnl)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={className}>
      <DayBody day={day} />
    </div>
  )
}

export function PnlCalendar({
  trades,
  currency,
  fill = false,
}: {
  trades: Trade[]
  currency: string
  fill?: boolean
}) {
  const { copy, language } = useLabels()
  const today = todayIsoDate()
  const [cursor, setCursor] = useState(() => initialCalendarMonth(trades, today))
  const calendar = useMemo(
    () => buildMonthCalendar(trades, cursor),
    [trades, cursor]
  )

  return (
    <Card
      size="sm"
      className={fill ? "flex h-full min-h-0 flex-col gap-0 py-0" : undefined}
    >
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copy.calendar.previousMonth}
              onClick={() => setCursor((current) => shiftMonth(current, -1))}
            >
              <ChevronLeft />
            </Button>
            <CardTitle className="min-w-0 capitalize">
              {formatMonthTitle(cursor, language)}
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copy.calendar.nextMonth}
              onClick={() => setCursor((current) => shiftMonth(current, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <p
            className={cn(
              "font-mono text-[16px] font-medium tabular-nums",
              signedClassName(calendar.netPnl)
            )}
          >
            {formatSignedMoney(calendar.netPnl, currency)}
            <span className="ml-2 text-muted-foreground">
              {formatSignedR(calendar.totalR)}
            </span>
          </p>
        </div>
      </CardHeader>
      <CardContent
        className={
          fill
            ? "flex min-h-0 flex-1 flex-col gap-1 pt-2 pb-2"
            : "flex flex-col gap-1 pt-3"
        }
      >
        <div className="grid grid-cols-7 gap-px">
          {copy.calendar.weekdays.map((label) => (
            <p
              key={label}
              className="text-center text-[11px] font-medium tracking-wide text-muted-foreground"
            >
              {label}
            </p>
          ))}
        </div>
        <div
          className={
            fill
              ? "grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1"
              : "grid min-h-[480px] grid-cols-7 grid-rows-6 gap-1"
          }
        >
          {calendar.days.map((day) => (
            <DayCell
              key={day.date}
              day={day}
              isToday={day.date === today}
              openTrade={copy.calendar.openTrade}
              openTrades={copy.calendar.openTrades}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
