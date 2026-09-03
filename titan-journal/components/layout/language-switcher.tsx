"use client"

import { SegmentedControl } from "@/components/layout/segmented-control"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { LANGUAGE_SHORT } from "@/lib/labels"
import { useLabels } from "@/lib/use-labels"
import { LANGUAGES, type Language } from "@/types/playbook"

export function LanguageSwitcher({
  size = "sm",
}: {
  size?: "sm" | "md"
}) {
  const { preferences, updatePreferences } = useWorkspace()
  const { copy } = useLabels()

  return (
    <SegmentedControl
      size={size}
      options={LANGUAGES}
      value={preferences.language}
      onChange={(language: Language) => updatePreferences({ language })}
      labels={LANGUAGE_SHORT}
      aria-label={copy.settings.language}
    />
  )
}
