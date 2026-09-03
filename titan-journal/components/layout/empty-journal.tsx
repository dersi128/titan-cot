"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useJournalImport } from "@/components/trades/journal-file-import"
import { useTrades } from "@/components/trades/trades-provider"
import { isSampleJournal, MOCK_TRADES, sortTrades } from "@/lib/mock-data"
import { useLabels } from "@/lib/use-labels"

export function EmptyJournal() {
  const { copy } = useLabels()
  const { trades, replaceAll } = useTrades()
  const importer = useJournalImport()
  const scoped = trades.length > 0

  return (
    <div className="titan-glass rounded-[10px] px-5 py-7 sm:px-8">
      <p className="text-[22px] font-semibold tracking-tight">
        {scoped ? copy.emptyStart.scoped : copy.emptyStart.title}
      </p>
      {!scoped ? (
        <>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
            {copy.emptyStart.body}
          </p>
          <ol className="mt-5 grid gap-2 sm:grid-cols-3">
            {[copy.emptyStart.step1, copy.emptyStart.step2, copy.emptyStart.step3].map(
              (step, index) => (
                <li
                  key={step}
                  className="rounded-[8px] border border-border bg-elevated/40 px-3 py-2.5"
                >
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-[13px] font-medium">{step}</p>
                </li>
              )
            )}
          </ol>
        </>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href="/new-trade">{copy.emptyStart.cta}</Link>
        </Button>
        <Button type="button" variant="outline" onClick={importer.pick}>
          {copy.journal.importReport}
        </Button>
        {importer.fileInput}
        {!scoped ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => replaceAll(sortTrades(MOCK_TRADES))}
          >
            {copy.emptyStart.sample}
          </Button>
        ) : null}
      </div>
      {importer.message ? <div className="mt-3">{importer.message}</div> : null}
    </div>
  )
}

export function SampleBanner() {
  const { copy } = useLabels()
  const { trades, replaceAll } = useTrades()
  if (!isSampleJournal(trades)) return null

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-primary/30 bg-primary/8 px-3 py-2 text-[12px]">
      <p className="text-foreground/90">{copy.emptyStart.sampleBanner}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-[12px]"
        onClick={() => replaceAll([])}
      >
        {copy.emptyStart.sampleClear}
      </Button>
    </div>
  )
}
