'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Order } from '@/types/order'
import { statusLabels, statusColors } from '@/data/constants/labels'
import { minutesSincePosted } from '@/lib/utils/date'
import {
  ChefHat,
  Timer,
  MapPin,
  User,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Link2,
  Copy,
} from 'lucide-react'

interface TrackingTabProps {
  inKitchenOrders: Order[]
  dispatchedOrders: Order[]
  mounted: boolean
  onSelectOrder: (order: Order) => void
  copyTrackingLink: (trackingId: string) => void
}

export function TrackingTab({
  inKitchenOrders,
  dispatchedOrders,
  mounted,
  onSelectOrder,
  copyTrackingLink,
}: TrackingTabProps) {
  const isEmpty = inKitchenOrders.length === 0 && dispatchedOrders.length === 0

  return (
    <div className="space-y-6">
      {dispatchedOrders.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">{dispatchedOrders.length}</span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-purple-800">Out for Delivery</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {dispatchedOrders.map(order => (
              <Card key={order.id} className={`shadow-sm bg-card ${order.driverAccepted ? 'border-2 border-green-300' : 'border-2 border-purple-200'}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    {order.driverAccepted ? (
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" /> Driver Accepted
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-100 text-purple-800 border-0 text-xs animate-pulse">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Waiting for Driver
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                    <span>{order.deliveryAddress}</span>
                  </div>
                  {order.driverAccepted && order.assignedTo && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-2 text-sm">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">{order.assignedTo} is delivering</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); copyTrackingLink(order.trackingId) }}
                    className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                    <Copy className="h-3 w-3 shrink-0" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{inKitchenOrders.length}</span>
          <h2 className="text-sm font-bold uppercase tracking-wide text-orange-800">In Kitchen</h2>
        </div>
        {inKitchenOrders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
            <ChefHat className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No orders in the kitchen</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {inKitchenOrders.map(order => {
              const elapsed = mounted && order.postedToBakerAt ? minutesSincePosted(order.postedToBakerAt) : 0
              const isOverdue = elapsed > order.estimatedMinutes
              const progress = Math.min((elapsed / order.estimatedMinutes) * 100, 100)
              return (
                <Card
                  key={order.id}
                  className={`border-0 shadow-sm bg-card cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'ring-2 ring-red-300' : ''}`}
                  onClick={() => onSelectOrder(order)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{order.id} - {order.customerName}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.items.map(i => i.name).join(', ')}</p>
                      </div>
                      <Badge className={`${statusColors[order.status]} border-0 text-xs shrink-0`}>{statusLabels[order.status]}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : progress > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {elapsed}m / {order.estimatedMinutes}m
                      </span>
                    </div>
                    {isOverdue && (
                      <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Overdue by {elapsed - order.estimatedMinutes}min
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {isEmpty && (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <Timer className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">Nothing to track right now</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Orders in production or delivery will appear here</p>
        </div>
      )}
    </div>
  )
}
