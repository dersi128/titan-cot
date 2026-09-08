"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  ChartNoAxesCombined,
  LayoutDashboard,
  NotebookTabs,
  PlusCircle,
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
import { cn } from "@/lib/utils"

const STEPS = [
  {
    id: "overview",
    href: "/dashboard",
    targets: ["range", "overview", "equity", "overview-head", "overview-nav"],
    icon: LayoutDashboard,
  },
  {
    id: "profile",
    href: "/profile",
    targets: ["profile-risk", "accounts", "profile-nav"],
    icon: User,
  },
  {
    id: "trade",
    href: "/new-trade",
    targets: ["new-trade-form", "new-trade"],
    icon: PlusCircle,
  },
  {
    id: "journal",
    href: "/journal",
    targets: ["journal", "journal-nav", "calendar"],
    icon: BookOpen,
  },
  {
    id: "playbook",
    href: "/playbook",
    targets: ["playbook", "playbook-nav"],
    icon: NotebookTabs,
  },
  {
    id: "analytics",
    href: "/analytics",
    targets: ["analytics", "analytics-nav"],
    icon: ChartNoAxesCombined,
  },
] as const

type GuideStepId = (typeof STEPS)[number]["id"]

type Spot = { top: number; left: number; width: number; height: number }

function reportText(copy: Copy): string {
  if (SUPPORT_EMAIL) return copy.guide.report.replace("{email}", SUPPORT_EMAIL)
  return copy.guide.reportSoon
}

function copyFor(
  copy: Copy,
  id: GuideStepId
): { title: string; lead: string; meaning: string } {
  if (id === "overview") {
    return {
      title: copy.guide.overviewTitle,
      lead: copy.guide.overviewLead,
      meaning: copy.guide.overviewMeaning,
    }
  }
  if (id === "profile") {
    return {
      title: copy.guide.profileTitle,
      lead: copy.guide.profileLead,
      meaning: copy.guide.profileMeaning,
    }
  }
  if (id === "trade") {
    return {
      title: copy.guide.tradeTitle,
      lead: copy.guide.tradeLead,
      meaning: copy.guide.tradeMeaning,
    }
  }
  if (id === "journal") {
    return {
      title: copy.guide.journalTitle,
      lead: copy.guide.journalLead,
      meaning: copy.guide.journalMeaning,
    }
  }
  if (id === "playbook") {
    return {
      title: copy.guide.playbookTitle,
      lead: copy.guide.playbookLead,
      meaning: copy.guide.playbookMeaning,
    }
  }
  return {
    title: copy.guide.analyticsTitle,
    lead: copy.guide.analyticsLead,
    meaning: copy.guide.analyticsMeaning,
  }
}

function measureSpot(targets: readonly string[]): Spot | null {
  for (const target of targets) {
    const nodes = document.querySelectorAll(`[data-guide="${target}"]`)
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue
      if (node.closest("[data-guide-ui]")) continue
      const rect = node.getBoundingClientRect()
      if (rect.width <= 8 || rect.height <= 8) continue
      const pad = 8
      const width = Math.min(rect.width + pad * 2, window.innerWidth - 16)
      const height = Math.min(rect.height + pad * 2, window.innerHeight * 0.42)
      const left = Math.max(8, Math.min(rect.left - pad, window.innerWidth - width - 8))
      const top = Math.max(8, Math.min(rect.top - pad, window.innerHeight - height - 8))
      return { top, left, width, height }
    }
  }
  return null
}

function GuideMiniVisual({ step }: { step: GuideStepId }) {
  if (step === "overview") {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        <div className="col-span-4 flex justify-end gap-1">
          {["30D", "3M", "ALL"].map((label, index) => (
            <span
              key={label}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[9px] font-semibold",
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
        {["WR", "P&L", "R", "PF"].map((label) => (
          <div key={label} className="rounded-lg bg-muted/60 px-1 py-2 text-center">
            <div className="mx-auto h-7 w-7 rounded-full border border-primary/40" />
            <p className="mt-1 text-[9px] font-semibold text-muted-foreground">{label}</p>
          </div>
        ))}
        <div className="col-span-4 h-9 rounded-lg bg-muted/60 px-2 py-1.5">
          <svg viewBox="0 0 100 24" className="h-full w-full" aria-hidden>
            <polyline
              fill="none"
              stroke="var(--color-bull)"
              strokeWidth="2"
              points="0,18 18,16 36,17 54,10 72,12 100,4"
            />
          </svg>
        </div>
      </div>
    )
  }
  if (step === "profile") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {["Personal", "Prop", "BT"].map((label, index) => (
          <span
            key={label}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium",
              index === 0
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {label}
          </span>
        ))}
        <div className="mt-1 grid w-full grid-cols-2 gap-1.5">
          <div className="rounded-lg bg-muted/60 px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground">1R</p>
            <p className="font-mono text-[12px]">2 %</p>
          </div>
          <div className="rounded-lg bg-muted/60 px-2 py-1.5">
            <p className="text-[9px] text-muted-foreground">Cap</p>
            <p className="font-mono text-[12px]">10k</p>
          </div>
        </div>
      </div>
    )
  }
  if (step === "trade") {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg border border-primary/35 bg-primary/10 px-2 py-2 text-[11px] font-medium">
          Manual
        </div>
        <div className="rounded-lg bg-muted/60 px-2 py-2 text-[11px] font-medium text-muted-foreground">
          Import
        </div>
        <div className="col-span-2 h-8 rounded-lg bg-muted/60" />
      </div>
    )
  }
  if (step === "journal") {
    return (
      <div className="space-y-1.5">
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "h-4 rounded-[4px]",
                index === 8
                  ? "bg-bull/40"
                  : index === 10
                    ? "bg-bear/40"
                    : "bg-muted/70"
              )}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {["Note", "Emotion", "Plan"].map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (step === "playbook") {
    return (
      <div className="rounded-lg border border-border bg-muted/50 px-3 py-2">
        <p className="text-[12px] font-semibold">Setup A</p>
        <p className="mt-1 text-[10px] text-muted-foreground">Rule → trade → edge</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-bull" />
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      {[72, 48, 28].map((width) => (
        <div key={width} className="flex items-center gap-2">
          <span className="w-10 text-[10px] text-muted-foreground">Edge</span>
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${width}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
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
  const router = useRouter()
  const pathname = usePathname()
  const [step, setStep] = useState(0)
  const [meaningOpen, setMeaningOpen] = useState(false)
  const [spot, setSpot] = useState<Spot | null>(null)
  const current = STEPS[step] ?? STEPS[0]
  const text = copyFor(copy, current.id)
  const Icon: LucideIcon = current.icon
  const last = step === STEPS.length - 1
  const empty = trades.length === 0 || isSampleJournal(trades)
  const progress = ((step + 1) / STEPS.length) * 100

  useEffect(() => {
    if (open) {
      setStep(0)
      setMeaningOpen(false)
    }
  }, [open])

  useEffect(() => {
    setMeaningOpen(false)
  }, [step])

  useEffect(() => {
    if (!open) return
    if (pathname !== current.href) router.push(current.href)
  }, [open, current.href, pathname, router])

  useEffect(() => {
    if (!open) {
      setSpot(null)
      return
    }
    let cancelled = false
    const scrollTarget = () => {
      for (const target of current.targets) {
        const nodes = document.querySelectorAll(`[data-guide="${target}"]`)
        for (const node of nodes) {
          if (!(node instanceof HTMLElement) || node.closest("[data-guide-ui]")) continue
          if (node.getBoundingClientRect().width <= 8) continue
          node.scrollIntoView({ block: "center", inline: "nearest" })
          return
        }
      }
    }
    const measure = () => {
      if (cancelled) return
      setSpot(measureSpot(current.targets))
    }
    scrollTarget()
    measure()
    const first = window.setTimeout(measure, 380)
    const second = window.setTimeout(measure, 800)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      cancelled = true
      window.clearTimeout(first)
      window.clearTimeout(second)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [open, step, pathname, current.targets])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onDismiss])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      {spot ? (
        <div
          className="titan-guide-spot pointer-events-none absolute"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
          }}
        >
          <div className="titan-guide-spot-ring absolute inset-0" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-black/55" />
      )}
      <div className="absolute inset-0" />

      <div
        data-guide-ui="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titan-guide-title"
        className="titan-glass pointer-events-auto absolute inset-x-3 bottom-3 z-10 flex max-h-[min(52vh,560px)] w-auto flex-col overflow-hidden rounded-[14px] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-h-[min(72vh,640px)] sm:w-full sm:max-w-md"
      >
        <div className="h-1 w-full bg-muted/70">
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] text-primary uppercase">
              {copy.guide.beta}
            </span>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {copy.guide.stepOf
                .replace("{current}", String(step + 1))
                .replace("{total}", String(STEPS.length))}
            </p>
          </div>

          <div key={current.id} className="mt-3">
            <div className="titan-guide-icon flex size-9 items-center justify-center rounded-[10px] border border-primary/25 bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </div>
            <h2
              id="titan-guide-title"
              className="titan-guide-in mt-3 text-[18px] font-semibold tracking-tight"
            >
              {text.title}
            </h2>
            <p
              className="titan-guide-in mt-1.5 text-[13px] leading-relaxed text-foreground"
              style={{ animationDelay: "60ms" }}
            >
              {text.lead}
            </p>
            <div className="titan-guide-in mt-3" style={{ animationDelay: "110ms" }}>
              <GuideMiniVisual step={current.id} />
            </div>
            <button
              type="button"
              className="titan-guide-in mt-3 text-left text-[12px] font-medium text-primary"
              style={{ animationDelay: "140ms" }}
              aria-expanded={meaningOpen}
              onClick={() => setMeaningOpen((openMeaning) => !openMeaning)}
            >
              {copy.guide.meaning}
            </button>
            {meaningOpen ? (
              <p className="titan-guide-in mt-2 rounded-[10px] border border-border/80 bg-elevated/70 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
                {text.meaning}
              </p>
            ) : null}

            {last ? (
              <div className="titan-guide-in mt-4 space-y-3" style={{ animationDelay: "160ms" }}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm">
                    <Link href="/new-trade" onClick={onDismiss}>
                      {copy.emptyStart.cta}
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={importer.pick}
                  >
                    {copy.journal.importReport}
                  </Button>
                  {importer.fileInput}
                  {empty ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
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
                  {copy.guide.sampleSafe}
                </p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  {reportText(copy)}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-4 py-2.5 sm:px-5">
          <Button type="button" variant="ghost" size="sm" onClick={onDismiss}>
            {copy.guide.skip}
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((currentStep) => currentStep - 1)}
              >
                {copy.guide.back}
              </Button>
            ) : null}
            {last ? (
              <Button type="button" size="sm" onClick={onDismiss}>
                {copy.guide.done}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
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
