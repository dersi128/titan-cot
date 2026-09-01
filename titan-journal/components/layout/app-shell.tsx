"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  LayoutDashboard,
  LineChart,
  Menu,
  Plus,
  Waypoints,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { copy } from "@/lib/labels"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: copy.nav.dashboard, icon: LayoutDashboard },
  { href: "/journal", label: copy.nav.journal, icon: BookOpen },
  { href: "/new-trade", label: copy.nav.newTrade, icon: Plus },
  { href: "/analytics", label: copy.nav.analytics, icon: LineChart },
  { href: "/strategy", label: copy.nav.strategy, icon: Waypoints },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <Link href="/dashboard" className="block px-2.5 py-1">
      <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground">
        TITAN
      </p>
      <p className="text-sm font-medium">{copy.brand}</p>
    </Link>
  )
}

export function AppSidebar() {
  return (
    <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-4 lg:flex">
      <Brand />
      <div className="mt-6 flex-1">
        <NavList />
      </div>
      <p className="px-2.5 text-[11px] text-muted-foreground">{copy.phase}</p>
    </aside>
  )
}

export function MobileNav() {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2 lg:hidden">
      <Brand />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={copy.openNav}>
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar p-0">
          <SheetHeader className="border-b border-sidebar-border">
            <SheetTitle>TITAN Journal</SheetTitle>
          </SheetHeader>
          <div className="px-3 py-4">
            <NavList />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
