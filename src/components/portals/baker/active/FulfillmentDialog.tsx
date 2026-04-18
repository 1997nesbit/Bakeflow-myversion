'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Package, X, Check } from 'lucide-react'
import type { Order } from '@/types/order'
import type { DailyBatchItem } from '@/types/production'

interface Props {
  order: Order | null
  availableBatches: DailyBatchItem[]
  onAccept: (orderId: string, method: 'from_batch', batchItem: DailyBatchItem) => void
  onClose: () => void
}

export function FulfillmentDialog({ order, availableBatches, onAccept, onClose }: Props) {
  const [selected, setSelected] = useState<DailyBatchItem | null>(null)

  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card
        className="w-full max-w-md mx-4 border-2 shadow-2xl bg-card"
        style={{ borderColor: '#e66386', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#fce7ea' }}>
                <Package className="h-5 w-5" style={{ color: '#CA0123' }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Pick a batch</h2>
                <p className="text-xs text-muted-foreground">
                  {(order.items ?? []).map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ') || order.id}
                  {' — '}{order.customer.name}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Batch list */}
          {availableBatches.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">No batches available</p>
              <p className="text-xs text-muted-foreground mt-1">Add items to today's production before accepting this order</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableBatches.map(batch => (
                <button
                  key={batch.id}
                  type="button"
                  className="w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors"
                  style={{
                    borderColor: selected?.id === batch.id ? '#CA0123' : '#fbd5db',
                    background: selected?.id === batch.id ? '#fce7ea' : '#fdf2f4',
                  }}
                  onClick={() => setSelected(batch)}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shrink-0"
                    style={{ background: '#e66386' }}
                  >
                    {batch.quantityRemaining}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{batch.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {batch.quantityRemaining} remaining &mdash; baked by {batch.bakedBy}
                    </p>
                  </div>
                  {selected?.id === batch.id && (
                    <Check className="h-5 w-5 shrink-0" style={{ color: '#CA0123' }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Confirm */}
          <Button
            className="w-full h-10 text-white border-0"
            style={selected ? { background: 'linear-gradient(135deg, #CA0123, #e66386)' } : undefined}
            disabled={!selected}
            onClick={() => selected && onAccept(order.id, 'from_batch', selected)}
          >
            Accept Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
