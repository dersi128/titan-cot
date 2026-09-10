"use client"

import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"
import {
  datePlaceholder,
  formatIsoDisplay,
  parseDateInput,
} from "@/lib/date-input"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"

export function DateField({
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  value: string
  onChange: (iso: string) => void
  className?: string
  "aria-label"?: string
}) {
  const { language, copy } = useLabels()
  const [text, setText] = useState(() => formatIsoDisplay(value, language))

  useEffect(() => {
    setText(formatIsoDisplay(value, language))
  }, [value, language])

  function commit(raw: string) {
    const iso = parseDateInput(raw, language)
    if (iso == null) {
      setText(formatIsoDisplay(value, language))
      return
    }
    onChange(iso)
    setText(formatIsoDisplay(iso, language))
  }

  return (
    <div className="relative">
      <Input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={text}
        placeholder={datePlaceholder(language)}
        aria-label={ariaLabel ?? copy.form.date}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => commit(text)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            commit(text)
          }
        }}
        className={cn("pr-10", className)}
      />
      <CalendarDays
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="date"
        value={value}
        aria-label={copy.form.pickDate}
        className="absolute inset-y-0 right-0 w-10 cursor-pointer opacity-0"
        onChange={(event) => {
          onChange(event.target.value)
          setText(formatIsoDisplay(event.target.value, language))
        }}
      />
    </div>
  )
}
