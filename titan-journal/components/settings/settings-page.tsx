"use client"

import { Field, OptionPills } from "@/components/forms/field"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { SelectField } from "@/components/forms/select-field"
import { useLabels } from "@/lib/use-labels"
import { ACCOUNTS } from "@/types/trade"
import { THEMES, type Density, type JournalMode, type ThemeId } from "@/types/playbook"

export function SettingsPage() {
  const { preferences, updatePreferences, playbooks } = useWorkspace()
  const { copy, ACCOUNT_LABELS } = useLabels()
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
          <Field label={copy.settings.language}>
            <LanguageSwitcher size="md" />
          </Field>
          <Field label={copy.settings.theme}>
            <OptionPills
              value={preferences.theme}
              options={THEMES}
              labels={{
                light: copy.settings.light,
                slate: copy.settings.slate,
                dark: copy.settings.dark,
                gold: copy.settings.gold,
                cyberpunk: copy.settings.cyberpunk,
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
            labels={ACCOUNT_LABELS}
            onChange={(defaultAccount) => updatePreferences({ defaultAccount })}
          />
          <p className="text-[12px] text-muted-foreground">
            {copy.settings.riskOnProfile}
          </p>
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
