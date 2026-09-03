import type { Metadata } from "next"

import { CalendarPage } from "@/components/calendar/calendar-page"
import { copy } from "@/lib/labels"

export const metadata: Metadata = {
  title: copy.nav.calendar,
}

export default function Page() {
  return <CalendarPage />
}
