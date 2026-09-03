"use client"

import { Menu } from "lucide-react"
import { useState, useSyncExternalStore } from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SampleBanner } from "@/components/layout/empty-journal"
import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  DATE_RANGES,
  useWorkspaceChrome,
} from "@/components/layout/workspace-chrome"
import { useWorkspace } from "@/components/layout/workspace-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useLabels } from "@/lib/use-labels"
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
  const { account, setAccount, range, setRange, custom, setCustom } =
    useWorkspaceChrome()
  const { copy, ACCOUNT_LABELS, DATE_RANGE_LABELS } = useLabels()

  return (
    <header className="titan-topbar flex min-h-16 shrink-0 items-center gap-3 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onOpenNav}
        aria-label={copy.openNav}
      >
        <Menu />
      </Button>

      <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">
        <SegmentedControl
          aria-label={copy.shell.account}
          tone="strong"
          options={ACCOUNTS}
          labels={ACCOUNT_LABELS}
          value={account}
          onChange={setAccount}
        />
        <SegmentedControl
          aria-label={copy.shell.range}
          tone="strong"
          options={DATE_RANGES}
          labels={DATE_RANGE_LABELS}
          value={range}
          onChange={setRange}
        />
        {range === "CUSTOM" ? (
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={custom?.start ?? ""}
              onChange={(event) =>
                setCustom({
                  start: event.target.value,
                  end: custom?.end ?? event.target.value,
                })
              }
              aria-label={copy.journal.dateFrom}
              className="h-8 w-[9.5rem] px-2 text-[12px]"
            />
            <Input
              type="date"
              value={custom?.end ?? ""}
              onChange={(event) =>
                setCustom({
                  start: custom?.start ?? event.target.value,
                  end: event.target.value,
                })
              }
              aria-label={copy.journal.dateTo}
              className="h-8 w-[9.5rem] px-2 text-[12px]"
            />
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { copy } = useLabels()
  const { preferences } = useWorkspace()
  const isTablet = useIsTabletNav()
  const collapsed = isTablet || preferences.sidebarCollapsed

  return (
    <div
      className="titan-app min-h-screen"
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

      <div className="titan-shell-offset flex min-h-screen min-w-0 flex-col">
        <TopBar onOpenNav={() => setOpen(true)} />
        <main className="titan-main min-w-0 flex-1">
          <SampleBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
