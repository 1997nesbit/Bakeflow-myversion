'use client'

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  MessageSquare,
  Settings,
  ChefHat,
  Palette,
  ClipboardCheck,
  PackageCheck,
  Search,
  PlusCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const frontDeskSubNav = [
  { name: 'Dashboard', href: '/front-desk', icon: LayoutDashboard },
  { name: 'Orders', href: '/front-desk/orders', icon: PlusCircle },
  { name: 'Search & Inquiry', href: '/front-desk/search', icon: Search },
  { name: 'Messaging', href: '/front-desk/messaging', icon: MessageSquare },
  { name: 'Settings', href: '/front-desk/settings', icon: Settings },
]

const otherNavigation = [
  { name: 'Inventory', href: '/inventory', icon: Package },
]

const portalNavigation = [
  { name: 'Baker Portal', href: '/portal/baker', icon: ChefHat },
  { name: 'Decorator Portal', href: '/portal/decorator', icon: Palette },
  { name: 'Quality Check', href: '/portal/quality', icon: ClipboardCheck },
  { name: 'Packing Portal', href: '/portal/packing', icon: PackageCheck },
  { name: 'Driver Portal', href: '/portal/driver', icon: Truck },
]

export function AppSidebar() {
  const pathname = usePathname()
  const isFrontDeskActive = pathname.startsWith('/front-desk')
  const [frontDeskOpen, setFrontDeskOpen] = useState(isFrontDeskActive)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-foreground">
            <ChefHat className="h-6 w-6 text-sidebar-background" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Bbr Bakeflow</h1>
            <p className="text-xs text-sidebar-foreground/70">Bakery Operations</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {/* Front Desk Section */}
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Front Desk
          </p>
          <button
            type="button"
            onClick={() => setFrontDeskOpen(!frontDeskOpen)}
            className={cn(
              'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isFrontDeskActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <span className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              Front Desk Portal
            </span>
            {frontDeskOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {frontDeskOpen && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
              {frontDeskSubNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Other */}
          <p className="px-3 mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Operations
          </p>
          {otherNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}

          {/* Portals */}
          <p className="px-3 mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Portals
          </p>
          {portalNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
