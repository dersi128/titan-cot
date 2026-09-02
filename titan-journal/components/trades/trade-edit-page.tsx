"use client"

import Link from "next/link"

import { TradeForm } from "@/components/forms/new-trade-form"
import { PageFrame } from "@/components/layout/page-header"
import { TableSkeleton } from "@/components/layout/loading-state"
import { Button } from "@/components/ui/button"
import { useTrades } from "@/components/trades/trades-provider"
import { copy } from "@/lib/labels"

export function TradeEditPage({ id }: { id: string }) {
  const { getById, isReady } = useTrades()
  const trade = getById(id)

  if (!isReady) {
    return (
      <PageFrame width="narrow">
        <TableSkeleton rows={8} />
      </PageFrame>
    )
  }

  if (!trade) {
    return (
      <PageFrame width="narrow">
        <div className="rounded-xl border border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{copy.detail.notFound}</p>
          <Button asChild className="mt-4">
            <Link href="/journal">{copy.detail.backToJournal}</Link>
          </Button>
        </div>
      </PageFrame>
    )
  }

  return <TradeForm trade={trade} />
}
