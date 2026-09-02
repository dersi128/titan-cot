import type { Metadata } from "next"

import { SettingsPage } from "@/components/settings/settings-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.settings.title,
}

export default function Page() {
  return <SettingsPage />
}
