import { signedClassName, formatSignedR } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ResultR({ value }: { value: number | null | undefined }) {
  return (
    <span className={cn("font-mono tabular-nums", signedClassName(value))}>
      {formatSignedR(value)}
    </span>
  )
}
