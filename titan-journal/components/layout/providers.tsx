"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/app-shell"
import { TradesProvider } from "@/components/trades/trades-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <TradesProvider>
        <AppShell>{children}</AppShell>
      </TradesProvider>
    </TooltipProvider>
  )
}
