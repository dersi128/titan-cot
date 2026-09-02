"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppShell } from "@/components/layout/app-shell"
import { WorkspaceChromeProvider } from "@/components/layout/workspace-chrome"
import { WorkspaceProvider } from "@/components/layout/workspace-provider"
import { TradesProvider } from "@/components/trades/trades-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <WorkspaceProvider>
        <TradesProvider>
          <WorkspaceChromeProvider>
            <AppShell>{children}</AppShell>
          </WorkspaceChromeProvider>
        </TradesProvider>
      </WorkspaceProvider>
    </TooltipProvider>
  )
}
