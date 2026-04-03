'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Layers, Clock, Wheat, Croissant, Cookie, Cake } from 'lucide-react'
import type { DailyBatchItem } from '@/types/production'

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
  batch: DailyBatchItem
}

export function BatchCard({ batch }: Props) {
  const Icon = categoryIcons[batch.category] || Layers
  const colors = categoryColors[batch.category] || { bg: '#fce7ea', text: '#CA0123' }
  const usedPct = Math.round(((batch.quantityBaked - batch.quantityRemaining) / batch.quantityBaked) * 100)

  return (
    <Card className="border-0 shadow-sm bg-card overflow-hidden">
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: colors.bg }}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: colors.text }} />
          <p className="text-xs font-semibold capitalize" style={{ color: colors.text }}>{batch.category}</p>
        </div>
        <span className="text-[10px] font-mono" style={{ color: colors.text }}>{batch.id}</span>
      </div>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm text-foreground">{batch.productName}</p>
            <p className="text-xs text-muted-foreground">{batch.bakedBy}</p>
          </div>
          <Badge variant="outline" className="text-xs bg-transparent">
            {batch.quantityRemaining}/{batch.quantityBaked}
          </Badge>
        </div>

        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${usedPct}%`,
              background: usedPct > 80 ? '#CA0123' : usedPct > 50 ? '#e66386' : '#22c55e',
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{usedPct}% fulfilled</span>
          <span>{batch.quantityRemaining} remaining</span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(batch.bakedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {batch.notes && (
          <p className="text-xs rounded-lg p-2 border" style={{ background: '#fdf2f4', borderColor: '#fbd5db', color: '#e66386' }}>
            {batch.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
