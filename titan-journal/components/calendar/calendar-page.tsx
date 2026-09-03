"use client"

import { PnlCalendar } from "@/components/calendar/pnl-calendar"
import { TableSkeleton } from "@/components/layout/loading-state"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useScopedTrades } from "@/components/layout/use-scoped-trades"
import { useLabels } from "@/lib/use-labels"

export function CalendarPage() {
  const { copy } = useLabels()
  const { trades, isReady, account, range, profile } = useScopedTrades()

  return (
    <PageFrame fill>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <PageHeader
          title={copy.calendar.title}
          description={copy.calendar.description}
          compact
        />
        {!isReady ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className="min-h-[480px] min-w-0 flex-1 lg:min-h-0">
            <PnlCalendar
              key={`${account}-${range}`}
              trades={trades}
              currency={profile.currency}
              fill
            />
          </div>
        )}
      </div>
    </PageFrame>
  )
}
