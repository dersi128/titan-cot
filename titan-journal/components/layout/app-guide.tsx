"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useJournalImport } from "@/components/trades/journal-file-import"
import { useTrades } from "@/components/trades/trades-provider"
import { SUPPORT_EMAIL } from "@/lib/guide-storage"
import { isSampleJournal, MOCK_TRADES, sortTrades } from "@/lib/mock-data"
import { useLabels } from "@/lib/use-labels"
import type { Copy } from "@/lib/labels"

const STEP_COUNT = 4

function reportText(copy: Copy): string {
  if (SUPPORT_EMAIL) return copy.guide.report.replace("{email}", SUPPORT_EMAIL)
  return copy.guide.reportSoon
}

export function AppGuide({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  const { copy } = useLabels()
  const { trades, replaceAll } = useTrades()
  const importer = useJournalImport()
  const [step, setStep] = useState(0)
  const last = step === STEP_COUNT - 1
  const empty = trades.length === 0 || isSampleJournal(trades)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [open, onDismiss])

  if (!open) return null

  const titles = [
    copy.guide.welcomeTitle,
    copy.guide.profileTitle,
    copy.guide.dataTitle,
    copy.guide.startTitle,
  ]
  const bodies = [
    copy.guide.welcomeBody,
    copy.guide.profileBody,
    copy.guide.dataBody,
    copy.guide.playbookBody,
  ]

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titan-guide-title"
        className="titan-glass relative z-10 w-full max-w-lg rounded-[12px] px-5 py-5 sm:px-6"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary uppercase">
            {copy.guide.beta}
          </span>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            {copy.guide.stepOf
              .replace("{current}", String(step + 1))
              .replace("{total}", String(STEP_COUNT))}
          </p>
        </div>

        <h2
          id="titan-guide-title"
          className="mt-3 text-[20px] font-semibold tracking-tight"
        >
          {titles[step]}
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {bodies[step]}
        </p>
        {step === 2 ? (
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
            {copy.guide.dataDevices}
          </p>
        ) : null}

        {last ? (
          <div className="mt-4 space-y-3">
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {copy.guide.startBody}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild>
                <Link href="/new-trade" onClick={onDismiss}>
                  {copy.emptyStart.cta}
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={importer.pick}>
                {copy.journal.importReport}
              </Button>
              {importer.fileInput}
              {empty ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    replaceAll(sortTrades(MOCK_TRADES))
                    onDismiss()
                  }}
                >
                  {copy.emptyStart.sample}
                </Button>
              ) : null}
            </div>
            {importer.message ? <div>{importer.message}</div> : null}
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {reportText(copy)}
            </p>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={onDismiss}>
            {copy.guide.skip}
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((current) => current - 1)}
              >
                {copy.guide.back}
              </Button>
            ) : null}
            {last ? (
              <Button type="button" onClick={onDismiss}>
                {copy.guide.done}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setStep((current) => current + 1)}
              >
                {copy.guide.next}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
