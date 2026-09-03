"use client"

import { useMemo } from "react"

import { useWorkspace } from "@/components/layout/workspace-provider"
import { labelsFor } from "@/lib/labels"

export function useLabels() {
  const { preferences } = useWorkspace()
  return useMemo(() => labelsFor(preferences.language), [preferences.language])
}
