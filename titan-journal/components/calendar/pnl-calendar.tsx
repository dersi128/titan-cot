"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  formatCompactSigned,
  formatSignedR,
  signedClassName,
} from "@/lib/format"
import { todayIsoDate } from "@/lib/locale"
import {
  parseIsoDate,
  type MonthCalendar,
  type MonthCursor,
} from "@/lib/pnl-calendar"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

export type CalendarMetric = "r" | "pnl"

function tradeCountLabel(count: number, one: string, many: string) {
  return (count === 1 ? one : many).replace("{n}", String(count))
}

export function PnlCalendar({
  calendar,
  selectedDate,
  onCursor,
  onSelect,
  metric,
}: {
  calendar: MonthCalendar
  selectedDate: string | null
  onCursor: (cursor: MonthCursor) => void
  onSelect: (date: string) => void
  metric: CalendarMetric
}) {
  const { copy } = useLabels()
  const today = todayIsoDate()

  function pickDay(date: string, inMonth: boolean) {
    const parsed = parseIsoDate(date)
    if (!inMonth && parsed) {
      onCursor({ year: parsed.year, month: parsed.month })
    }
    onSelect(date)
  }

  return (
    <Card size="sm" className="flex h-full min-h-0 flex-col gap-0 py-0" data-guide="calendar-board">
      <CardContent className="flex min-h-0 flex-1 flex-col px-3 pt-3 pb-3">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-border bg-background">
          <div className="grid grid-cols-7 border-b border-border">
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
          <div className="grid flex-1 grid-cols-7 grid-rows-6">
            {calendar.days.map((day, index) => {
              const selected = day.date === selectedDate
              const isToday = day.date === today
              const value = metric === "r" ? day.totalR : day.pnl
              const traded = day.trades > 0
              const col = index % 7
              const lastRow = index >= 35
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => pickDay(day.date, day.inMonth)}
                  className={cn(
                    "relative flex min-h-[64px] flex-col items-stretch px-1.5 py-1.5 text-left transition-colors",
                    col < 6 && "border-r border-border",
                    !lastRow && "border-b border-border",
                    !day.inMonth && "bg-muted/15",
                    day.inMonth && !selected && !traded && "bg-background hover:bg-muted/25",
                    day.inMonth &&
                      !selected &&
                      traded &&
                      value > 0 &&
                      "bg-bull/12 hover:bg-bull/18",
                    day.inMonth &&
                      !selected &&
                      traded &&
                      value < 0 &&
                      "bg-bear/12 hover:bg-bear/18",
                    day.inMonth &&
                      !selected &&
                      traded &&
                      value === 0 &&
                      "bg-muted/40 hover:bg-muted/55",
                    selected &&
                      "z-[1] bg-background shadow-[inset_0_0_0_2px_var(--primary)]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] leading-none",
                      !day.inMonth && "text-muted-foreground/45",
                      day.inMonth && isToday && !selected && "font-semibold text-primary",
                      day.inMonth && (!isToday || selected) && "text-muted-foreground"
                    )}
                  >
                    {day.day}
                  </span>
                  {traded ? (
                    <span className="mt-auto min-w-0">
                      <span
                        className={cn(
                          "block truncate font-mono text-[12px] font-semibold leading-tight tabular-nums",
                          signedClassName(value)
                        )}
                      >
                        {metric === "r"
                          ? formatSignedR(value)
                          : formatCompactSigned(value)}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] leading-tight text-muted-foreground">
                        {tradeCountLabel(
                          day.trades,
                          copy.calendar.dayTradeOne,
                          copy.calendar.dayTrades
                        )}
                      </span>
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
