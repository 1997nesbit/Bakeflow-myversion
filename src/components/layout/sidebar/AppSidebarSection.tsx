'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavItem } from './PortalSidebar'

interface AppSidebarSectionProps {
  label: string
  icon: LucideIcon
  title: string
  isActive: boolean
  isOpen: boolean
  onToggle: () => void
  items: NavItem[]
  pathname: string
}

export function AppSidebarSection({
  label, icon: Icon, title, isActive, isOpen, onToggle, items, pathname,
}: Readonly<AppSidebarSectionProps>) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">{label}</p>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
        )}
      >
        <span className="flex items-center gap-3"><Icon className="h-5 w-5" />{title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-white/20 pl-3">
          {items.map((item) => {
            if (!item.href) return null
            const active = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-white/25 text-white' : 'text-white/70 hover:bg-white/15 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />{item.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
