"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  formatCompactSigned,
  formatSignedMoney,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { todayIsoDate } from "@/lib/locale"
import {
  buildMonthCalendar,
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
              aria-label={copy.dashboard.previousMonth}
              onClick={() => setCursor((current) => shiftMonth(current, -1))}
            >
              <ChevronLeft />
            </Button>
            <CardTitle className="min-w-0 capitalize">
              {copy.dashboard.calendar}
              <span className="ml-2 font-medium text-muted-foreground">
                {formatMonthTitle(cursor, language)}
              </span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copy.dashboard.nextMonth}
              onClick={() => setCursor((current) => shiftMonth(current, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <p
            className={cn(
              "font-mono text-[13px] font-medium tabular-nums",
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
          {copy.dashboard.weekdays.map((label) => (
            <p
              key={label}
              className="text-center text-[10px] font-medium tracking-wide text-muted-foreground"
            >
              {label}
            </p>
          ))}
        </div>
        <div
          className={
            fill
              ? "grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-px"
              : "grid min-h-[240px] grid-cols-7 grid-rows-6 gap-px"
          }
        >
          {calendar.days.map((day) => {
            const isToday = day.date === today
            return (
              <div
                key={day.date}
                className={cn(
                  "flex min-h-0 flex-col items-center justify-center rounded-[6px] px-0.5",
                  dayTone(day),
                  isToday && "ring-1 ring-primary/55"
                )}
              >
                <span className="text-[10px] leading-none">{day.day}</span>
                {day.inMonth && day.trades > 0 ? (
                  <span className="mt-0.5 max-w-full truncate font-mono text-[10px] leading-none tabular-nums">
                    {formatCompactSigned(day.pnl)}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
