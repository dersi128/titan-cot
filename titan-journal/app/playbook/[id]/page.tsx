import type { Metadata } from "next"

import { PlaybookEditPage } from "@/components/playbooks/playbook-edit-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.playbook.title,
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PlaybookEditPage id={id} />
}
