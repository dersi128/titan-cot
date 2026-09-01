"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { useState } from "react"

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
  { href: "/dashboard", label: copy.nav.dashboard },
  { href: "/journal", label: copy.nav.journal },
  { href: "/new-trade", label: copy.nav.newTrade },
  { href: "/analytics", label: copy.nav.analytics },
  { href: "/strategy", label: copy.nav.strategy },
] as const

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
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
    <nav className={cn("titan-nav", className)} aria-label="Hlavní navigace">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn("titan-nav-item", active && "titan-nav-item--active")}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function BrandBlock() {
  return (
    <Link href="/dashboard" className="flex min-w-0 items-center gap-4 md:gap-5">
      <div className="titan-logo-ring shrink-0">
        <Image
          src="/brand/titan-logo.png"
          alt="TITAN"
          width={128}
          height={128}
          priority
        />
      </div>
      <div className="min-w-0 border-l border-[rgba(46,168,255,0.15)] pl-4 md:pl-5">
        <p className="titan-kicker">{copy.brand}</p>
        <h1 className="titan-title mt-1.5 text-xl text-stone-50 md:text-2xl">
          TITAN Journal
        </h1>
        <p className="mt-1.5 max-w-md text-[12px] font-medium tracking-[0.04em] text-stone-400 md:text-[13px]">
          Strategie nejdřív — čísla až potom
        </p>
      </div>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative min-h-screen">
      <header className="titan-header-bar sticky top-0 z-30">
        <div className="mx-auto max-w-[1680px] px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-start justify-between gap-3">
            <BrandBlock />
            <div className="flex shrink-0 items-center gap-2 pt-1">
              <span className="titan-badge-chip hidden sm:inline-flex">{copy.phase}</span>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="border-[rgba(46,168,255,0.25)] bg-titan-panel/80 lg:hidden"
                    aria-label={copy.openNav}
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-72 border-r border-white/10 bg-[#060a12] p-0"
                >
                  <SheetHeader className="border-b border-white/[0.06]">
                    <SheetTitle className="titan-title text-sm">
                      TITAN Journal
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-4 py-5">
                    <NavLinks onNavigate={() => setOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="mt-3 border-t border-[rgba(46,168,255,0.1)] pt-3">
            <NavLinks />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1680px] animate-fade-up px-4 py-5 md:px-6 md:py-6">
        {children}
      </main>

      <footer className="border-t border-white/[0.06] py-6 text-center">
        <p className="text-[10px] tracking-wide text-stone-600">
          TITAN Journal · Fáze 1 · Bias only, not execution
        </p>
      </footer>
    </div>
  )
}
