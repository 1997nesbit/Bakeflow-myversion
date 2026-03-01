'use client'

import {
  LayoutDashboard,
  Flame,
  History,
  LogOut,
  ChefHat,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const bakerNav = [
  { name: 'Dashboard', href: '/portal/baker', icon: LayoutDashboard },
  { name: 'Active Orders', href: '/portal/baker/active', icon: Flame },
  { name: 'History', href: '/portal/baker/history', icon: History },
]

export function BakerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [bakerName, setBakerName] = useState('Baker')

  useEffect(() => {
    const auth = localStorage.getItem('baker_auth')
    if (!auth) {
      router.push('/portal/baker/login')
      return
    }
    try {
      const parsed = JSON.parse(auth)
      setBakerName(parsed.name || 'Baker')
    } catch {
      router.push('/portal/baker/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('baker_auth')
    router.push('/portal/baker/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64" style={{ background: 'linear-gradient(to bottom, #CA0123, #e66386)' }}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <ChefHat className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Baker Portal</h1>
            <p className="text-xs text-white/70">Bbr Bakeflow</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-white/20 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{bakerName}</p>
            <p className="text-xs text-white/60">{'Baker / QA'}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {bakerNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/25 text-white shadow-sm'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/20 p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <ChefHat className="h-5 w-5" />
            All Portals
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
