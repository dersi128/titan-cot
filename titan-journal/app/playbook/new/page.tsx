import type { Metadata } from "next"

import { PlaybookEditor } from "@/components/playbooks/playbook-editor"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.playbook.new,
}

export default function Page() {
  return <PlaybookEditor />
}
