"use client"

import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useSyncExternalStore } from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  DATE_RANGES,
  useWorkspaceChrome,
} from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import { ACCOUNTS } from "@/types/trade"

const TABLET_QUERY = "(min-width: 768px) and (max-width: 1023px)"

function subscribeTablet(onStoreChange: () => void) {
  const mq = window.matchMedia(TABLET_QUERY)
  mq.addEventListener("change", onStoreChange)
  return () => mq.removeEventListener("change", onStoreChange)
}

function useIsTabletNav() {
  return useSyncExternalStore(
    subscribeTablet,
    () => window.matchMedia(TABLET_QUERY).matches,
    () => false
  )
}

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { account, setAccount, range, setRange } = useWorkspaceChrome()
  const { copy, ACCOUNT_LABELS, DATE_RANGE_LABELS } = useLabels()

  return (
    <header className="titan-topbar flex h-16 shrink-0 items-center gap-3 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onOpenNav}
        aria-label={copy.openNav}
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        <SegmentedControl
          aria-label={copy.shell.account}
          options={ACCOUNTS}
          labels={ACCOUNT_LABELS}
          value={account}
          onChange={setAccount}
        />
        <SegmentedControl
          aria-label={copy.shell.range}
          options={DATE_RANGES}
          labels={DATE_RANGE_LABELS}
          value={range}
          onChange={setRange}
        />
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const fit = pathname === "/dashboard" || pathname === "/calendar"
  const { copy } = useLabels()
  const { preferences } = useWorkspace()
  const isTablet = useIsTabletNav()
  const collapsed = isTablet || preferences.sidebarCollapsed

  return (
    <div
      className={cn(
        "titan-app min-h-screen",
        fit && "lg:h-svh lg:max-h-svh lg:min-h-0 lg:overflow-hidden"
      )}
      data-sidebar-collapsed={collapsed ? "true" : "false"}
    >
      <aside className="titan-sidebar titan-sidebar--dock hidden md:flex md:flex-col">
        <AppSidebar collapsed={collapsed} showCollapse={!isTablet} />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        {open ? (
          <SheetContent
            side="left"
            className="titan-sidebar h-full w-[min(20rem,88vw)] gap-0 border-r border-sidebar-border p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{copy.brand}</SheetTitle>
            </SheetHeader>
            <AppSidebar onNavigate={() => setOpen(false)} collapsed={false} />
          </SheetContent>
        ) : null}
      </Sheet>

      <div
        className={cn(
          "titan-shell-offset flex min-h-0 min-w-0 flex-col",
          fit ? "lg:h-full lg:overflow-hidden" : "min-h-screen"
        )}
      >
        <TopBar onOpenNav={() => setOpen(true)} />
        <main
          className={cn(
            "titan-main min-w-0 flex-1",
            fit && "titan-main--fit flex min-h-0 flex-col lg:overflow-hidden"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
