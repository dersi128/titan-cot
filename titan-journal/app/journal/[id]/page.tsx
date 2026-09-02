import type { Metadata } from "next"

import { TradeDetailPage } from "@/components/trades/trade-detail-page"

export const metadata: Metadata = {
  title: "Trade",
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <TradeDetailPage id={id} />
}
