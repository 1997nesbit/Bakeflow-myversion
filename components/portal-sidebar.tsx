'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChefHat, LogOut, User, LayoutGrid,
  ChevronDown, ChevronRight,
  LayoutDashboard, Users, Settings, Banknote,
  Crown, ListChecks, History, MessageSquare,
  CreditCard, BarChart3,
  PlusCircle, Search,
  PackagePlus, ScrollText, AlertTriangle, Receipt,
  Flame, Layers,
  ShoppingCart, Package,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRoleAuth, type RoleAuthConfig } from '@/lib/hooks/use-role-auth'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface PortalSidebarProps {
  portalName: string
  /** Shown under the user's name */
  roleLabel: string
  nav: NavItem[]
  authConfig: RoleAuthConfig
  /**
   * light  — white background, gradient header bar (Manager)
   * gradient — full colour gradient background (all other roles)
   */
  variant?: 'light' | 'gradient'
  /** CSS gradient string used when variant='gradient' */
  gradient?: string
  /**
   * top    — user card below the header (Baker, Manager)
   * bottom — collapsible profile button in the footer (Front Desk, Inventory)
   */
  profilePlacement?: 'top' | 'bottom'
}

// ─── Shared nav configs ───────────────────────────────────────────────────────

const ROSE_GRADIENT = 'linear-gradient(160deg, hsl(350,72%,60%) 0%, hsl(350,72%,50%) 100%)'
const HEADER_GRADIENT = 'linear-gradient(135deg, hsl(350,72%,58%) 0%, hsl(350,72%,48%) 100%)'

export const managerNav: NavItem[] = [
  { name: 'Dashboard',          href: '/manager',              icon: LayoutDashboard },
  { name: 'User Management',    href: '/manager/users',        icon: Users },
  { name: 'Account Management', href: '/manager/accounts',     icon: Settings },
  { name: 'Debts',              href: '/manager/debts',        icon: Banknote },
  { name: 'Customers',          href: '/manager/customers',    icon: Crown },
  { name: 'Tasks',              href: '/manager/tasks',        icon: ListChecks },
  { name: 'Order History',      href: '/manager/order-history',icon: History },
  { name: 'Bulk Messages',      href: '/manager/messages',     icon: MessageSquare },
  { name: 'Payments',           href: '/manager/payments',     icon: CreditCard },
  { name: 'Reports',            href: '/manager/reports',      icon: BarChart3 },
]

export const frontDeskNav: NavItem[] = [
  { name: 'Dashboard',      href: '/front-desk',          icon: LayoutDashboard },
  { name: 'Orders',         href: '/front-desk/orders',   icon: PlusCircle },
  { name: 'Search & Inquiry', href: '/front-desk/search', icon: Search },
  { name: 'Messaging',      href: '/front-desk/messaging',icon: MessageSquare },
  { name: 'Settings',       href: '/front-desk/settings', icon: Settings },
]

export const inventoryNav: NavItem[] = [
  { name: 'Dashboard',       href: '/inventory',           icon: LayoutDashboard },
  { name: 'Stock In',        href: '/inventory/stock-in',  icon: PackagePlus },
  { name: 'Daily Rollout',   href: '/inventory/rollout',   icon: ScrollText },
  { name: 'Alerts & Reorder',href: '/inventory/alerts',    icon: AlertTriangle },
  { name: 'Expenses',        href: '/inventory/expenses',  icon: Receipt },
]

export const bakerNav: NavItem[] = [
  { name: 'Dashboard',       href: '/portal/baker',            icon: LayoutDashboard },
  { name: 'Daily Production',href: '/portal/baker/production', icon: Layers },
  { name: 'Active Orders',   href: '/portal/baker/active',     icon: Flame },
  { name: 'History',         href: '/portal/baker/history',    icon: History },
]

// ─── Base component ───────────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getNavLinkClass(isLight: boolean, isActive: boolean): string {
  if (isLight) {
    return isActive
      ? 'bg-rose-500 text-white shadow-sm shadow-rose-200'
      : 'text-rose-900/70 hover:bg-rose-50 hover:text-rose-900'
  }
  return isActive
    ? 'bg-white/25 text-white shadow-sm'
    : 'text-white/80 hover:bg-white/15 hover:text-white'
}

function getNavIconClass(isLight: boolean, isActive: boolean): string {
  if (!isLight) return 'h-4 w-4 shrink-0'
  return isActive ? 'h-4 w-4 shrink-0 text-white' : 'h-4 w-4 shrink-0 text-rose-400'
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function TopProfile({ isLight, userName, roleLabel }: Readonly<{ isLight: boolean; userName: string; roleLabel: string }>) {
  if (isLight) {
    return (
      <div className="mx-3 mt-3 mb-1 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 shadow-sm">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-rose-900 truncate">{userName}</p>
          <p className="text-[11px] text-rose-400 font-medium">{roleLabel}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 border-b border-white/20 px-5 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
        <User className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{userName}</p>
        <p className="text-xs text-white/60">{roleLabel}</p>
      </div>
    </div>
  )
}

function SidebarFooter({
  isLight, userName, roleLabel, logout,
}: Readonly<{ isLight: boolean; userName: string; roleLabel: string; logout: () => void }>) {
  const [profileOpen, setProfileOpen] = useState(false)
  const footerBorder = isLight ? 'border-t border-rose-100' : 'border-t border-white/20'

  return (
    <div className={cn('p-3 space-y-0.5', footerBorder)}>
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            isLight ? 'text-rose-900/80 hover:bg-rose-50' : 'text-white/90 hover:bg-white/15'
          )}
        >
          <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', isLight ? 'bg-rose-100' : 'bg-white/20')}>
            <User className={cn('h-4 w-4', isLight ? 'text-rose-500' : 'text-white')} />
          </div>
          <div className="flex-1 text-left">
            <p className={cn('text-sm font-medium', isLight ? 'text-rose-900' : 'text-white')}>{userName}</p>
            <p className={cn('text-xs', isLight ? 'text-rose-400' : 'text-white/60')}>{roleLabel}</p>
          </div>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isLight ? 'text-rose-300' : 'text-white/60', profileOpen && 'rotate-180')} />
        </button>

        {profileOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-white/20 bg-white p-1 shadow-lg">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700"
            >
              <LayoutGrid className="h-4 w-4" />
              All Portals
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InlineFooter({ isLight, logout }: Readonly<{ isLight: boolean; logout: () => void }>) {
  const footerBorder = isLight ? 'border-t border-rose-100' : 'border-t border-white/20'
  return (
    <div className={cn('p-3 space-y-0.5', footerBorder)}>
      <Link
        href="/"
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
          isLight ? 'text-rose-900/50 hover:bg-rose-50 hover:text-rose-900' : 'text-white/70 hover:bg-white/15 hover:text-white'
        )}
      >
        <LayoutGrid className={cn('h-4 w-4', isLight ? 'text-rose-300' : '')} />
        All Portals
      </Link>
      <button
        type="button"
        onClick={logout}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
          isLight ? 'text-rose-900/50 hover:bg-red-50 hover:text-red-600' : 'text-white/70 hover:bg-white/15 hover:text-white'
        )}
      >
        <LogOut className={cn('h-4 w-4', isLight ? 'text-rose-300' : '')} />
        Sign Out
      </button>
    </div>
  )
}

// ─── Base component ───────────────────────────────────────────────────────────

export function PortalSidebar({
  portalName,
  roleLabel,
  nav,
  authConfig,
  variant = 'gradient',
  gradient = ROSE_GRADIENT,
  profilePlacement = 'bottom',
}: Readonly<PortalSidebarProps>) {
  const pathname = usePathname()
  const { userName, logout } = useRoleAuth(authConfig)

  const isLight = variant === 'light'

  return (
    <aside
      className={cn('fixed left-0 top-0 z-40 h-screen w-64', isLight && 'bg-white border-r border-rose-100 shadow-sm')}
      style={isLight ? undefined : { background: gradient }}
    >
      <div className="flex h-full flex-col">

        {/* Header */}
        <div
          className={cn('flex h-16 shrink-0 items-center gap-3 px-5', isLight ? 'border-b border-rose-100' : 'border-b border-white/20')}
          style={isLight ? { background: HEADER_GRADIENT } : undefined}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">Bbr Bakeflow</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-medium">{portalName}</p>
          </div>
        </div>

        {/* Top profile (Baker / Manager style) */}
        {profilePlacement === 'top' && (
          <TopProfile isLight={isLight} userName={userName} roleLabel={roleLabel} />
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {isLight && (
            <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-rose-300">Menu</p>
          )}
          {nav.map((item) => {
            const isActive = pathname === item.href
            const linkClass = getNavLinkClass(isLight, isActive)
            const iconClass = getNavIconClass(isLight, isActive)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                  linkClass
                )}
              >
                <item.icon className={iconClass} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {profilePlacement === 'bottom'
          ? <SidebarFooter isLight={isLight} userName={userName} roleLabel={roleLabel} logout={logout} />
          : <InlineFooter isLight={isLight} logout={logout} />
        }

      </div>
    </aside>
  )
}

// ─── Role sidebars ────────────────────────────────────────────────────────────

export function ManagerSidebar() {
  return (
    <PortalSidebar
      portalName="Manager Portal"
      roleLabel="Administrator"
      nav={managerNav}
      authConfig={{ storageKey: 'bbr_manager_auth', loginPath: '/manager/login', defaultName: 'Manager' }}
      variant="light"
      profilePlacement="top"
    />
  )
}

export function FrontDeskSidebar() {
  return (
    <PortalSidebar
      portalName="Front Desk"
      roleLabel="Front Desk Agent"
      nav={frontDeskNav}
      authConfig={{ storageKey: 'bbr_frontdesk_user', loginPath: '/', defaultName: 'Front Desk', requireAuth: false }}
      variant="gradient"
      profilePlacement="bottom"
    />
  )
}

export function InventorySidebar() {
  return (
    <PortalSidebar
      portalName="Inventory"
      roleLabel="Inventory Clerk"
      nav={inventoryNav}
      authConfig={{ storageKey: 'bbr_inventory_user', loginPath: '/', defaultName: 'Store Clerk', requireAuth: false }}
      variant="gradient"
      profilePlacement="bottom"
    />
  )
}

export function BakerSidebar() {
  return (
    <PortalSidebar
      portalName="Baker Portal"
      roleLabel="Baker / QA"
      nav={bakerNav}
      authConfig={{ storageKey: 'baker_auth', loginPath: '/portal/baker/login', defaultName: 'Baker' }}
      variant="gradient"
      gradient="linear-gradient(to bottom, #CA0123, #e66386)"
      profilePlacement="top"
    />
  )
}

// ─── App sidebar (collapsible grouped nav, no auth) ───────────────────────────

const frontDeskSubNav = frontDeskNav
const inventorySubNav: NavItem[] = [
  { name: 'Dashboard',       href: '/inventory',           icon: LayoutDashboard },
  { name: 'Stock In',        href: '/inventory/stock-in',  icon: PackagePlus },
  { name: 'Daily Rollout',   href: '/inventory/rollout',   icon: ScrollText },
  { name: 'Alerts & Reorder',href: '/inventory/alerts',    icon: AlertTriangle },
  { name: 'Access & Roles',  href: '/inventory/access',    icon: Users },
]

function AppSidebarSection({
  label, icon: Icon, title, isActive, isOpen, onToggle, items, pathname,
}: Readonly<{
  label: string; icon: LucideIcon; title: string
  isActive: boolean; isOpen: boolean; onToggle: () => void
  items: NavItem[]; pathname: string
}>) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">{label}</p>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
        )}
      >
        <span className="flex items-center gap-3"><Icon className="h-5 w-5" />{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3">
          {items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-white/25 text-white' : 'text-white/70 hover:bg-white/15 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />{item.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const isFrontDeskActive = pathname.startsWith('/front-desk')
  const isInventoryActive = pathname.startsWith('/inventory')
  const [frontDeskOpen, setFrontDeskOpen] = useState(isFrontDeskActive)
  const [inventoryOpen, setInventoryOpen] = useState(isInventoryActive)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64" style={{ background: ROSE_GRADIENT }}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">Bbr Bakeflow</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-medium">Bakery Operations</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <AppSidebarSection
            label="Front Desk" icon={ShoppingCart} title="Front Desk Portal"
            isActive={isFrontDeskActive} isOpen={frontDeskOpen}
            onToggle={() => setFrontDeskOpen(!frontDeskOpen)}
            items={frontDeskSubNav} pathname={pathname}
          />
          <AppSidebarSection
            label="Operations" icon={Package} title="Inventory Portal"
            isActive={isInventoryActive} isOpen={inventoryOpen}
            onToggle={() => setInventoryOpen(!inventoryOpen)}
            items={inventorySubNav} pathname={pathname}
          />
        </nav>
      </div>
    </aside>
  )
}
