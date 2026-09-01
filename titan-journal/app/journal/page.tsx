import type { Metadata } from "next"

import { JournalPage } from "@/components/trades/journal-page"

export const metadata: Metadata = {
  title: "Journal",
}

export default function Page() {
  return <JournalPage />
}
