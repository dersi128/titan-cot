import type { Metadata } from "next"

import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { ComingSoon } from "@/components/placeholders/coming-soon"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.strategy.title,
}

export default function Page() {
  return (
    <PageFrame>
      <PageHeader
        title={copy.strategy.title}
        description={copy.strategy.description}
      />
      <ComingSoon title={copy.strategy.cardTitle} body={copy.strategy.body} />
    </PageFrame>
  )
}
