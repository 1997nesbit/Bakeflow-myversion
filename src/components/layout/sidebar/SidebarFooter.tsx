'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User, ChevronDown, LogOut, Settings, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarFooterProps {
  isLight: boolean
  userName: string
  roleLabel: string
  logout: () => void
}

export function SidebarFooter({ isLight, userName, roleLabel, logout }: Readonly<SidebarFooterProps>) {
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
          <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-rose-100 bg-white p-1 shadow-lg">
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700"
            >
              <UserCircle className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-700"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <div className="my-1 border-t border-rose-100" />
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
