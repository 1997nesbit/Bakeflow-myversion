'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, Clock, FileText, Calendar, ThumbsUp, Package } from 'lucide-react'
import type { Order } from '@/types/order'
import { orderTypeLabels } from '@/data/constants/labels'

interface Props {
  order: Order
  hasBatchAvailable: boolean
  onAccept: () => void
  onViewDetails: () => void
}

export function IncomingOrderCard({ order, hasBatchAvailable, onAccept, onViewDetails }: Props) {
  const isCustom = order.orderType === 'custom'

  return (
    <Card
      className="border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      style={{ borderColor: '#fbd5db' }}
      onClick={onViewDetails}
    >
      <div className="flex items-stretch">
        <div className="w-1 shrink-0" style={{ background: '#e66386' }} />
        <div className="flex-1 px-4 py-3 space-y-2">
          {/* Main row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Bell className="h-3.5 w-3.5 shrink-0" style={{ color: '#e66386' }} />
              <p className="font-bold text-sm text-foreground truncate">
                {(order.items ?? []).map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ') || order.id}
              </p>
              <p className="text-xs text-muted-foreground shrink-0">{order.customer.name}</p>
              <Badge variant="outline" className="text-[10px] bg-transparent shrink-0">
                {orderTypeLabels[order.orderType]}
              </Badge>
              {!isCustom && hasBatchAvailable && (
                <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#22c55e' }}>
                  <Package className="mr-1 h-2.5 w-2.5" />Batch
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />Est. {order.estimatedMinutes}m
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />{order.pickupDate} {order.pickupTime}
              </span>
              <Button
                size="sm"
                className="h-7 px-3 text-xs text-white border-0"
                style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
                onClick={e => { e.stopPropagation(); onAccept() }}
              >
                <ThumbsUp className="mr-1 h-3 w-3" />
                {isCustom ? 'Accept & Bake Fresh' : 'Accept'}
              </Button>
            </div>
          </div>

          {/* Custom cake details */}
          {(order.items ?? []).some(i => i.isCustom && i.customCake) && (
            <div className="flex flex-wrap gap-1.5">
              {(order.items ?? []).filter(i => i.isCustom && i.customCake).map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs bg-muted/60 rounded px-2 py-0.5">
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
      </div>
    </Card>
  )
}
