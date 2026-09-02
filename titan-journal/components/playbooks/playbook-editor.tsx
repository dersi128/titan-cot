"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Field } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { copy } from "@/lib/labels"
import {
  emptyField,
  emptyPlaybook,
  moveField,
  PLAYBOOK_COLORS,
  sortedFields,
} from "@/lib/playbooks"
import { PLAYBOOK_FIELD_TYPES, type Playbook, type PlaybookFieldType } from "@/types/playbook"

export function PlaybookEditor({ playbook }: { playbook?: Playbook }) {
  const router = useRouter()
  const { savePlaybook } = useWorkspace()
  const [draft, setDraft] = useState<Playbook>(
    () => playbook ?? emptyPlaybook()
  )
  const [error, setError] = useState<string | null>(null)

  function updateField(id: string, patch: Partial<Playbook["fields"][number]>) {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.id === id ? { ...field, ...patch } : field
      ),
    }))
  }

  function handleSave() {
    if (!draft.name.trim()) {
      setError(copy.playbook.nameRequired)
      return
    }
    const saved = savePlaybook({
      ...draft,
      name: draft.name.trim(),
      fields: sortedFields(draft).filter((field) => field.name.trim()),
    })
    router.push(`/playbook/${saved.id}`)
  }

  const fields = sortedFields(draft)

  return (
    <PageFrame width="narrow">
      <PageHeader
        title={playbook ? draft.name || copy.playbook.title : copy.playbook.new}
        actions={
          <Button variant="outline" asChild>
            <Link href="/playbook">{copy.nav.playbook}</Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="titan-glass rounded-[10px] p-4 space-y-3">
          <Field label={copy.playbook.name}>
            <Input
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
          <Field label={copy.playbook.descriptionLabel}>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={copy.playbook.icon}>
              <Input
                maxLength={2}
                placeholder="↗"
                value={draft.icon ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    icon: event.target.value.slice(0, 2) || null,
                  }))
                }
              />
            </Field>
            <Field label={copy.playbook.color}>
              <div className="flex flex-wrap gap-2">
                {PLAYBOOK_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        color: current.color === color ? null : color,
                      }))
                    }
                    className="size-7 rounded-full border border-border"
                    style={{
                      background: color,
                      outline:
                        draft.color === color
                          ? "2px solid var(--primary)"
                          : undefined,
                      outlineOffset: 2,
                    }}
                  />
                ))}
              </div>
            </Field>
          </div>
        </div>

        <div className="titan-glass rounded-[10px] p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{copy.playbook.fields}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  fields: [...current.fields, emptyField(current.fields.length)],
                }))
              }
            >
              {copy.playbook.addField}
            </Button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border border-border px-3 py-3 space-y-2"
            >
              <Field label={copy.playbook.fieldName}>
                <Input
                  value={field.name}
                  onChange={(event) =>
                    updateField(field.id, { name: event.target.value })
                  }
                />
              </Field>
              <Field label={copy.playbook.fieldType}>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={field.type}
                  onChange={(event) =>
                    updateField(field.id, {
                      type: event.target.value as PlaybookFieldType,
                    })
                  }
                >
                  {PLAYBOOK_FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {copy.playbook.types[type]}
                    </option>
                  ))}
                </select>
              </Field>
              {field.type === "select" || field.type === "multi_select" ? (
                <Field
                  label={copy.playbook.options}
                  hint={copy.playbook.optionsHint}
                >
                  <Textarea
                    rows={3}
                    value={field.options.join("\n")}
                    onChange={(event) =>
                      updateField(field.id, {
                        options: event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      fields: moveField(current.fields, field.id, -1),
                    }))
                  }
                >
                  {copy.playbook.moveUp}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={index === fields.length - 1}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      fields: moveField(current.fields, field.id, 1),
                    }))
                  }
                >
                  {copy.playbook.moveDown}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      fields: current.fields.filter((item) => item.id !== field.id),
                    }))
                  }
                >
                  {copy.playbook.removeField}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="button" onClick={handleSave}>
          {copy.playbook.save}
        </Button>
      </div>
    </PageFrame>
  )
}
