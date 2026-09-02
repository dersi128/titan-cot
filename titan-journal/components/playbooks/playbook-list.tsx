"use client"

import Link from "next/link"

import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import { copy } from "@/lib/labels"

export function PlaybookListPage() {
  const { playbooks, savePlaybook } = useWorkspace()

  return (
    <PageFrame>
      <PageHeader
        title={copy.playbook.title}
        description={copy.playbook.description}
        actions={
          <Button asChild>
            <Link href="/playbook/new">{copy.playbook.new}</Link>
          </Button>
        }
      />

      {playbooks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.playbook.empty}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {playbooks.map((playbook) => (
            <article
              key={playbook.id}
              className="titan-glass rounded-[10px] p-4"
              style={
                playbook.color
                  ? { borderLeft: `3px solid ${playbook.color}` }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-xs font-semibold"
                    style={
                      playbook.color
                        ? { background: `${playbook.color}22`, color: playbook.color }
                        : undefined
                    }
                  >
                    {playbook.icon || playbook.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                  <h2 className="text-sm font-semibold">{playbook.name}</h2>
                  {playbook.description ? (
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {playbook.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {playbook.fields.length} fields
                    {playbook.status === "archived"
                      ? ` · ${copy.playbook.archived}`
                      : ""}
                  </p>
                </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/playbook/${playbook.id}`}>Edit</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() =>
                    savePlaybook({
                      ...playbook,
                      status:
                        playbook.status === "archived" ? "active" : "archived",
                    })
                  }
                >
                  {playbook.status === "archived"
                    ? copy.playbook.restore
                    : copy.playbook.archive}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  )
}
