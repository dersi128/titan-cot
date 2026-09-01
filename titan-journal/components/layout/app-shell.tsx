"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Settings,
  Target,
} from "lucide-react"
import { useState } from "react"

import { SegmentedControl } from "@/components/layout/segmented-control"
import {
  DATE_RANGES,
  useWorkspaceChrome,
} from "@/components/layout/workspace-chrome"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { copy } from "@/lib/labels"
import { cn } from "@/lib/utils"
import { ACCOUNTS } from "@/types/trade"

const NAV_ITEMS = [
  { href: "/dashboard", label: copy.nav.dashboard, icon: LayoutDashboard },
  { href: "/journal", label: copy.nav.journal, icon: BookOpen },
  { href: "/new-trade", label: copy.nav.newTrade, icon: PlusCircle },
  { href: "/analytics", label: copy.nav.analytics, icon: BarChart3 },
  { href: "/strategy", label: copy.nav.strategy, icon: Target },
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

function NavLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void
  className?: string
}) {
  const pathname = usePathname()

  return (
    <nav className={cn("titan-nav", className)} aria-label="Main">
      {NAV_ITEMS.map((item) => {
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
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <BrandMark />
      </div>
      <div className="flex-1 px-3 py-2">
        <NavLinks onNavigate={onNavigate} />
      </div>
    </div>
  )
}

function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { account, setAccount, range, setRange } = useWorkspaceChrome()

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#0c0d10] px-4 lg:px-6">
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

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={copy.shell.settings}
        className="shrink-0 text-muted-foreground"
      >
        <Settings />
      </Button>
    </header>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[232px] shrink-0 border-r border-white/[0.06] bg-sidebar lg:flex lg:flex-col">
        <SidebarBody />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-[240px] border-r border-white/[0.06] bg-sidebar p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>TITAN Journal</SheetTitle>
          </SheetHeader>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={() => setOpen(true)} />
        <main className="min-w-0 flex-1 px-4 py-5 md:px-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
