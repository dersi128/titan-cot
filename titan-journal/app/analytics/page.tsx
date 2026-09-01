import type { Metadata } from "next"

import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { ComingSoon } from "@/components/placeholders/coming-soon"

export const metadata: Metadata = {
  title: "Analytics",
}

export default function Page() {
  return (
    <PageFrame>
      <PageHeader
        title="Analytics"
        description="Strategy analytics will live here in a later phase."
      />
      <ComingSoon
        title="Strategy analytics"
        body="Later this page will show which market conditions, setups and strategy rules produce the best results."
      />
    </PageFrame>
  )
}
