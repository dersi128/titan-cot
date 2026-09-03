"use client"

import { OptionPills } from "@/components/forms/field"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { LANGUAGE_SHORT } from "@/lib/labels"
import { LANGUAGES, type Language } from "@/types/playbook"

export function LanguageSwitcher() {
  const { preferences, updatePreferences } = useWorkspace()

  return (
    <OptionPills
      value={preferences.language}
      options={LANGUAGES}
      labels={LANGUAGE_SHORT}
      onChange={(language: Language) => updatePreferences({ language })}
    />
  )
}
