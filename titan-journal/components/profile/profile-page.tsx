"use client"

import { useState } from "react"

import { Field } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { copy } from "@/lib/labels"

export function ProfilePage() {
  const { profile, updateProfile } = useWorkspace()
  const [draft, setDraft] = useState(profile)

  return (
    <PageFrame width="narrow">
      <PageHeader
        title={copy.profile.title}
        description={copy.profile.description}
      />
      <div className="titan-glass space-y-3 rounded-[10px] p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted text-lg font-semibold">
          {draft.displayName.slice(0, 1).toUpperCase() || "T"}
        </div>
        <p className="text-[12px] text-muted-foreground">
          {copy.profile.avatarPlaceholder}
        </p>
        <Field label={copy.profile.displayName}>
          <Input
            value={draft.displayName}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
          />
        </Field>
        <Field label={copy.profile.traderType}>
          <Input
            placeholder="Swing trader"
            value={draft.traderType}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                traderType: event.target.value,
              }))
            }
          />
        </Field>
        <Field label={copy.profile.bio}>
          <Textarea
            rows={3}
            value={draft.bio}
            onChange={(event) =>
              setDraft((current) => ({ ...current, bio: event.target.value }))
            }
          />
        </Field>
        <Button type="button" onClick={() => updateProfile(draft)}>
          {copy.profile.save}
        </Button>
      </div>
    </PageFrame>
  )
}
