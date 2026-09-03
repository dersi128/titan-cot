"use client"

import { PlaybookEditor } from "@/components/playbooks/playbook-editor"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { PageFrame } from "@/components/layout/page-header"
import { useLabels } from "@/lib/use-labels"

export function PlaybookEditPage({ id }: { id: string }) {
  const { copy } = useLabels()
  const { getPlaybook } = useWorkspace()
  const playbook = getPlaybook(id)

  if (!playbook) {
    return (
      <PageFrame>
        <p className="text-sm text-muted-foreground">{copy.playbook.empty}</p>
      </PageFrame>
    )
  }

  return <PlaybookEditor playbook={playbook} />
}
