"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatSignedMoney, signedClassName } from "@/lib/format"
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

export function PnlCalendar({
  calendar,
  cursor,
  onCursor,
  selectedDate,
  onSelect,
  currency,
}: {
  calendar: MonthCalendar
  cursor: MonthCursor
  onCursor: (cursor: MonthCursor) => void
  selectedDate: string | null
  onSelect: (date: string) => void
  currency: string
}) {
  const { copy, language } = useLabels()
  const today = todayIsoDate()

  function goToday() {
    const parsed = parseIsoDate(today)
    if (!parsed) return
    onCursor({ year: parsed.year, month: parsed.month })
    onSelect(today)
  }

  function pickDay(date: string, inMonth: boolean) {
    const parsed = parseIsoDate(date)
    if (!inMonth && parsed) {
      onCursor({ year: parsed.year, month: parsed.month })
    }
    onSelect(date)
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-[12px]"
            onClick={goToday}
          >
            {copy.calendar.today}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col px-3 pt-3 pb-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] border border-border">
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {copy.calendar.weekdays.map((label, index) => (
              <p
                key={label}
                className={cn(
                  "py-1.5 text-center text-[11px] font-medium tracking-wide text-muted-foreground",
                  index < 6 && "border-r border-border"
                )}
              >
                {label}
              </p>
            ))}
          </div>
          <div className="grid min-h-[420px] flex-1 grid-cols-7 grid-rows-6">
            {calendar.days.map((day, index) => {
              const selected = day.date === selectedDate
              const isToday = day.date === today
              const col = index % 7
              const lastRow = index >= 35
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => pickDay(day.date, day.inMonth)}
                  className={cn(
                    "relative flex min-h-[88px] flex-col items-stretch px-1.5 pt-1.5 pb-1.5 text-left",
                    col < 6 && "border-r border-border",
                    !lastRow && "border-b border-border",
                    day.inMonth ? "hover:bg-muted/35" : "bg-muted/10",
                    selected &&
                      "z-[1] bg-primary/10 shadow-[inset_0_0_0_2px_var(--primary)]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[12px] leading-none",
                      !day.inMonth && "text-muted-foreground/40",
                      day.inMonth && !isToday && !selected && "text-foreground",
                      day.inMonth && isToday && !selected && "font-semibold text-primary"
                    )}
                  >
                    {day.day}
                  </span>
                  {day.trades > 0 ? (
                    <span
                      className={cn(
                        "mt-auto w-full rounded-[8px] px-1.5 py-1",
                        day.pnl > 0 && "bg-bull/15",
                        day.pnl < 0 && "bg-bear/15",
                        day.pnl === 0 && "bg-muted/70",
                        !day.inMonth && "opacity-50"
                      )}
                    >
                      <span
                        className={cn(
                          "block truncate font-mono text-[11px] font-medium leading-tight tabular-nums",
                          signedClassName(day.pnl)
                        )}
                      >
                        {formatSignedMoney(day.pnl, currency)}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
                        {copy.calendar.dayTrades.replace("{n}", String(day.trades))}
                      </span>
                    </span>
                  ) : day.inMonth ? (
                    <span className="mt-auto mb-1 size-1.5 self-center rounded-full bg-muted-foreground/35" />
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-muted-foreground">
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
