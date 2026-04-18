'use client'

import Link from 'next/link'
import { LayoutGrid, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineFooterProps {
  isLight: boolean
  logout: () => void
}

export function InlineFooter({ isLight, logout }: Readonly<InlineFooterProps>) {
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
