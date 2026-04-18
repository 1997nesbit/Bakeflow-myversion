'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import type { InventoryItem } from '@/types/inventory'

interface Props {
  inventory: InventoryItem[]
}

export function StockLevelGrid({ inventory }: Props) {
  return (
    <Card className="border-0 shadow-sm lg:col-span-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Stock Levels</CardTitle>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Low</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {inventory.map(item => {
          const pct = Math.min((item.quantity / (item.minStock * 2)) * 100, 100)
          const ratio = item.quantity / item.minStock
          const color = ratio < 0.5 ? 'bg-red-500' : ratio < 1 ? 'bg-amber-500' : 'bg-emerald-500'
          return (
            <div key={item.id} className="flex items-center gap-3">
              <p className="w-36 text-sm font-medium text-foreground truncate">{item.name}</p>
              <div className="flex-1">
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <div className={`h-2.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <p className="w-20 text-right text-xs text-muted-foreground">{item.quantity} / {item.minStock * 2} {item.unit}</p>
              {ratio < 1 && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
