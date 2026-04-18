'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, RotateCcw, Palette, PackageCheck } from 'lucide-react'
import type { Order } from '@/types/order'
import type { FulfillmentChoice } from '@/types/production'
import { orderTypeLabels } from '@/data/constants/labels'

interface Props {
  order: Order
  fulfillment: FulfillmentChoice | undefined
  rejectingId: string | null
  rejectNote: string
  onRejectStart: () => void
  onRejectCancel: () => void
  onRejectNoteChange: (v: string) => void
  onQAPass: () => void
  onQAFail: () => void
  onViewDetails: () => void
}

export function QAOrderCard({
  order, fulfillment, rejectingId, rejectNote,
  onRejectStart, onRejectCancel, onRejectNoteChange, onQAPass, onQAFail, onViewDetails,
}: Props) {
  return (
    <Card
      className="border-2 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderColor: '#e66386' }}
      onClick={onViewDetails}
    >
      <div className="px-4 py-3 space-y-2">
        {/* Main row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: '#e66386' }} />
            <p className="font-bold text-sm text-foreground truncate">
              {(order.items ?? []).map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ') || order.id}
            </p>
            <p className="text-xs text-muted-foreground shrink-0">{order.customer.name}</p>
            <Badge variant="outline" className="text-[10px] bg-transparent shrink-0">
              {orderTypeLabels[order.orderType]}
            </Badge>
            {fulfillment && (
              <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#e66386' }}>
                {fulfillment.method === 'from_batch' ? 'From Batch' : 'Fresh Bake'}
              </Badge>
            )}
          </div>
          {rejectingId !== order.id && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-3 bg-transparent text-xs"
                style={{ borderColor: '#fbd5db', color: '#CA0123' }}
                onClick={e => { e.stopPropagation(); onRejectStart() }}
              >
                <XCircle className="mr-1 h-3 w-3" />Fail QA
              </Button>
              <Button
                size="sm"
                className="h-7 px-3 text-white border-0 text-xs"
                style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
                onClick={e => { e.stopPropagation(); onQAPass() }}
              >
                {order.orderType === 'custom'
                  ? <><Palette className="mr-1 h-3 w-3" />Pass → Decorator</>
                  : <><PackageCheck className="mr-1 h-3 w-3" />Pass → Ready</>
                }
              </Button>
            </div>
          )}
        </div>

        {/* Custom cake details */}
        {(order.items ?? []).some(i => i.isCustom && i.customCake) && (
          <div className="flex flex-wrap gap-1.5">
            {(order.items ?? []).filter(i => i.isCustom && i.customCake).map((item, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs rounded px-2 py-0.5" style={{ background: '#fdf2f4' }}>
                <span className="font-medium">{item.name}</span>
                <span style={{ color: '#e66386' }}>
                  · {item.customCake!.flavour} · {item.customCake!.icingType} · {item.customCake!.kilogram}kg
                  {item.customCake!.description && ` — ${item.customCake!.description}`}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* QA checklist inline */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs" style={{ color: '#e66386' }}>
          <span>✓ Flavour & icing</span>
          <span>✓ Texture & colour</span>
          <span>✓ Weight / size</span>
          <span>✓ No defects</span>
        </div>

        {/* Reject form */}
        {rejectingId === order.id && (
          <div className="space-y-2">
            <Textarea
              placeholder="What needs fixing?"
              value={rejectNote}
              onChange={e => onRejectNoteChange(e.target.value)}
              className="min-h-[52px] text-sm"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={e => { e.stopPropagation(); onRejectCancel() }}>Cancel</Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={e => { e.stopPropagation(); onQAFail() }}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Fail → Re-bake
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
