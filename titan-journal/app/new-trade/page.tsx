import type { Metadata } from "next"

import { NewTradeForm } from "@/components/forms/new-trade-form"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.nav.newTrade,
}

export default function Page() {
  return <NewTradeForm />
}
