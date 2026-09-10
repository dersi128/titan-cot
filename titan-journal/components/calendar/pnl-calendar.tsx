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
  const lastInMonthIndex = calendar.days.reduce(
    (last, day, index) => (day.inMonth ? index : last),
    -1
  )
  const visibleCellCount = Math.ceil((lastInMonthIndex + 1) / 7) * 7
  const visibleDays = calendar.days.slice(0, visibleCellCount)

  function pickDay(date: string, inMonth: boolean) {
    const parsed = parseIsoDate(date)
    if (!inMonth && parsed) {
      onCursor({ year: parsed.year, month: parsed.month })
    }
    onSelect(date)
  }

  return (
    <Card size="sm" className="titan-calendar flex min-h-0 flex-col gap-0 py-0" data-guide="calendar-board">
      <CardContent className="flex min-h-0 flex-none flex-col px-3 pt-3 pb-3">
        <div className="titan-calendar-board flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px]">
          <div className="titan-calendar-weekdays grid grid-cols-7">
            {copy.calendar.weekdays.map((label, index) => (
              <p
                key={label}
                className={cn(
                  "titan-calendar-weekday py-1.5 text-center text-[11px] font-medium tracking-wide text-muted-foreground",
                  index < 6 && "titan-calendar-weekday--edge"
                )}
              >
                {label}
              </p>
            ))}
          </div>
          <div className="titan-calendar-grid grid grid-cols-7">
            {visibleDays.map((day, index) => {
              const selected = day.date === selectedDate
              const isToday = day.date === today
              const value = metric === "r" ? day.totalR : day.pnl
              const traded = day.trades > 0
              const col = index % 7
              const lastRow = index >= visibleDays.length - 7
              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => day.inMonth && pickDay(day.date, true)}
                  className={cn(
                    "titan-calendar-day relative flex min-h-[64px] flex-col items-stretch px-1.5 py-1.5 text-left transition-colors",
                    col < 6 && "titan-calendar-day--edge",
                    !lastRow && "titan-calendar-day--row",
                    !day.inMonth && "titan-calendar-day--outside",
                    day.inMonth && !traded && "titan-calendar-day--empty",
                    day.inMonth && traded && value > 0 && "titan-calendar-day--win",
                    day.inMonth && traded && value < 0 && "titan-calendar-day--loss",
                    day.inMonth && traded && value === 0 && "titan-calendar-day--flat",
                    selected && "titan-calendar-day--selected"
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
                    {day.inMonth ? day.day : null}
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
