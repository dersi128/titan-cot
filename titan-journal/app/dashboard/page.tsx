import type { Metadata } from "next"

import { DashboardPage } from "@/components/dashboard/dashboard-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.nav.dashboard,
}

export default function Page() {
  return <DashboardPage />
}
