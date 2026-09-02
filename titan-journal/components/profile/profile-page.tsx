"use client"

import { useEffect, useState } from "react"

import { Field, MultiPills } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { AvatarBubble } from "@/components/profile/avatar-bubble"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { readAvatarFile } from "@/lib/avatar"
import { ACCOUNT_LABELS, copy } from "@/lib/labels"
import { ACCOUNTS } from "@/types/trade"
import { TRADING_MARKETS, type UserProfile } from "@/types/playbook"

export function ProfilePage() {
  const { profile, preferences, updateProfile, updatePreferences } = useWorkspace()
  const [draft, setDraft] = useState<UserProfile>(profile)

  useEffect(() => {
    setDraft(profile)
  }, [profile])

  function save() {
    const riskPercent =
      Number.isFinite(draft.riskPercent) && draft.riskPercent >= 0
        ? draft.riskPercent
        : 1
    const next = { ...draft, riskPercent }
    updateProfile(next)
    if (preferences.defaultRisk !== riskPercent) {
      updatePreferences({ defaultRisk: riskPercent })
    }
  }

  async function handleAvatar(file: File | undefined) {
    if (!file) return
    const data = await readAvatarFile(file)
    if (!data) return
    setDraft((current) => ({ ...current, avatar: data }))
  }

  return (
    <PageFrame width="narrow">
      <PageHeader
        title={copy.profile.title}
        description={copy.profile.description}
      />
      <div className="space-y-4">
        <div className="titan-glass space-y-3 rounded-[10px] p-4">
          <div className="flex items-center gap-3">
            <AvatarBubble name={draft.displayName} src={draft.avatar} />
            <div className="min-w-0 space-y-2">
              <Field label={copy.profile.avatar} hint={copy.profile.avatarHint}>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleAvatar(event.target.files?.[0])}
                />
              </Field>
              {draft.avatar ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDraft((current) => ({ ...current, avatar: null }))
                  }
                >
                  {copy.profile.removeAvatar}
                </Button>
              ) : null}
            </div>
          </div>
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
        </div>

        <div className="titan-glass space-y-3 rounded-[10px] p-4">
          <h2 className="text-sm font-semibold">{copy.profile.trading}</h2>
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
            {copy.profile.capital}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {ACCOUNTS.map((account) => (
              <Field key={account} label={ACCOUNT_LABELS[account]}>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={draft.capital[account]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      capital: {
                        ...current.capital,
                        [account]: Number(event.target.value) || 0,
                      },
                    }))
                  }
                />
              </Field>
            ))}
          </div>
          <Field label={copy.profile.riskPercent}>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={draft.riskPercent}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  riskPercent: Number(event.target.value) || 0,
                }))
              }
            />
          </Field>
          <Field label={copy.profile.markets}>
            <MultiPills
              value={draft.markets}
              options={TRADING_MARKETS}
              onChange={(markets) =>
                setDraft((current) => ({ ...current, markets }))
              }
            />
          </Field>
        </div>

        <Button type="button" onClick={save}>
          {copy.profile.save}
        </Button>
      </div>
    </PageFrame>
  )
}
