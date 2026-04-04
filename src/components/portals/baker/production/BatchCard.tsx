'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Layers, Clock, FlaskConical } from 'lucide-react'
import type { DailyBatchItem } from '@/types/production'

interface Props {
  batch: DailyBatchItem
}

export function BatchCard({ batch }: Props) {
  const usedPct = Math.round(((batch.quantityBaked - batch.quantityRemaining) / batch.quantityBaked) * 100)

  return (
    <Card className="border-0 shadow-sm bg-card overflow-hidden">
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#fce7ea' }}>
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4" style={{ color: '#CA0123' }} />
          <p className="text-xs font-semibold" style={{ color: '#CA0123' }}>Batch</p>
        </div>
        <span className="text-[10px] font-mono" style={{ color: '#CA0123' }}>{batch.id}</span>
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

        {batch.ingredients.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border">
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              <FlaskConical className="h-3 w-3" />
              Ingredients
            </div>
            {batch.ingredients.map(ing => (
              <div key={ing.id} className="flex items-center justify-between text-xs">
                <span className="text-foreground">{ing.itemName}</span>
                <span className="text-muted-foreground">{ing.quantityUsed} {ing.itemUnit}</span>
              </div>
            ))}
          </div>
        )}

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
