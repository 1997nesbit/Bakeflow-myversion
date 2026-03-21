'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Order } from '@/types/order'
import {
  ChefHat,
  Truck,
  Package,
  CreditCard,
  Calendar,
  Clock,
  Timer,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle,
  Send,
  Link2,
  Copy,
} from 'lucide-react'

interface ActionCenterTabProps {
  paidOrders: Order[]
  readyDeliveryOrders: Order[]
  readyPickupOrders: Order[]
  onPostToBaker: (orderId: string) => void
  onDispatchToDriver: (orderId: string) => void
  onMarkPickedUp: (orderId: string) => void
  onOpenMessage: (order: Order) => void
  copyTrackingLink: (trackingId: string) => void
}

export function ActionCenterTab({
  paidOrders,
  readyDeliveryOrders,
  readyPickupOrders,
  onPostToBaker,
  onDispatchToDriver,
  onMarkPickedUp,
  onOpenMessage,
  copyTrackingLink,
}: ActionCenterTabProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* Post to Baker */}
      <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">{paidOrders.length}</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Post to Baker</h2>
        </div>
        <p className="text-xs text-emerald-700/70 mb-3">Paid orders ready to send to the kitchen</p>
        {paidOrders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-emerald-200 py-8 text-center">
            <ChefHat className="mx-auto h-8 w-8 text-emerald-300 mb-2" />
            <p className="text-sm text-muted-foreground">No orders waiting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidOrders.map(order => (
              <Card key={order.id} className="border-0 shadow-sm bg-card">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs shrink-0">
                      <CreditCard className="mr-1 h-3 w-3" />
                      {order.paymentStatus === 'deposit' ? 'Deposit' : 'Paid'}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground truncate">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />{order.pickupDate}
                    <Clock className="h-3 w-3 ml-1" />{order.pickupTime}
                    <Timer className="h-3 w-3 ml-1" />~{order.estimatedMinutes}min
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTrackingLink(order.trackingId)}
                    className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                    <Copy className="h-3 w-3 shrink-0" />
                  </button>
                  <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => onPostToBaker(order.id)}>
                    <ChefHat className="mr-1 h-4 w-4" /> Post to Baker
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Dispatch to Driver */}
      <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{readyDeliveryOrders.length}</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">Dispatch to Driver</h2>
        </div>
        <p className="text-xs text-blue-700/70 mb-3">Packed orders that need delivery dispatch</p>
        {readyDeliveryOrders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-blue-200 py-8 text-center">
            <Truck className="mx-auto h-8 w-8 text-blue-300 mb-2" />
            <p className="text-sm text-muted-foreground">No delivery orders ready</p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyDeliveryOrders.map(order => (
              <Card key={order.id} className="border-0 shadow-sm bg-card">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-0 text-xs shrink-0">
                      <Truck className="mr-1 h-3 w-3" /> Delivery
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 space-y-1">
                    <div className="flex items-start gap-1.5 text-xs text-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 text-blue-600 shrink-0" />
                      <span className="font-medium">{order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{order.customerPhone}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTrackingLink(order.trackingId)}
                    className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                    <Copy className="h-3 w-3 shrink-0" />
                  </button>
                  <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => onDispatchToDriver(order.id)}>
                    <Send className="mr-1 h-4 w-4" /> Send to Driver
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Customer Pickup */}
      <section className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">{readyPickupOrders.length}</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-green-800">Customer Pickup</h2>
        </div>
        <p className="text-xs text-green-700/70 mb-3">Ready orders waiting for customer pickup</p>
        {readyPickupOrders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-green-200 py-8 text-center">
            <Package className="mx-auto h-8 w-8 text-green-300 mb-2" />
            <p className="text-sm text-muted-foreground">No pickup orders ready</p>
          </div>
        ) : (
          <div className="space-y-3">
            {readyPickupOrders.map(order => (
              <Card key={order.id} className="border-0 shadow-sm bg-card">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0 text-xs shrink-0">
                      <Package className="mr-1 h-3 w-3" /> Pickup
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground truncate">{order.items.map(i => i.name).join(', ')}</p>
                  <button
                    type="button"
                    onClick={() => copyTrackingLink(order.trackingId)}
                    className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                    <Copy className="h-3 w-3 shrink-0" />
                  </button>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => {
                      if (order.customerPhone) window.open(`tel:${order.customerPhone}`, '_self')
                      toast.info(`Calling ${order.customerName}...`)
                    }}>
                      <Phone className="mr-1 h-3.5 w-3.5" /> Call Customer
                    </Button>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent" onClick={() => onOpenMessage(order)}>
                        <MessageSquare className="mr-1 h-3.5 w-3.5" /> Text
                      </Button>
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => onMarkPickedUp(order.id)}>
                        <CheckCircle className="mr-1 h-3.5 w-3.5" /> Picked Up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
