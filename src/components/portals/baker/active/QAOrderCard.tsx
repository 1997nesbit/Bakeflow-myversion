'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, RotateCcw, Palette } from 'lucide-react'
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
}

export function QAOrderCard({
  order, fulfillment, rejectingId, rejectNote,
  onRejectStart, onRejectCancel, onRejectNoteChange, onQAPass, onQAFail,
}: Props) {
  return (
    <Card className="border-2 shadow-sm overflow-hidden" style={{ borderColor: '#e66386' }}>
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: '#e66386' }}>
        <CheckCircle className="h-4 w-4 text-white" />
        <p className="text-xs font-semibold text-white">Quality Assurance</p>
        {fulfillment && (
          <Badge className="text-[10px] bg-white/20 text-white border-0 ml-auto">
            {fulfillment.method === 'from_batch' ? 'From Batch' : 'Fresh Bake'}
          </Badge>
        )}
      </div>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
          </div>
          <Badge variant="outline" className="text-xs bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
        </div>

        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="rounded-lg border p-3" style={{ background: '#fdf2f4', borderColor: '#fce7ea' }}>
              <div className="flex items-start justify-between">
                <p className="font-medium text-sm text-foreground">{item.name}</p>
                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
              </div>
              {item.isCustom && item.customCake && (
                <p className="text-xs mt-1" style={{ color: '#e66386' }}>
                  {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                  {item.customCake.description && ` - ${item.customCake.description}`}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
          <p className="text-sm font-medium mb-2" style={{ color: '#CA0123' }}>QA Checklist</p>
          <div className="space-y-1.5 text-xs" style={{ color: '#e66386' }}>
            <p>{'- Correct flavour and icing?'}</p>
            <p>{'- Proper texture, colour, consistency?'}</p>
            <p>{'- Correct weight/size?'}</p>
            <p>{'- No defects or damage?'}</p>
          </div>
        </div>

        {rejectingId === order.id ? (
          <div className="space-y-3">
            <Textarea
              placeholder="What needs fixing?"
              value={rejectNote}
              onChange={e => onRejectNoteChange(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onRejectCancel}>Cancel</Button>
              <Button size="sm" variant="destructive" className="flex-1" onClick={onQAFail}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />{'Fail → Re-bake'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-transparent" style={{ borderColor: '#fbd5db', color: '#CA0123' }} onClick={onRejectStart}>
              <XCircle className="mr-1.5 h-4 w-4" />Fail QA
            </Button>
            <Button className="flex-1 text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }} onClick={onQAPass}>
              <Palette className="mr-1.5 h-4 w-4" />{'Pass → Decorator'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
