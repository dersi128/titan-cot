import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.notFound.title,
}

export default function NotFound() {
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
