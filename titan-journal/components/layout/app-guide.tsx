"use client"

import Link from "next/link"
import {
  BookOpen,
  Flag,
  LayoutDashboard,
  Layers,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useJournalImport } from "@/components/trades/journal-file-import"
import { useTrades } from "@/components/trades/trades-provider"
import { SUPPORT_EMAIL } from "@/lib/guide-storage"
import type { Copy } from "@/lib/labels"
import { isSampleJournal, MOCK_TRADES, sortTrades } from "@/lib/mock-data"
import { useLabels } from "@/lib/use-labels"

type GuideStep = {
  icon: LucideIcon
  title: string
  lead: string
  points: string[]
}

function reportText(copy: Copy): string {
  if (SUPPORT_EMAIL) return copy.guide.report.replace("{email}", SUPPORT_EMAIL)
  return copy.guide.reportSoon
}

function stepsFor(copy: Copy): GuideStep[] {
  return [
    {
      icon: LayoutDashboard,
      title: copy.guide.welcomeTitle,
      lead: copy.guide.welcomeLead,
      points: [copy.guide.welcome1, copy.guide.welcome2],
    },
    {
      icon: User,
      title: copy.guide.profileTitle,
      lead: copy.guide.profileLead,
      points: [copy.guide.profile1, copy.guide.profile2],
    },
    {
      icon: BookOpen,
      title: copy.guide.playbookTitle,
      lead: copy.guide.playbookLead,
      points: [copy.guide.playbook1, copy.guide.playbook2, copy.guide.playbook3],
    },
    {
      icon: Layers,
      title: copy.guide.accountsTitle,
      lead: copy.guide.accountsLead,
      points: [copy.guide.accounts1, copy.guide.accounts2],
    },
    {
      icon: Shield,
      title: copy.guide.dataTitle,
      lead: copy.guide.dataLead,
      points: [copy.guide.data1, copy.guide.data2, copy.guide.data3],
    },
    {
      icon: Flag,
      title: copy.guide.startTitle,
      lead: copy.guide.startLead,
      points: [],
    },
  ]
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
  const steps = stepsFor(copy)
  const [step, setStep] = useState(0)
  const last = step === steps.length - 1
  const current = steps[step]!
  const Icon = current.icon
  const empty = trades.length === 0 || isSampleJournal(trades)
  const progress = ((step + 1) / steps.length) * 100

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

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titan-guide-title"
        className="titan-glass relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-[14px]"
      >
        <div className="h-1 w-full bg-muted/70">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] text-primary uppercase">
              {copy.guide.beta}
            </span>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {copy.guide.stepOf
                .replace("{current}", String(step + 1))
                .replace("{total}", String(steps.length))}
            </p>
          </div>

          <div key={step} className="mt-5">
            <div className="titan-guide-icon flex size-11 items-center justify-center rounded-[12px] border border-primary/25 bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </div>
            <h2
              id="titan-guide-title"
              className="titan-guide-in mt-4 text-[22px] font-semibold tracking-tight"
            >
              {current.title}
            </h2>
            <p
              className="titan-guide-in mt-2 text-[15px] leading-relaxed text-foreground"
              style={{ animationDelay: "70ms" }}
            >
              {current.lead}
            </p>
            {current.points.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {current.points.map((point, index) => (
                  <li
                    key={point}
                    className="titan-guide-in flex gap-3 rounded-[10px] border border-border/80 bg-elevated/45 px-3.5 py-3"
                    style={{ animationDelay: `${140 + index * 90}ms` }}
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      {point}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}

            {last ? (
              <div
                className="titan-guide-in mt-5 space-y-3"
                style={{ animationDelay: "160ms" }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild>
                    <Link href="/new-trade" onClick={onDismiss}>
                      {copy.emptyStart.cta}
                    </Link>
                  </Button>
                  <Button type="button" variant="outline" className="bg-elevated" onClick={importer.pick}>
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
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-5 py-3 sm:px-7">
          <Button type="button" variant="ghost" onClick={onDismiss}>
            {copy.guide.skip}
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((currentStep) => currentStep - 1)}
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
                onClick={() => setStep((currentStep) => currentStep + 1)}
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
