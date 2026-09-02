import type { Metadata } from "next"

import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.analytics.title,
}

export default function Page() {
  return <AnalyticsPage />
}
