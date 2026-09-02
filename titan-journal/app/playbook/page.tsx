import type { Metadata } from "next"

import { PlaybookListPage } from "@/components/playbooks/playbook-list"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.playbook.title,
}

export default function Page() {
  return <PlaybookListPage />
}
