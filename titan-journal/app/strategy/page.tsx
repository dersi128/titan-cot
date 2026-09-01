import type { Metadata } from "next"

import { PageFrame, PageHeader } from "@/components/layout/page-header"
import { ComingSoon } from "@/components/placeholders/coming-soon"

export const metadata: Metadata = {
  title: "Strategy",
}

export default function Page() {
  return (
    <PageFrame>
      <PageHeader
        title="Strategy"
        description="Rules and setup definitions will live here in a later phase."
      />
      <ComingSoon
        title="Strategy rules"
        body="Later this page will hold TITAN Swing setup definitions, grading rules and playbook criteria used to score trades automatically."
      />
    </PageFrame>
  )
}
