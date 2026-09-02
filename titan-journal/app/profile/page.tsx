import type { Metadata } from "next"

import { ProfilePage } from "@/components/profile/profile-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.profile.title,
}

export default function Page() {
  return <ProfilePage />
}
