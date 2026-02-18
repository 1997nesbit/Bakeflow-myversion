'use client'

import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ScrollText,
  AlertTriangle,
  Receipt,
  ChefHat,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/inventory', icon: LayoutDashboard },
  { name: 'Stock In', href: '/inventory/stock-in', icon: PackagePlus },
  { name: 'Daily Rollout', href: '/inventory/rollout', icon: ScrollText },
  { name: 'Alerts & Reorder', href: '/inventory/alerts', icon: AlertTriangle },
  { name: 'Expenses', href: '/inventory/expenses', icon: Receipt },
]

export function InventorySidebar() {
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
            <p className="text-xs text-sidebar-foreground/70">Inventory</p>
          </div>
        </div>

        {/* Portal badge */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
            <Package className="h-4 w-4 text-sidebar-accent-foreground" />
            <span className="text-sm font-semibold text-sidebar-accent-foreground">Inventory Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navigation.map((item) => {
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

        {/* Back to portals */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ChefHat className="h-5 w-5" />
            All Portals
          </Link>
        </div>
      </div>
    </aside>
  )
}
