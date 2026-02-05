'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Order, statusLabels, statusColors, orderTypeLabels } from '@/lib/mock-data'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react'

interface OrderDetailProps {
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void
}

const statusFlow: Order['status'][] = [
  'pending',
  'baker',
  'decorator',
  'quality',
  'packing',
  'ready',
  'delivered',
]

export function OrderDetail({ order, onClose, onUpdateStatus }: OrderDetailProps) {
  const currentIndex = statusFlow.indexOf(order.status)
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-semibold">{order.id}</CardTitle>
            <Badge className={`${statusColors[order.status]} border-0`}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {orderTypeLabels[order.orderType]} Order
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Customer Info */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Customer</h3>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="font-semibold text-foreground">{order.customerName}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{order.customerPhone}</span>
            </div>
            {order.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{order.customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  {item.customization && (
                    <p className="text-sm text-muted-foreground">
                      {item.customization}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="font-medium text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">
              ${order.totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pickup / Delivery */}
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">
            {order.isDelivery ? 'Delivery' : 'Pickup'} Details
          </h3>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{order.pickupDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{order.pickupTime}</span>
            </div>
            {order.isDelivery && order.deliveryAddress && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <span className="text-foreground">{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Special Notes */}
        {order.specialNotes && (
          <div className="space-y-3">
            <h3 className="font-medium text-foreground">Special Notes</h3>
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-4">
              <FileText className="h-4 w-4 mt-0.5 text-amber-600" />
              <p className="text-sm text-amber-800">{order.specialNotes}</p>
            </div>
          </div>
        )}

        {/* Status Update */}
        {nextStatus && (
          <div className="border-t pt-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              Move to {statusLabels[nextStatus]}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
