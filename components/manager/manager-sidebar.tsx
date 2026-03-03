'use client'

import {
  LayoutDashboard, Users, Settings, Banknote,
  Crown, ListChecks, History, MessageSquare,
  CreditCard, BarChart3, LogOut, ChefHat, User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const managerNav = [
  { name: 'Dashboard', href: '/manager', icon: LayoutDashboard },
  { name: 'User Management', href: '/manager/users', icon: Users },
  { name: 'Account Management', href: '/manager/accounts', icon: Settings },
  { name: 'Debts', href: '/manager/debts', icon: Banknote },
  { name: 'Customers', href: '/manager/customers', icon: Crown },
  { name: 'Tasks', href: '/manager/tasks', icon: ListChecks },
  { name: 'Task History', href: '/manager/task-history', icon: History },
  { name: 'Bulk Messages', href: '/manager/messages', icon: MessageSquare },
  { name: 'Payments', href: '/manager/payments', icon: CreditCard },
  { name: 'Reports', href: '/manager/reports', icon: BarChart3 },
]

export function ManagerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [managerName, setManagerName] = useState('Manager')

  useEffect(() => {
    const auth = localStorage.getItem('bbr_manager_auth')
    if (!auth) { router.push('/manager/login'); return }
    try { setManagerName(JSON.parse(auth).name || 'Manager') } catch { router.push('/manager/login') }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('bbr_manager_auth')
    router.push('/manager/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#1a0a0e]">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CA0123]">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Bbr Bakeflow</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-wider">Manager Portal</p>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CA0123]/20">
            <User className="h-4 w-4 text-[#e66386]" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{managerName}</p>
            <p className="text-[10px] text-white/40">Administrator</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {managerNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-[#CA0123] text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 space-y-0.5">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/50 hover:bg-white/5 hover:text-white/80">
            <ChefHat className="h-4 w-4" />
            All Portals
          </Link>
          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-white/50 hover:bg-white/5 hover:text-white/80">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
