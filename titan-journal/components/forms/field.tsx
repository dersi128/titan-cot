import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label className="text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function pillClass(selected: boolean) {
  return cn(
    "h-[length:var(--ui-control)] rounded-[8px] border px-2.5 text-[12px] font-medium transition-colors",
    selected
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
  )
}

export function OptionPills<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T | null
  options: readonly T[]
  labels?: Partial<Record<T, string>>
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={pillClass(selected)}
          >
            {labels?.[option] ?? option}
          </button>
        )
      })}
    </div>
  )
}

export function MultiPills<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: readonly T[]
  options: readonly T[]
  labels?: Partial<Record<T, string>>
  onChange: (value: T[]) => void
}) {
  function toggle(option: T) {
    const next = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option]
    onChange(options.filter((item) => next.includes(item)))
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          aria-pressed={value.includes(option)}
          className={pillClass(value.includes(option))}
        >
          {labels?.[option] ?? option}
        </button>
      ))}
    </div>
  )
}
