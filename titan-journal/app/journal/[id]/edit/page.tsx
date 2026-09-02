import type { Metadata } from "next"

import { TradeEditPage } from "@/components/trades/trade-edit-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.form.editTitle,
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TradeEditPage id={id} />
}
