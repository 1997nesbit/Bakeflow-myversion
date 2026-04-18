'use client'

import { Layers, Wheat, Croissant, Cookie, Cake } from 'lucide-react'

const categoryIcons: Record<string, typeof Wheat> = {
  bread: Wheat,
  pastry: Croissant,
  snack: Cookie,
  cake: Cake,
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  bread: { bg: '#fce7ea', text: '#CA0123' },
  pastry: { bg: '#fdf2f4', text: '#e66386' },
  snack: { bg: '#fce7ea', text: '#CA0123' },
  cake: { bg: '#fdf2f4', text: '#e66386' },
}

interface Props {
  byCategory: Record<string, number>
}

export function CategorySummaryGrid({ byCategory }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Object.entries(byCategory).map(([cat, remaining]) => {
        const Icon = categoryIcons[cat] || Layers
        const colors = categoryColors[cat] || { bg: '#fce7ea', text: '#CA0123' }
        return (
          <div key={cat} className="rounded-xl border p-3 bg-card flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: colors.bg }}>
              <Icon className="h-5 w-5" style={{ color: colors.text }} />
            </span>
            <div>
              <p className="text-lg font-bold text-foreground">{remaining}</p>
              <p className="text-xs text-muted-foreground capitalize">{cat} left</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
