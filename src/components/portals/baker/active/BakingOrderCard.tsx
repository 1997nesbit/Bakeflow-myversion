'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Play, Pause, CheckCircle, FileText, Layers } from 'lucide-react'
import type { Order } from '@/types/order'
import type { BulkBatch, FulfillmentChoice } from '@/types/production'
import { orderTypeLabels } from '@/data/constants/labels'

interface TimerDisplay {
  min: number
  sec: number
  pct: number
  running: boolean
  overdue: boolean
}

interface Props {
  order: Order
  td: TimerDisplay
  fulfillment: FulfillmentChoice | undefined
  batch: BulkBatch | undefined
  hasTimer: boolean
  onStartTimer: () => void
  onPauseTimer: () => void
  onSendToQA: () => void
  onViewDetails: () => void
}

export function BakingOrderCard({
  order, td, fulfillment, batch, hasTimer,
  onStartTimer, onPauseTimer, onSendToQA, onViewDetails,
}: Props) {
  return (
    <Card
      className="border-2 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      style={{
        borderColor: td.overdue ? '#CA0123' : td.running ? '#e66386' : '#fbd5db',
        background: td.overdue || td.running ? '#fdf2f4' : undefined,
      }}
      onClick={onViewDetails}
    >
      <div className="px-4 py-3 space-y-2">
        {/* Main row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Order info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <p className="font-bold text-sm text-foreground truncate">
              {(order.items ?? []).map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ') || order.id}
            </p>
            <p className="text-xs text-muted-foreground shrink-0">{order.customer.name}</p>
            <Badge variant="outline" className="text-[10px] bg-transparent shrink-0">
              {orderTypeLabels[order.orderType]}
            </Badge>
            {fulfillment && (
              <Badge
                className="text-[10px] text-white border-0 shrink-0"
                style={{ background: fulfillment.method === 'from_batch' ? '#22c55e' : '#CA0123' }}
              >
                {fulfillment.method === 'from_batch' ? `Batch: ${fulfillment.batchItemName}` : 'Fresh'}
              </Badge>
            )}
            {batch && (
              <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#e66386' }}>
                <Layers className="mr-1 h-2.5 w-2.5" />{batch.name}
              </Badge>
            )}
          </div>

          {/* Status */}
          {td.overdue ? (
            <Badge className="text-white border-0 animate-pulse text-xs shrink-0" style={{ background: '#CA0123' }}>OVERDUE</Badge>
          ) : td.running ? (
            <Badge className="text-white border-0 text-xs shrink-0" style={{ background: '#e66386' }}>BAKING</Badge>
          ) : (
            <Badge variant="outline" className="bg-transparent text-xs shrink-0">READY</Badge>
          )}

          {/* Timer inline */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-mono font-bold text-sm tabular-nums"
              style={{ color: td.overdue ? '#CA0123' : undefined }}
            >
              {String(td.min).padStart(2, '0')}:{String(td.sec).padStart(2, '0')}
            </span>
            <span className="text-xs text-muted-foreground">/ {order.estimatedMinutes}m</span>
            <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${td.pct}%`,
                  background: td.overdue ? '#CA0123' : td.pct > 75 ? '#e66386' : '#22c55e',
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {td.pct >= 100 ? (
              <Button
                size="sm"
                className="h-7 px-3 text-white border-0 text-xs animate-pulse"
                style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
                onClick={e => { e.stopPropagation(); onSendToQA() }}
              >
                <CheckCircle className="mr-1 h-3 w-3" />Done → QA
              </Button>
            ) : (
              <>
                {!hasTimer || !td.running ? (
                  <Button size="sm" className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white border-0 text-xs" onClick={e => { e.stopPropagation(); onStartTimer() }}>
                    <Play className="mr-1 h-3 w-3" />{hasTimer ? 'Resume' : 'Start'}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-7 px-3 bg-transparent text-xs" onClick={e => { e.stopPropagation(); onPauseTimer() }}>
                    <Pause className="mr-1 h-3 w-3" />Pause
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Custom cake details */}
        {(order.items ?? []).some(i => i.isCustom && i.customCake) && (
          <div className="flex flex-wrap gap-1.5">
            {(order.items ?? []).filter(i => i.isCustom && i.customCake).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs bg-muted/50 rounded px-2 py-0.5">
                <span className="font-medium">{item.name}</span>
                <span style={{ color: '#e66386' }}>
                  · {item.customCake!.flavour} · {item.customCake!.icingType} · {item.customCake!.kilogram}kg
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {(order.noteForCustomer || order.specialNotes) && (
          <div className="flex flex-wrap gap-2">
            {order.noteForCustomer && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" style={{ background: '#fdf2f4', color: '#e66386' }}>
                <FileText className="h-3 w-3 shrink-0" />"{order.noteForCustomer}"
              </span>
            )}
            {order.specialNotes && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" style={{ background: '#fdf2f4', color: '#e66386' }}>
                <FileText className="h-3 w-3 shrink-0" />{order.specialNotes}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
