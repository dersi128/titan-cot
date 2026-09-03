"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { useLabels } from "@/lib/use-labels"

export function NotFoundView() {
  const { copy } = useLabels()

  return (
    <PageFrame>
      <PageHeader
        title={copy.notFound.title}
        description={copy.notFound.description}
      />
      <Button asChild>
        <Link href="/dashboard">{copy.notFound.back}</Link>
      </Button>
    </PageFrame>
  )
}
