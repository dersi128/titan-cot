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
      <Label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function OptionPills<T extends string>({
  value,
  options,
  labels,
  onChange,
}: {
  value: T
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
            className={cn(
              "h-8 rounded-lg border px-2.5 text-[12px] font-semibold transition-colors",
              selected
                ? "border-[rgba(46,168,255,0.5)] bg-[rgba(46,168,255,0.12)] text-[#7dd3fc]"
                : "border-white/10 text-stone-400 hover:border-[rgba(46,168,255,0.3)] hover:text-stone-200"
            )}
          >
            {labels?.[option] ?? option}
          </button>
        )
      })}
    </div>
  )
}
