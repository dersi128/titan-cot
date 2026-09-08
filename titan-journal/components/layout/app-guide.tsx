"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  LayoutDashboard,
  NotebookTabs,
  PlusCircle,
  Sparkles,
  Target,
  Upload,
  User,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import { useJournalImport } from "@/components/trades/journal-file-import"
import type { Copy } from "@/lib/labels"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    id: "welcome",
    href: "/dashboard",
    targets: [],
    icon: Sparkles,
  },
  {
    id: "overview",
    href: "/dashboard",
    targets: ["overview-stats", "range", "overview", "overview-head"],
    icon: LayoutDashboard,
  },
  {
    id: "profile",
    href: "/profile",
    targets: ["profile-risk", "profile-nav"],
    icon: User,
  },
  {
    id: "trade",
    href: "/new-trade",
    targets: ["new-trade-form", "new-trade"],
    icon: PlusCircle,
  },
  {
    id: "import",
    href: "/journal",
    targets: ["import-report"],
    icon: Upload,
  },
  {
    id: "journal",
    href: "/journal",
    targets: ["journal-list", "journal", "journal-nav"],
    icon: BookOpen,
  },
  {
    id: "calendar",
    href: "/calendar",
    targets: ["calendar-board", "calendar"],
    icon: CalendarDays,
  },
  {
    id: "playbook",
    href: "/playbook",
    targets: ["playbook-board", "playbook", "playbook-nav"],
    icon: NotebookTabs,
  },
  {
    id: "analytics",
    href: "/analytics",
    targets: ["analytics-board", "analytics", "analytics-nav"],
    icon: ChartNoAxesCombined,
  },
  {
    id: "edge",
    href: "/analytics",
    targets: [],
    icon: Target,
  },
] as const

type GuideStepId = (typeof STEPS)[number]["id"]

type Spot = { top: number; left: number; width: number; height: number }

function splitFlow(value: string): string[] {
  return value.split("→").map((part) => part.trim()).filter(Boolean)
}

function copyFor(copy: Copy, id: GuideStepId): { title: string; paragraphs: string[] } {
  if (id === "welcome") {
    return {
      title: copy.guide.welcomeTitle,
      paragraphs: [
        copy.guide.welcomeLead,
        copy.guide.welcomeBody,
        copy.guide.welcomeAccounts,
        copy.guide.welcomeGoal,
      ],
    }
  }
  if (id === "overview") {
    return {
      title: copy.guide.overviewTitle,
      paragraphs: [copy.guide.overviewLead, copy.guide.overviewBody],
    }
  }
  if (id === "profile") {
    return {
      title: copy.guide.profileTitle,
      paragraphs: [copy.guide.profileLead, copy.guide.profileBody],
    }
  }
  if (id === "trade") {
    return {
      title: copy.guide.tradeTitle,
      paragraphs: [copy.guide.tradeLead, copy.guide.tradeBody],
    }
  }
  if (id === "import") {
    return {
      title: copy.guide.importTitle,
      paragraphs: [copy.guide.importLead, copy.guide.importBody, copy.guide.importFormats],
    }
  }
  if (id === "journal") {
    return {
      title: copy.guide.journalTitle,
      paragraphs: [copy.guide.journalLead, copy.guide.journalBody],
    }
  }
  if (id === "calendar") {
    return {
      title: copy.guide.calendarTitle,
      paragraphs: [copy.guide.calendarLead, copy.guide.calendarBody],
    }
  }
  if (id === "playbook") {
    return {
      title: copy.guide.playbookTitle,
      paragraphs: [copy.guide.playbookLead, copy.guide.playbookBody],
    }
  }
  if (id === "analytics") {
    return {
      title: copy.guide.analyticsTitle,
      paragraphs: [copy.guide.analyticsLead, copy.guide.analyticsBody],
    }
  }
  return {
    title: copy.guide.edgeTitle,
    paragraphs: [copy.guide.edgeLead, copy.guide.edgeBody],
  }
}

function guideNodes(targets: readonly string[]): HTMLElement[] {
  const nodes: HTMLElement[] = []
  for (const target of targets) {
    document.querySelectorAll(`[data-guide="${target}"]`).forEach((node) => {
      if (!(node instanceof HTMLElement)) return
      if (node.closest("[data-guide-ui]")) return
      if (node.getBoundingClientRect().width <= 8) return
      nodes.push(node)
    })
  }
  return nodes
}

function measureSpot(targets: readonly string[]): Spot | null {
  if (targets.length === 0) return null
  const nodes = guideNodes(targets)
  if (nodes.length === 0) return null
  const pad = 8
  let top = Infinity
  let left = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const node of nodes) {
    const rect = node.getBoundingClientRect()
    if (rect.height <= 8) continue
    top = Math.min(top, rect.top)
    left = Math.min(left, rect.left)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  }
  if (!Number.isFinite(top) || right <= left) return null

  const vh = window.innerHeight
  const vw = window.innerWidth
  const compact = vw < 640
  top = Math.max(8, top - pad)
  left = Math.max(8, left - pad)
  right = Math.min(vw - 8, right + pad)
  bottom = Math.min(vh - 8, bottom + pad)
  const maxBottom = compact ? vh * 0.46 : vh * 0.72
  if (bottom > maxBottom) bottom = Math.max(top + 72, maxBottom)
  return {
    top,
    left,
    width: Math.max(48, right - left),
    height: Math.max(40, bottom - top),
  }
}

function scrollTargetIntoView(targets: readonly string[], behavior: ScrollBehavior) {
  const node = guideNodes(targets)[0]
  if (!node) return
  node.scrollIntoView({ block: "center", inline: "nearest", behavior })
}

function FlowRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-1">
          <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-[11px] font-medium text-foreground">
            {item}
          </span>
          {index < items.length - 1 ? (
            <span className="text-[11px] text-muted-foreground" aria-hidden>
              →
            </span>
          ) : null}
        </span>
      ))}
    </div>
  )
}

function GuideMiniVisual({
  step,
  copy,
  chips,
}: {
  step: GuideStepId
  copy: Copy
  chips: string[]
}) {
  if (step === "welcome") return <FlowRow items={splitFlow(copy.guide.welcomeFlow)} />
  if (step === "overview") {
    return (
      <div className="flex flex-wrap justify-end gap-1">
        {chips.map((label, index) => (
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
    )
  }
  if (step === "trade") return <FlowRow items={splitFlow(copy.guide.tradeFlow)} />
  if (step === "calendar") {
    const tones = [
      "bg-bull/45",
      "bg-muted/70",
      "bg-bear/45",
      "bg-bull/35",
      "bg-muted/70",
      "bg-bear/40",
      "bg-bull/50",
    ]
    return (
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: 14 }, (_, index) => (
          <span
            key={index}
            className={cn("h-4 rounded-[4px]", tones[index % tones.length])}
          />
        ))}
      </div>
    )
  }
  if (step === "edge") return <FlowRow items={splitFlow(copy.guide.edgeLoop)} />
  return null
}

function placePanel(
  spot: Spot | null,
  panel: { width: number; height: number },
  vw: number,
  vh: number
): CSSProperties {
  const gap = 12
  const width = Math.min(panel.width, vw - 24)
  const height = Math.min(panel.height, vh * 0.52)

  if (vw < 640) {
    return { left: 12, right: 12, bottom: 12, maxWidth: "none" }
  }

  if (!spot) {
    return { right: 24, bottom: 24, width }
  }

  const below = vh - (spot.top + spot.height) - gap
  const above = spot.top - gap
  const room = Math.min(height, 240)
  const clampLeft = (value: number) =>
    Math.max(12, Math.min(value, vw - width - 12))

  if (below >= room) {
    return {
      top: spot.top + spot.height + gap,
      left: clampLeft(spot.left),
      width,
    }
  }
  if (above >= room) {
    return {
      top: Math.max(12, spot.top - height - gap),
      left: clampLeft(spot.left),
      width,
    }
  }
  if (vw - (spot.left + spot.width) - gap >= width + 8) {
    return {
      top: Math.max(12, Math.min(spot.top, vh - height - 12)),
      left: spot.left + spot.width + gap,
      width,
    }
  }
  if (spot.left - gap >= width + 8) {
    return {
      top: Math.max(12, Math.min(spot.top, vh - height - 12)),
      left: Math.max(12, spot.left - width - gap),
      width,
    }
  }
  return { right: 24, bottom: 24, width }
}

function isGuideUi(target: EventTarget | null): boolean {
  if (!(target instanceof Node)) return false
  const el = target instanceof Element ? target : target.parentElement
  return Boolean(el?.closest("[data-guide-ui]"))
}

export function AppGuide({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  const { copy, DATE_RANGE_LABELS } = useLabels()
  const importer = useJournalImport()
  const router = useRouter()
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [spot, setSpot] = useState<Spot | null>(null)
  const [panelSize, setPanelSize] = useState({ width: 448, height: 320 })
  const current = STEPS[step] ?? STEPS[0]
  const text = copyFor(copy, current.id)
  const Icon: LucideIcon = current.icon
  const last = step === STEPS.length - 1
  const first = step === 0
  const progress = ((step + 1) / STEPS.length) * 100
  const ready = pathname === current.href
  const rangeChips = ["30D", "3M", "6M", "YTD", "ALL"].map(
    (key) => DATE_RANGE_LABELS[key as "30D" | "3M" | "6M" | "YTD" | "ALL"]
  )
  const panelStyle = placePanel(
    spot,
    panelSize,
    typeof window === "undefined" ? 1200 : window.innerWidth,
    typeof window === "undefined" ? 800 : window.innerHeight
  )

  useEffect(() => {
    if (open) {
      setStep(0)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (pathname !== current.href) router.push(current.href)
  }, [open, current.href, pathname, router])

  useEffect(() => {
    if (!open) {
      setSpot(null)
      return
    }
    if (!ready) return

    let cancelled = false
    const measure = () => {
      if (cancelled) return
      setSpot(measureSpot(current.targets))
    }
    scrollTargetIntoView(current.targets, "smooth")
    measure()
    const firstTimer = window.setTimeout(() => {
      scrollTargetIntoView(current.targets, "auto")
      measure()
    }, 380)
    const secondTimer = window.setTimeout(measure, 900)
    window.addEventListener("resize", measure)
    window.addEventListener("scroll", measure, true)
    return () => {
      cancelled = true
      window.clearTimeout(firstTimer)
      window.clearTimeout(secondTimer)
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", measure, true)
    }
  }, [open, step, ready, current.targets])

  useEffect(() => {
    if (!open) return

    const block = (event: Event) => {
      if (isGuideUi(event.target)) return
      event.preventDefault()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss()
        return
      }
      if (
        ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(
          event.key
        ) &&
        !isGuideUi(event.target)
      ) {
        event.preventDefault()
      }
    }
    const keep = () => {
      const node = guideNodes(current.targets)[0]
      if (!node) return
      const rect = node.getBoundingClientRect()
      const margin = 28
      if (rect.top < margin || rect.bottom > window.innerHeight - margin) {
        node.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" })
      }
    }

    window.addEventListener("wheel", block, { passive: false, capture: true })
    window.addEventListener("touchmove", block, { passive: false, capture: true })
    window.addEventListener("keydown", onKey, true)
    window.addEventListener("scroll", keep, true)
    return () => {
      window.removeEventListener("wheel", block, true)
      window.removeEventListener("touchmove", block, true)
      window.removeEventListener("keydown", onKey, true)
      window.removeEventListener("scroll", keep, true)
    }
  }, [open, current.targets, onDismiss])

  useLayoutEffect(() => {
    const node = panelRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const rect = node.getBoundingClientRect()
      setPanelSize({
        width: Math.max(280, rect.width),
        height: Math.max(180, rect.height),
      })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [open, step, text.title])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80]">
      {spot ? (
        <div
          className="titan-guide-spot pointer-events-none fixed"
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
        ref={panelRef}
        data-guide-ui="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titan-guide-title"
        style={panelStyle}
        className="titan-glass pointer-events-auto absolute z-10 flex max-h-[min(52vh,560px)] w-auto flex-col overflow-hidden rounded-[14px] sm:max-h-[min(72vh,640px)] sm:max-w-md"
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
            <div className="mt-1.5 space-y-2">
              {text.paragraphs.map((paragraph, index) => (
                <p
                  key={`${current.id}-${index}`}
                  className="titan-guide-in text-[13px] leading-relaxed text-foreground"
                  style={{ animationDelay: `${60 + index * 40}ms` }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="titan-guide-in mt-3" style={{ animationDelay: "140ms" }}>
              <GuideMiniVisual step={current.id} copy={copy} chips={rangeChips} />
            </div>

            {last ? (
              <div className="titan-guide-in mt-4 space-y-3" style={{ animationDelay: "160ms" }}>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm">
                    <Link href="/new-trade" onClick={onDismiss}>
                      {copy.emptyStart.cta}
                    </Link>
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={importer.pick}>
                    {copy.journal.importReport}
                  </Button>
                  {importer.fileInput}
                </div>
                {importer.message ? <div>{importer.message}</div> : null}
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
                {first ? copy.guide.start : copy.guide.next}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
