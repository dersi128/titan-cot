"use client"

import { cn } from "@/lib/utils"

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  labels,
  size = "md",
  tone = "plain",
  "aria-label": ariaLabel,
}: {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  labels?: Partial<Record<T, string>>
  size?: "sm" | "md"
  tone?: "plain" | "strong"
  "aria-label"?: string
}) {
  const strong = tone === "strong"

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-auto w-max max-w-full items-center rounded-[8px] border p-0.5",
        size === "sm" ? "min-h-7" : "min-h-8",
        strong
          ? "titan-seg border-primary/45 bg-elevated"
          : "border-border bg-muted/50"
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
              "shrink-0 rounded-[6px] font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-200",
              size === "sm"
                ? "h-6 px-2 text-[11px]"
                : strong
                  ? "h-8 px-3 text-[12px]"
                  : "h-7 px-2.5 text-[12px]",
              selected
                ? strong
                  ? "bg-primary text-primary-foreground shadow-[0_0_14px_color-mix(in_srgb,var(--primary)_40%,transparent)]"
                  : "bg-primary/15 text-foreground shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                : strong
                  ? "text-foreground/80 hover:bg-primary/10 hover:text-foreground"
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
