'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Package, X, Flame } from 'lucide-react'
import type { Order } from '@/types/order'
import type { DailyBatchItem, FulfillmentMethod } from '@/types/production'

interface Props {
  order: Order | null
  findMatchingBatches: (order: Order) => DailyBatchItem[]
  onAccept: (orderId: string, method: FulfillmentMethod, batchItem?: DailyBatchItem) => void
  onClose: () => void
}

export function FulfillmentDialog({ order, findMatchingBatches, onAccept, onClose }: Props) {
  if (!order) return null
  const matchingBatches = findMatchingBatches(order)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 border-2 shadow-2xl bg-card" style={{ borderColor: '#e66386' }}>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#fce7ea' }}>
                <Package className="h-5 w-5" style={{ color: '#CA0123' }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">How to fulfill {order.id}?</h2>
                <p className="text-xs text-muted-foreground">
                  {order.customerName} -- {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#CA0123' }}>
                Take from today&apos;s batch
              </p>
              {matchingBatches.length === 0 ? (
                <p className="text-xs text-muted-foreground px-3 py-4 rounded-lg border border-dashed text-center">
                  No matching batches available
                </p>
              ) : (
                matchingBatches.map(batch => (
                  <button
                    key={batch.id}
                    type="button"
                    className="w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors hover:border-[#e66386]"
                    style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}
                    onClick={() => onAccept(order.id, 'from_batch', batch)}
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
                        {batch.quantityRemaining} {batch.unit} remaining &mdash; baked by {batch.bakedBy} at{' '}
                        {new Date(batch.bakedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#22c55e' }}>
                      From Batch
                    </Badge>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              type="button"
              className="w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors hover:border-[#CA0123]"
              style={{ borderColor: '#fbd5db' }}
              onClick={() => onAccept(order.id, 'bake_fresh')}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ background: '#fce7ea' }}>
                <Flame className="h-5 w-5" style={{ color: '#CA0123' }} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Bake Fresh</p>
                <p className="text-xs text-muted-foreground">
                  Start a new bake for this order (custom flavour, special request, etc.)
                </p>
              </div>
              <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#CA0123' }}>
                Fresh
              </Badge>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
