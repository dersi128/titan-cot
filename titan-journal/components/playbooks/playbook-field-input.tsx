"use client"

import { Field, OptionPills } from "@/components/forms/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useLabels } from "@/lib/use-labels"
import type { PlaybookField, TradeFieldValue } from "@/types/playbook"

function asString(value: TradeFieldValue["value"]): string {
  if (value == null) return ""
  if (Array.isArray(value)) return value.join("\n")
  return String(value)
}

function asBool(value: TradeFieldValue["value"]): boolean | null {
  if (value === true || value === "Yes") return true
  if (value === false || value === "No") return false
  return null
}

function asList(value: TradeFieldValue["value"]): string[] {
  return Array.isArray(value)
    ? value
    : typeof value === "string" && value
      ? [value]
      : []
}

export function PlaybookFieldInput({
  field,
  value,
  onChange,
}: {
  field: PlaybookField
  value: TradeFieldValue["value"]
  onChange: (value: TradeFieldValue["value"]) => void
}) {
  const { YES_NO_LABELS } = useLabels()
  if (field.type === "yes_no") {
    const selected = asBool(value)
    return (
      <Field label={field.name}>
        <OptionPills
          value={selected == null ? null : selected ? "YES" : "NO"}
          options={["YES", "NO"] as const}
          labels={YES_NO_LABELS}
          onChange={(next) => onChange(next === "YES")}
        />
      </Field>
    )
  }

  if (field.type === "select") {
    return (
      <Field label={field.name}>
        <OptionPills
          value={typeof value === "string" && value ? value : null}
          options={field.options}
          onChange={onChange}
        />
      </Field>
    )
  }

  if (field.type === "multi_select") {
    const selected = asList(value)
    return (
      <Field label={field.name}>
        <div className="flex flex-wrap gap-1">
          {field.options.map((option) => {
            const on = selected.includes(option)
            return (
              <button
                key={option}
                type="button"
                className={`h-6 rounded-md border px-2 text-[11px] ${
                  on
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
                onClick={() =>
                  onChange(
                    on
                      ? selected.filter((item) => item !== option)
                      : [...selected, option]
                  )
                }
              >
                {option}
              </button>
            )
          })}
        </div>
      </Field>
    )
  }

  if (field.type === "number") {
    return (
      <Field label={field.name}>
        <Input
          type="number"
          value={asString(value)}
          onChange={(event) => {
            const next = event.target.value
            onChange(next === "" ? null : Number(next))
          }}
        />
      </Field>
    )
  }

  return (
    <Field label={field.name}>
      {field.name.length > 24 ? (
        <Textarea
          rows={2}
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          value={asString(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  )
}
