import type { Metadata } from "next"

import { JournalPage } from "@/components/trades/journal-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.nav.journal,
}

export default function Page() {
  return <JournalPage />
}
