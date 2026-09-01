import type { Metadata } from "next"

import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { ComingSoon } from "@/components/placeholders/coming-soon"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.analytics.title,
}

export default function Page() {
  return (
    <PageFrame>
      <PageHeader
        title={copy.analytics.title}
        description={copy.analytics.description}
      />
      <ComingSoon title={copy.analytics.cardTitle} body={copy.analytics.body} />
    </PageFrame>
  )
}
