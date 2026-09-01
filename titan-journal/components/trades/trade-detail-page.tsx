"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageFrame } from "@/components/layout/page-header"
import { TableSkeleton } from "@/components/layout/loading-state"
import { TradeDetail } from "@/components/trades/trade-detail"
import { useTrades } from "@/components/trades/trades-provider"
import { copy } from "@/lib/labels"

export function TradeDetailPage({ id }: { id: string }) {
  const { getById, isReady } = useTrades()
  const trade = getById(id)

  return (
    <PageFrame width="narrow">
      {!isReady ? (
        <TableSkeleton rows={10} />
      ) : !trade ? (
        <div className="rounded-xl border border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{copy.detail.notFound}</p>
          <Button asChild className="mt-4">
            <Link href="/journal">{copy.detail.backToJournal}</Link>
          </Button>
        </div>
      ) : (
        <TradeDetail trade={trade} />
      )}
    </PageFrame>
  )
}
