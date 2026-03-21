'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Clock, Cake, FileText, Calendar, ThumbsUp, Package } from 'lucide-react'
import type { Order } from '@/types/order'
import type { DailyBatchItem } from '@/types/production'
import { orderTypeLabels } from '@/data/constants/labels'

interface Props {
  order: Order
  matchingBatches: DailyBatchItem[]
  onAccept: () => void
}

export function IncomingOrderCard({ order, matchingBatches, onAccept }: Props) {
  const isCustom = order.orderType === 'custom'

  return (
    <Card className="border-2 shadow-sm overflow-hidden" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
      <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#e66386' }}>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-white" />
          <p className="text-xs font-semibold text-white">New from Front Desk</p>
        </div>
        {!isCustom && matchingBatches.length > 0 && (
          <Badge className="text-[10px] bg-white/20 text-white border-0">
            <Package className="mr-1 h-3 w-3" />
            Batch available
          </Badge>
        )}
      </div>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground">{order.customerName}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs bg-transparent">
              {orderTypeLabels[order.orderType]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              Est. {order.estimatedMinutes}m
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-card border border-border p-3">
              <div className="flex items-start justify-between">
                <p className="font-medium text-sm text-foreground">{item.name}</p>
                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
              </div>
              {item.isCustom && item.customCake && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Cake className="h-3 w-3 shrink-0" style={{ color: '#e66386' }} />
                  <p className="text-xs" style={{ color: '#CA0123' }}>
                    {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {order.cakeDescription && (
          <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: '#fce7ea', borderColor: '#fbd5db' }}>
            <Cake className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#CA0123' }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#CA0123' }}>Cake Description</p>
              <p className="text-xs" style={{ color: '#CA0123' }}>{order.cakeDescription}</p>
            </div>
          </div>
        )}

        {order.noteForCustomer && (
          <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
            <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#e66386' }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#e66386' }}>Write on cake</p>
              <p className="text-xs text-foreground">{order.noteForCustomer}</p>
            </div>
          </div>
        )}

        {order.specialNotes && (
          <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
            <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#e66386' }} />
            <p className="text-xs" style={{ color: '#CA0123' }}>{order.specialNotes}</p>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
        </div>

        <Button
          className="w-full h-11 text-white border-0"
          style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
          onClick={onAccept}
        >
          <ThumbsUp className="mr-2 h-4 w-4" />
          {isCustom ? 'Accept & Bake Fresh' : 'Accept Order'}
        </Button>
      </CardContent>
    </Card>
  )
}
