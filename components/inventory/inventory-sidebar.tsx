'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  PackagePlus,
  ScrollText,
  AlertTriangle,
  Receipt,
  ChefHat,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [userName, setUserName] = useState('Store Clerk')

  useEffect(() => {
    const stored = localStorage.getItem('bbr_inventory_user')
    if (stored) {
      try { setUserName(JSON.parse(stored).name || 'Store Clerk') } catch { setUserName('Store Clerk') }
    } else {
      router.push('/inventory/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('bbr_inventory_user')
    router.push('/inventory/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-foreground">
            <ChefHat className="h-6 w-6 text-sidebar-background" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Bbr Bakeflow</h1>
            <p className="text-xs text-sidebar-foreground/70">Inventory</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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

        <div className="border-t border-sidebar-border p-3">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/90 transition-colors hover:bg-sidebar-accent"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-4 w-4 text-sidebar-accent-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                <p className="text-xs text-sidebar-foreground/60">Inventory Clerk</p>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-sidebar-foreground/60 transition-transform', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-sidebar-border bg-card p-1 shadow-lg">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <ChefHat className="h-4 w-4" />
                  All Portals
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
