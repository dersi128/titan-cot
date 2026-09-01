import type { Metadata } from "next"

import { NewTradeForm } from "@/components/forms/new-trade-form"

export const metadata: Metadata = {
  title: "New Trade",
}

export default function Page() {
  return <NewTradeForm />
}
