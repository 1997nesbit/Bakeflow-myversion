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
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const mainNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Front Desk', href: '/front-desk', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Messaging', href: '/messaging', icon: MessageSquare },
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

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">Main</p>
          {mainNavigation.map((item) => {
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

          <p className="px-3 mt-6 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">Portals</p>
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

        {/* Settings */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  )
}
