"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  BookOpen,
  Calendar,
  LayoutDashboard,
  Menu,
  NotebookPen,
  PlusCircle,
  Settings,
  User,
} from "lucide-react"
import { useState, type ComponentType } from "react"

import { LanguageSwitcher } from "@/components/layout/language-switcher"
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
import { AvatarBubble } from "@/components/profile/avatar-bubble"
import { THEME_LOGOS } from "@/lib/brand"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import { ACCOUNTS } from "@/types/trade"

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function BrandMark() {
  const { preferences } = useWorkspace()
  const { copy } = useLabels()
  const src = THEME_LOGOS[preferences.theme]

  return (
    <Link href="/dashboard" className="block px-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={copy.brand} className="titan-logo-lockup" />
    </Link>
  )
}

function NavGroup({
  items,
  label,
  onNavigate,
}: {
  items: readonly NavItem[]
  label: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="titan-nav" aria-label={label}>
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
  const { copy } = useLabels()
  const mainNav: NavItem[] = [
    { href: "/dashboard", label: copy.nav.dashboard, icon: LayoutDashboard },
    { href: "/calendar", label: copy.nav.calendar, icon: Calendar },
    { href: "/journal", label: copy.nav.journal, icon: BookOpen },
    { href: "/new-trade", label: copy.nav.newTrade, icon: PlusCircle },
    { href: "/analytics", label: copy.nav.analytics, icon: BarChart3 },
    { href: "/playbook", label: copy.nav.playbook, icon: NotebookPen },
  ]
  const bottomNav: NavItem[] = [
    { href: "/profile", label: copy.nav.profile, icon: User },
    { href: "/settings", label: copy.nav.settings, icon: Settings },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-sidebar-border px-3 py-3">
        <BrandMark />
      </div>
      <div className="flex-1 px-3 py-2">
        <NavGroup items={mainNav} label={copy.nav.main} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-sidebar-border px-3 py-3">
        <NavGroup items={bottomNav} label={copy.nav.settings} onNavigate={onNavigate} />
        <div className="mt-3 px-2">
          <LanguageSwitcher />
        </div>
        <div className="mt-3 flex items-center gap-2 px-2">
          <AvatarBubble name={profile.displayName} src={profile.avatar} size="sm" />
          <p className="truncate text-[11px] text-muted-foreground">
            {profile.displayName}
          </p>
        </div>
      </div>
    </div>
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

  return (
    <div
      className={cn(
        "titan-app flex min-h-screen",
        fit && "lg:h-svh lg:max-h-svh lg:min-h-0 lg:overflow-hidden"
      )}
    >
      <aside className="titan-sidebar hidden w-[232px] shrink-0 border-r border-sidebar-border lg:flex lg:flex-col">
        <SidebarBody />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        {open ? (
          <SheetContent
            side="left"
            className="titan-sidebar w-[240px] border-r border-sidebar-border p-0"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{copy.brand}</SheetTitle>
            </SheetHeader>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        ) : null}
      </Sheet>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          fit && "lg:h-full lg:overflow-hidden"
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
