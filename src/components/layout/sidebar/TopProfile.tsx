'use client'

import { User } from 'lucide-react'

interface TopProfileProps {
  isLight: boolean
  userName: string
  roleLabel: string
}

export function TopProfile({ isLight, userName, roleLabel }: Readonly<TopProfileProps>) {
  if (isLight) {
    return (
      <div className="mx-3 mt-3 mb-1 flex items-center gap-3 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 shadow-sm">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-rose-900 truncate">{userName}</p>
          <p className="text-[11px] text-rose-400 font-medium">{roleLabel}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-3 border-b border-white/20 px-5 py-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
        <User className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{userName}</p>
        <p className="text-xs text-white/60">{roleLabel}</p>
      </div>
    </div>
  )
}
