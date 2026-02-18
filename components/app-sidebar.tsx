'use client'

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  MessageSquare,
  Settings,
  ChefHat,
  Search,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  PackagePlus,
  ScrollText,
  AlertTriangle,
  Users,
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

const inventorySubNav = [
  { name: 'Dashboard', href: '/inventory', icon: LayoutDashboard },
  { name: 'Stock In', href: '/inventory/stock-in', icon: PackagePlus },
  { name: 'Daily Rollout', href: '/inventory/rollout', icon: ScrollText },
  { name: 'Alerts & Reorder', href: '/inventory/alerts', icon: AlertTriangle },
  { name: 'Access & Roles', href: '/inventory/access', icon: Users },
]



function SidebarSection({
  label,
  icon: Icon,
  title,
  isActive,
  isOpen,
  onToggle,
  items,
  pathname,
}: {
  label: string
  icon: React.ElementType
  title: string
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
  items: { name: string; href: string; icon: React.ElementType }[]
  pathname: string
}) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
        {label}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          {title}
        </span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
          {items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-foreground">
            <ChefHat className="h-6 w-6 text-sidebar-background" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Bbr Bakeflow</h1>
            <p className="text-xs text-sidebar-foreground/70">Bakery Operations</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          <SidebarSection
            label="Front Desk"
            icon={ShoppingCart}
            title="Front Desk Portal"
            isActive={isFrontDeskActive}
            isOpen={frontDeskOpen}
            onToggle={() => setFrontDeskOpen(!frontDeskOpen)}
            items={frontDeskSubNav}
            pathname={pathname}
          />

          <SidebarSection
            label="Operations"
            icon={Package}
            title="Inventory Portal"
            isActive={isInventoryActive}
            isOpen={inventoryOpen}
            onToggle={() => setInventoryOpen(!inventoryOpen)}
            items={inventorySubNav}
            pathname={pathname}
          />


        </nav>
      </div>
    </aside>
  )
}
