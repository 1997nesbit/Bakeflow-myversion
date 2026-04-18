'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  X, User, Phone, Calendar, Clock, MapPin, CreditCard,
  FileText, Cake, Package, Star,
} from 'lucide-react'
import type { Order } from '@/types/order'
import { orderTypeLabels, statusLabels, statusColors, paymentMethodLabels } from '@/data/constants/labels'

interface Props {
  order: Order | null
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: Props) {
  if (!order) return null

  const balance = order.totalPrice - order.amountPaid

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-lg mx-4 border-2 shadow-2xl bg-card overflow-hidden"
        style={{ borderColor: '#e66386', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
          <div>
            <p className="text-xs text-white/70 font-medium uppercase tracking-wider">Order Details</p>
            <p className="text-sm font-bold text-white">
              {(order.items ?? []).map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ') || order.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`text-xs border-0 ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </Badge>
            <button type="button" onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <CardContent className="p-5 space-y-5">
          {/* Customer */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                {order.customer.name}
                {order.customer.isGold && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-foreground">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {order.customer.phone}
              </span>
              {order.customer.email && (
                <span className="text-sm text-muted-foreground">{order.customer.email}</span>
              )}
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Order meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</p>
              <Badge variant="outline" className="text-xs bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Est. Time</p>
              <p className="text-sm text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />{order.estimatedMinutes} min
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pickup Date</p>
              <p className="text-sm text-foreground flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />{order.pickupDate}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pickup Time</p>
              <p className="text-sm text-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />{order.pickupTime}
              </p>
            </div>
            {order.deliveryType === 'delivery' && order.deliveryAddress && (
              <div className="col-span-2 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delivery Address</p>
                <p className="text-sm text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />{order.deliveryAddress}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Items */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
            <div className="space-y-2">
              {(order.items ?? []).map((item, idx) => (
                <div key={idx} className="rounded-lg border p-3 space-y-1.5" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                  </div>
                  {item.isCustom && item.customCake && (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Cake className="h-3 w-3 shrink-0" style={{ color: '#e66386' }} />
                        <p className="text-xs" style={{ color: '#CA0123' }}>
                          {item.customCake.flavour} · {item.customCake.icingType} · {item.customCake.kilogram}kg
                        </p>
                      </div>
                      {item.customCake.description && (
                        <p className="text-xs text-muted-foreground pl-5">{item.customCake.description}</p>
                      )}
                    </div>
                  )}
                  {item.customization && (
                    <p className="text-xs text-muted-foreground">{item.customization}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {(order.noteForCustomer || order.specialNotes) && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</p>
                {order.noteForCustomer && (
                  <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: '#fce7ea', borderColor: '#fbd5db' }}>
                    <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#CA0123' }} />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#CA0123' }}>Write on cake</p>
                      <p className="text-sm" style={{ color: '#CA0123' }}>"{order.noteForCustomer}"</p>
                    </div>
                  </div>
                )}
                {order.specialNotes && (
                  <div className="flex items-start gap-2 rounded-lg p-3" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
                    <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: '#e66386' }} />
                    <p className="text-sm" style={{ color: '#e66386' }}>{order.specialNotes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-border" />

          {/* Payment */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</p>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {order.paymentMethod ? paymentMethodLabels[order.paymentMethod] : '—'}
                </span>
                <span className="text-xs text-muted-foreground">· {order.paymentTerms === 'upfront' ? 'Upfront' : 'On Delivery'}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">TZS {order.totalPrice.toLocaleString()}</p>
                {balance > 0 && (
                  <p className="text-xs text-amber-600">Balance: TZS {balance.toLocaleString()}</p>
                )}
                {balance === 0 && (
                  <p className="text-xs text-green-600">Fully paid</p>
                )}
              </div>
            </div>
          </div>

          {/* Tracking ID */}
          {order.trackingId && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <Package className="h-3 w-3" />
              Tracking: {order.trackingId}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
