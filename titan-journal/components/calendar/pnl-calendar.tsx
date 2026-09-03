"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatSignedR } from "@/lib/format"
import { todayIsoDate } from "@/lib/locale"
import {
  formatMonthTitle,
  parseIsoDate,
  shiftMonth,
  type MonthCalendar,
  type MonthCursor,
} from "@/lib/pnl-calendar"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

function dayTone(inMonth: boolean, trades: number, totalR: number): string {
  if (!inMonth) return "text-muted-foreground/45"
  if (trades === 0) return "text-muted-foreground"
  if (totalR > 0) return "bg-bull/15 text-bull"
  if (totalR < 0) return "bg-bear/15 text-bear"
  return "bg-muted/70 text-muted-foreground"
}

export function PnlCalendar({
  calendar,
  cursor,
  onCursor,
  selectedDate,
  onSelect,
}: {
  calendar: MonthCalendar
  cursor: MonthCursor
  onCursor: (cursor: MonthCursor) => void
  selectedDate: string | null
  onSelect: (date: string) => void
}) {
  const { copy, language } = useLabels()
  const today = todayIsoDate()

  function goToday() {
    const parsed = parseIsoDate(today)
    if (!parsed) return
    onCursor({ year: parsed.year, month: parsed.month })
    onSelect(today)
  }

  return (
    <Card size="sm" className="flex h-full min-h-0 flex-col gap-0 py-0">
      <CardHeader className="shrink-0 border-b border-border py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={copy.calendar.previousMonth}
              onClick={() => onCursor(shiftMonth(cursor, -1))}
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
              onClick={() => onCursor(shiftMonth(cursor, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <Button type="button" variant="outline" size="sm" className="h-7 text-[12px]" onClick={goToday}>
            {copy.calendar.today}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2 pt-2 pb-2">
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
        <div className="grid min-h-[360px] flex-1 grid-cols-7 grid-rows-6 gap-1">
          {calendar.days.map((day) => {
            const selected = day.date === selectedDate
            const isToday = day.date === today
            return (
              <button
                key={day.date}
                type="button"
                disabled={!day.inMonth}
                onClick={() => onSelect(day.date)}
                className={cn(
                  "flex h-full min-h-0 w-full flex-col items-center justify-center rounded-[8px] px-1 py-1 text-center",
                  dayTone(day.inMonth, day.trades, day.totalR),
                  day.inMonth && "hover:brightness-125",
                  isToday && !selected && "ring-1 ring-primary/40",
                  selected && "ring-2 ring-primary"
                )}
              >
                <span className="text-[12px] leading-none">{day.day}</span>
                {day.inMonth && day.trades > 0 ? (
                  <span className="mt-1 max-w-full truncate font-mono text-[11px] leading-none tabular-nums">
                    {formatSignedR(day.totalR)}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
          <LegendDot className="bg-bull" label={copy.calendar.legendWin} />
          <LegendDot className="bg-bear" label={copy.calendar.legendLoss} />
          <LegendDot className="bg-muted-foreground/50" label={copy.calendar.legendEmpty} />
        </div>
      </CardContent>
    </Card>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", className)} />
      {label}
    </span>
  )
}
