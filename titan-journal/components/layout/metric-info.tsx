"use client"

import { Popover as PopoverPrimitive } from "radix-ui"

import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

export function MetricInfo({
  label,
  text,
}: {
  label: string
  text: string
}) {
  const { copy } = useLabels()

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger
        type="button"
        aria-label={copy.dashboard.metricInfo.replace("{metric}", label)}
        onClick={(event) => event.stopPropagation()}
        className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 text-[10px] font-semibold leading-none text-muted-foreground outline-none hover:border-foreground/30 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/60 after:absolute after:-inset-2"
      >
        i
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            "z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-md border border-border bg-elevated px-3 py-2 text-[12px] leading-relaxed text-foreground shadow-[0_10px_28px_color-mix(in_srgb,var(--background)_50%,transparent)] outline-none"
          )}
        >
          {text}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export function MetricLabel({
  label,
  why,
  className,
}: {
  label: string
  why?: string
  className?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {label}
      {why ? <MetricInfo label={label} text={why} /> : null}
    </span>
  )
}
