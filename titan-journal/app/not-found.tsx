import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader } from "@/components/layout/page-header"

export const metadata: Metadata = {
  title: "Not found",
}

export default function NotFound() {
  return (
    <PageFrame>
      <PageHeader title="Not found" description="This route does not exist." />
      <Button asChild>
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </PageFrame>
  )
}
