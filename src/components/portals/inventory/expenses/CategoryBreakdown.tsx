'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryBreakdownItem {
  value: string
  label: string
  total: number
  count: number
}

interface Props {
  categoryBreakdown: CategoryBreakdownItem[]
  filterCategory: string
  totalExpenses: number
  onFilterChange: (value: string) => void
}

export function CategoryBreakdown({ categoryBreakdown, filterCategory, totalExpenses, onFilterChange }: Props) {
  return (
    <Card className="border-0 shadow-sm lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">By Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categoryBreakdown.map(cat => (
          <button
            key={cat.value}
            type="button"
            onClick={() => onFilterChange(filterCategory === cat.value ? 'all' : cat.value)}
            className={`w-full text-left rounded-lg p-2.5 transition-colors ${filterCategory === cat.value ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-foreground truncate">{cat.label.split('&')[0].trim()}</p>
              <p className="text-sm font-bold text-foreground">TZS {cat.total.toLocaleString()}</p>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${Math.min((cat.total / totalExpenses) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{cat.count} transaction{cat.count > 1 ? 's' : ''}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
