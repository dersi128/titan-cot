"use client"

import { cn } from "@/lib/utils"

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
  size = "md",
  "aria-label": ariaLabel,
}: {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  labels?: Partial<Record<T, string>>
  size?: "sm" | "md"
  "aria-label"?: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-[8px] border border-white/[0.08] bg-black/30 p-0.5",
        size === "sm" ? "h-7" : "h-8"
      )}
    >
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={cn(
              "rounded-[6px] font-medium transition-colors",
              size === "sm"
                ? "h-6 px-2 text-[11px]"
                : "h-7 px-2.5 text-[12px]",
              selected
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {labels?.[option] ?? option}
          </button>
        )
      })}
    </div>
  )
}
