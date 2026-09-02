"use client"

import { Field, OptionPills } from "@/components/forms/field"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { SelectField } from "@/components/forms/select-field"
import { Input } from "@/components/ui/input"
import { copy } from "@/lib/labels"
import { ACCOUNTS } from "@/types/trade"
import type { Density, JournalMode, ThemeId } from "@/types/playbook"

export function SettingsPage() {
  const { preferences, updatePreferences, playbooks } = useWorkspace()
  const playbookOptions = playbooks

  return (
    <PageFrame width="narrow">
      <PageHeader
        title={copy.settings.title}
        description={copy.settings.description}
      />

      <div className="space-y-4">
        <section className="titan-glass rounded-[10px] p-4 space-y-3">
          <h2 className="text-sm font-semibold">{copy.settings.journal}</h2>
          <Field label={copy.settings.journalMode}>
            <OptionPills
              value={preferences.journalMode}
              options={["simple", "advanced"] as const}
              labels={{
                simple: copy.settings.simple,
                advanced: copy.settings.advanced,
              }}
              onChange={(journalMode: JournalMode) =>
                updatePreferences({ journalMode })
              }
            />
          </Field>
        </section>

        <section className="titan-glass rounded-[10px] p-4 space-y-3">
          <h2 className="text-sm font-semibold">{copy.settings.appearance}</h2>
          <Field label={copy.settings.theme}>
            <OptionPills
              value={preferences.theme}
              options={["light", "slate", "dark"] as const}
              labels={{
                light: copy.settings.light,
                slate: copy.settings.slate,
                dark: copy.settings.dark,
              }}
              onChange={(theme: ThemeId) => updatePreferences({ theme })}
            />
          </Field>
          <Field label={copy.settings.density}>
            <OptionPills
              value={preferences.density}
              options={["compact", "comfortable", "large"] as const}
              labels={{
                compact: copy.settings.compact,
                comfortable: copy.settings.comfortable,
                large: copy.settings.large,
              }}
              onChange={(density: Density) => updatePreferences({ density })}
            />
          </Field>
        </section>

        <section className="titan-glass rounded-[10px] p-4 space-y-3">
          <h2 className="text-sm font-semibold">{copy.settings.trading}</h2>
          <SelectField
            label={copy.settings.defaultAccount}
            value={preferences.defaultAccount}
            options={ACCOUNTS}
            onChange={(defaultAccount) => updatePreferences({ defaultAccount })}
          />
          <Field label={copy.settings.defaultRisk}>
            <Input
              type="number"
              min={0.1}
              step={0.1}
              value={preferences.defaultRisk}
              onChange={(event) =>
                updatePreferences({
                  defaultRisk: Number(event.target.value) || 1,
                })
              }
            />
          </Field>
          <SelectField
            label={copy.settings.defaultPlaybook}
            value={preferences.defaultPlaybookId}
            options={playbookOptions.map((item) => item.id)}
            labels={Object.fromEntries(
              playbookOptions.map((item) => [item.id, item.name])
            )}
            onChange={(defaultPlaybookId) =>
              updatePreferences({ defaultPlaybookId })
            }
          />
        </section>
      </div>
    </PageFrame>
  )
}
