"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  NotebookTabs,
  Palette,
  PlusCircle,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react"

import { useWorkspace } from "@/components/layout/workspace-provider"
import { AvatarBubble } from "@/components/profile/avatar-bubble"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { THEME_LOGOS } from "@/lib/brand"
import { useLabels } from "@/lib/use-labels"
import { cn } from "@/lib/utils"
import { THEMES, type ThemeId } from "@/types/playbook"

type NavLink = {
  href: string
  label: string
  hint: string
  icon: LucideIcon
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarNavLink({
  item,
  collapsed,
  showHint,
  onNavigate,
}: {
  item: NavLink
  collapsed: boolean
  showHint: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn("titan-nav-item", active && "titan-nav-item--active")}
    >
      <Icon className="titan-nav-icon" aria-hidden />
      <span className="titan-nav-copy">
        <span className="titan-nav-label">{item.label}</span>
        {showHint ? <span className="titan-nav-hint">{item.hint}</span> : null}
      </span>
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.label}
      </TooltipContent>
    </Tooltip>
  )
}

function ThemeSwitcher({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const { preferences, updatePreferences } = useWorkspace()
  const { copy } = useLabels()
  const current = copy.sidebar.themes[preferences.theme]
  const label = `${copy.sidebar.appearance}: ${current}`

  const trigger = (
    <button
      type="button"
      className="titan-nav-item titan-theme-trigger"
      aria-label={label}
      title={collapsed ? label : undefined}
    >
      <Palette className="titan-nav-icon" aria-hidden />
      <span className="titan-nav-copy">
        <span className="titan-nav-label">{copy.settings.theme}</span>
        <span className="titan-nav-hint titan-theme-trigger__name">
          {current}
          <ChevronDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
        </span>
      </span>
    </button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? "right" : "top"}
        align="start"
        sideOffset={8}
        className="min-w-44"
      >
        <DropdownMenuRadioGroup
          value={preferences.theme}
          onValueChange={(theme) => {
            updatePreferences({ theme: theme as ThemeId })
            onNavigate?.()
          }}
        >
          {THEMES.map((theme) => (
            <DropdownMenuRadioItem key={theme} value={theme}>
              {copy.sidebar.themes[theme]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProfileCard({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const { profile } = useWorkspace()
  const { copy } = useLabels()
  const role = profile.traderType.trim() || copy.sidebar.trader
  const label = `${profile.displayName}, ${role}`

  const card = (
    <Link
      href="/profile"
      onClick={onNavigate}
      aria-label={label}
      className="titan-profile-card"
    >
      <AvatarBubble name={profile.displayName} src={profile.avatar} size="xs" />
      <span className="titan-nav-copy">
        <span className="titan-nav-label">{profile.displayName}</span>
        <span className="titan-nav-hint">{role}</span>
      </span>
    </Link>
  )

  if (!collapsed) return card

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar({
  collapsed,
  showCollapse = false,
  onNavigate,
}: {
  collapsed: boolean
  showCollapse?: boolean
  onNavigate?: () => void
}) {
  const { preferences, updatePreferences } = useWorkspace()
  const { copy } = useLabels()
  const src = THEME_LOGOS[preferences.theme]
  const showHint = !collapsed && preferences.density !== "compact"

  const mainNav: NavLink[] = [
    {
      href: "/dashboard",
      label: copy.nav.dashboard,
      hint: copy.nav.hints.dashboard,
      icon: LayoutDashboard,
    },
    {
      href: "/calendar",
      label: copy.nav.calendar,
      hint: copy.nav.hints.calendar,
      icon: CalendarDays,
    },
    {
      href: "/journal",
      label: copy.nav.journal,
      hint: copy.nav.hints.journal,
      icon: BookOpen,
    },
    {
      href: "/new-trade",
      label: copy.nav.newTrade,
      hint: copy.nav.hints.newTrade,
      icon: PlusCircle,
    },
    {
      href: "/analytics",
      label: copy.nav.analytics,
      hint: copy.nav.hints.analytics,
      icon: ChartNoAxesCombined,
    },
    {
      href: "/playbook",
      label: copy.nav.playbook,
      hint: copy.nav.hints.playbook,
      icon: NotebookTabs,
    },
  ]

  const accountNav: NavLink[] = [
    {
      href: "/profile",
      label: copy.nav.profile,
      hint: copy.nav.hints.profile,
      icon: User,
    },
    {
      href: "/settings",
      label: copy.nav.settings,
      hint: copy.nav.hints.settings,
      icon: Settings,
    },
  ]

  return (
    <TooltipProvider delayDuration={180}>
      <div
        className="titan-sidebar-inner"
        data-collapsed={collapsed ? "true" : "false"}
      >
        {showCollapse ? (
          <button
            type="button"
            className="titan-sidebar-toggle"
            aria-label={collapsed ? copy.sidebar.expand : copy.sidebar.collapse}
            aria-expanded={!collapsed}
            onClick={() =>
              updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed })
            }
          >
            {collapsed ? (
              <ChevronsRight className="size-3.5" aria-hidden />
            ) : (
              <ChevronsLeft className="size-3.5" aria-hidden />
            )}
          </button>
        ) : null}

        <div className="titan-sidebar-brand">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="titan-sidebar-logo"
            aria-label={copy.brand}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="titan-logo-lockup" />
          </Link>
          <p className="titan-sidebar-motto">{copy.sidebar.motto}</p>
        </div>

        <nav className="titan-nav titan-nav--main" aria-label={copy.nav.main}>
          {mainNav.map((item) => (
            <SidebarNavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              showHint={showHint}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <div className="titan-sidebar-foot">
          <div className="titan-sidebar-rule" />
          <p className="titan-sidebar-kicker">{copy.sidebar.account}</p>
          <nav className="titan-nav" aria-label={copy.sidebar.account}>
            {accountNav.map((item) => (
              <SidebarNavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                showHint={showHint}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
          <ThemeSwitcher collapsed={collapsed} onNavigate={onNavigate} />
          <ProfileCard collapsed={collapsed} onNavigate={onNavigate} />
        </div>
      </div>
    </TooltipProvider>
  )
}
