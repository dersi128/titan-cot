"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Menu,
  NotebookPen,
  PlusCircle,
  Settings,
  User,
} from "lucide-react"
import { useState } from "react"

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
import { ACCOUNT_LABELS, copy } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { ACCOUNTS } from "@/types/trade"

const MAIN_NAV = [
  { href: "/dashboard", label: copy.nav.dashboard, icon: LayoutDashboard },
  { href: "/journal", label: copy.nav.journal, icon: BookOpen },
  { href: "/new-trade", label: copy.nav.newTrade, icon: PlusCircle },
  { href: "/analytics", label: copy.nav.analytics, icon: BarChart3 },
  { href: "/playbook", label: copy.nav.playbook, icon: NotebookPen },
] as const

const BOTTOM_NAV = [
  { href: "/profile", label: copy.nav.profile, icon: User },
  { href: "/settings", label: copy.nav.settings, icon: Settings },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BrandMark() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 px-1">
      <div className="titan-logo-mark shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/titan-logo.png" alt="" width={28} height={28} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground">
          TITAN
        </p>
        <p className="text-[13px] font-semibold tracking-tight text-foreground">
          JOURNAL
        </p>
      </div>
    </Link>
  )
}

function NavGroup({
  items,
  onNavigate,
}: {
  items: typeof MAIN_NAV | typeof BOTTOM_NAV
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="titan-nav" aria-label="Main">
      {items.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn("titan-nav-item", active && "titan-nav-item--active")}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { profile } = useWorkspace()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <BrandMark />
      </div>
      <div className="flex-1 px-3 py-2">
        <NavGroup items={MAIN_NAV} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-sidebar-border px-3 py-3">
        <NavGroup items={BOTTOM_NAV} onNavigate={onNavigate} />
        <p className="mt-3 truncate px-2 text-[11px] text-muted-foreground">
          {profile.displayName}
        </p>
      </div>
    </div>
  )
}

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { account, setAccount, range, setRange } = useWorkspaceChrome()

  return (
    <header className="titan-topbar flex h-16 shrink-0 items-center gap-3 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
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
          value={range}
          onChange={setRange}
        />
      </div>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="titan-app flex min-h-screen">
      <aside className="hidden w-[232px] shrink-0 border-r border-sidebar-border bg-sidebar/90 lg:flex lg:flex-col">
        <SidebarBody />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        {open ? (
          <SheetContent
            side="left"
            className="w-[240px] border-r border-sidebar-border bg-sidebar p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>TITAN Journal</SheetTitle>
            </SheetHeader>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        ) : null}
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={() => setOpen(true)} />
        <main className="titan-main min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
