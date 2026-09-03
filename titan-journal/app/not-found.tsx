import type { Metadata } from "next"

import { NotFoundView } from "@/components/layout/not-found-view"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.notFound.title,
}

export default function NotFound() {
  return <NotFoundView />
}
