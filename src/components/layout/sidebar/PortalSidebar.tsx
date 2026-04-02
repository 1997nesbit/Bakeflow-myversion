'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ChefHat,
  LayoutDashboard, Users, Settings, Banknote,
  Crown, ListChecks, History, MessageSquare,
  CreditCard, BarChart3,
  PlusCircle, Search,
  PackagePlus, ScrollText, AlertTriangle, Receipt,
  Flame, Layers,
  ShoppingCart, Package,
  UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRoleAuth, type RoleAuthConfig } from '@/lib/hooks/use-role-auth'
import { cn } from '@/lib/utils'
import { TopProfile } from './TopProfile'
import { SidebarFooter } from './SidebarFooter'
import { InlineFooter } from './InlineFooter'
import { AppSidebarSection } from './AppSidebarSection'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface PortalSidebarProps {
  portalName: string
  roleLabel: string
  nav: NavItem[]
  authConfig: RoleAuthConfig
  variant?: 'light' | 'gradient' | 'dark'
  gradient?: string
  profilePlacement?: 'top' | 'bottom'
}

// ─── Shared nav configs ───────────────────────────────────────────────────────

const ROSE_GRADIENT = 'linear-gradient(160deg, hsl(350,72%,60%) 0%, hsl(350,72%,50%) 100%)'
const HEADER_GRADIENT = 'linear-gradient(135deg, hsl(350,72%,58%) 0%, hsl(350,72%,48%) 100%)'

export const managerNav: NavItem[] = [
  { name: 'Dashboard',          href: '/manager',               icon: LayoutDashboard },
  { name: 'User Management',    href: '/manager/users',         icon: Users },
  { name: 'Account Management', href: '/manager/accounts',      icon: Settings },
  { name: 'Debts',              href: '/manager/debts',         icon: Banknote },
  { name: 'Customers',          href: '/manager/customers',     icon: Crown },
  { name: 'Tasks',              href: '/manager/tasks',         icon: ListChecks },
  { name: 'Menu',               href: '/manager/menu',          icon: UtensilsCrossed },
  { name: 'Order History',      href: '/manager/order-history', icon: History },
  { name: 'Bulk Messages',      href: '/manager/messages',      icon: MessageSquare },
  { name: 'Payments',           href: '/manager/payments',      icon: CreditCard },
  { name: 'Reports',            href: '/manager/reports',       icon: BarChart3 },
]

export const frontDeskNav: NavItem[] = [
  { name: 'Dashboard',        href: '/front-desk',           icon: LayoutDashboard },
  { name: 'Orders',           href: '/front-desk/orders',    icon: PlusCircle },
  { name: 'Search & Inquiry', href: '/front-desk/search',    icon: Search },
  { name: 'Messaging',        href: '/front-desk/messaging', icon: MessageSquare },
  { name: 'Menu',             href: '/front-desk/menu',      icon: UtensilsCrossed },
  { name: 'Settings',         href: '/front-desk/settings',  icon: Settings },
]

export const inventoryNav: NavItem[] = [
  { name: 'Dashboard',        href: '/inventory',           icon: LayoutDashboard },
  { name: 'Stock In',         href: '/inventory/stock-in',  icon: PackagePlus },
  { name: 'Daily Rollout',    href: '/inventory/rollout',   icon: ScrollText },
  { name: 'Alerts & Reorder', href: '/inventory/alerts',    icon: AlertTriangle },
  { name: 'Expenses',         href: '/inventory/expenses',  icon: Receipt },
]

export const bakerNav: NavItem[] = [
  { name: 'Dashboard',        href: '/baker',             icon: LayoutDashboard },
  { name: 'Daily Production', href: '/baker/production',  icon: Layers },
  { name: 'Active Orders',    href: '/baker/active',      icon: Flame },
  { name: 'History',          href: '/baker/history',     icon: History },
]

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
  const isDark = variant === 'dark'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64',
        isLight && 'bg-white border-r border-rose-100 shadow-sm',
        isDark && 'bg-manager-bg',
      )}
      style={!isLight && !isDark ? { background: gradient } : undefined}
    >
      <div className="flex h-full flex-col">
        <div
          className={cn('flex h-16 shrink-0 items-center gap-3 px-5', isLight ? 'border-b border-rose-100' : 'border-b border-white/20')}
          style={isLight || isDark ? { background: HEADER_GRADIENT } : undefined}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">Bbr Bakeflow</h1>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-medium">{portalName}</p>
          </div>
        </div>

        {profilePlacement === 'top' && (
          <TopProfile isLight={isLight} userName={userName} roleLabel={roleLabel} />
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {isLight && (
            <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-rose-300">Menu</p>
          )}
          {nav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                  getNavLinkClass(isLight, isActive)
                )}
              >
                <item.icon className={getNavIconClass(isLight, isActive)} />
                {item.name}
              </Link>
            )
          })}
        </nav>

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
      authConfig={{ expectedRole: 'manager', loginPath: '/manager/login', defaultName: 'Manager' }}
      variant="dark"
      profilePlacement="bottom"
    />
  )
}

export function FrontDeskSidebar() {
  return (
    <PortalSidebar
      portalName="Front Desk"
      roleLabel="Front Desk Agent"
      nav={frontDeskNav}
      authConfig={{ expectedRole: 'front_desk', loginPath: '/', defaultName: 'Front Desk', requireAuth: false }}
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
      authConfig={{ expectedRole: 'inventory_clerk', loginPath: '/', defaultName: 'Store Clerk', requireAuth: false }}
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
      authConfig={{ expectedRole: 'baker', loginPath: '/baker/login', defaultName: 'Baker' }}
      variant="light"
      profilePlacement="bottom"
    />
  )
}

// ─── App sidebar (collapsible grouped nav, no auth) ───────────────────────────

const inventorySubNav: NavItem[] = [
  { name: 'Dashboard',        href: '/inventory',           icon: LayoutDashboard },
  { name: 'Stock In',         href: '/inventory/stock-in',  icon: PackagePlus },
  { name: 'Daily Rollout',    href: '/inventory/rollout',   icon: ScrollText },
  { name: 'Alerts & Reorder', href: '/inventory/alerts',    icon: AlertTriangle },
  { name: 'Access & Roles',   href: '/inventory/access',    icon: Users },
]

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
            items={frontDeskNav} pathname={pathname}
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
