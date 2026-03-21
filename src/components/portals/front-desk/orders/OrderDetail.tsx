'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/order'
import { statusLabels, statusColors, orderTypeLabels } from '@/data/constants/labels'
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  FileText,
  ChefHat,
  MessageSquare,
  CreditCard,
  Truck,
  AlertTriangle,
} from 'lucide-react'

interface OrderDetailProps {
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void
  onPostToBaker?: (orderId: string) => void
  onMessage?: (order: Order) => void
}

export function OrderDetail({ order, onClose, onPostToBaker, onMessage }: OrderDetailProps) {
  const canPostToBaker = order.status === 'paid'
  const balanceDue = order.totalPrice - order.amountPaid

  return (
    <Card className="border-0 shadow-lg bg-card">
      <CardHeader className="flex flex-row items-start justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-semibold text-foreground">{order.id}</CardTitle>
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
      <CardContent className="space-y-5 pt-5">
        {/* Customer Info */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Customer</h3>
          <div className="rounded-lg bg-accent p-4 space-y-2">
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
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Items</h3>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-accent p-3"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">{item.name}</p>
                  {item.isCustom && item.customCake && (
                    <p className="text-xs text-muted-foreground">
                      {item.customCake.flavour} / {item.customCake.icingType} / {item.customCake.kilogram}kg
                      {item.customCake.description && ` - ${item.customCake.description}`}
                    </p>
                  )}
                  {item.customization && (
                    <p className="text-xs text-muted-foreground">{item.customization}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payment</h3>
          <div className="rounded-lg bg-accent p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">TZS {order.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Paid</span>
              <span className="font-bold text-green-600">TZS {order.amountPaid.toLocaleString()}</span>
            </div>
            {balanceDue > 0 && (
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-sm font-medium text-secondary">Balance Due</span>
                <span className="font-bold text-secondary">TZS {balanceDue.toLocaleString()}</span>
              </div>
            )}
            <Badge className={`${
              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
              order.paymentStatus === 'deposit' ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            } border-0`}>
              <CreditCard className="mr-1 h-3 w-3" />
              {order.paymentStatus === 'paid' ? 'Fully Paid' : order.paymentStatus === 'deposit' ? '50% Deposit Paid' : 'Unpaid'}
            </Badge>
          </div>
        </div>

        {/* Schedule & Delivery */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Details
          </h3>
          <div className="rounded-lg bg-accent p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{order.pickupDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{order.pickupTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{order.deliveryType === 'delivery' ? 'Delivery' : 'Customer Pickup'}</span>
            </div>
            {order.deliveryType === 'delivery' && order.deliveryAddress && (
              <div className="flex items-start gap-2 text-sm pt-1 border-t border-border">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
                <span className="text-foreground">{order.deliveryAddress}</span>
              </div>
            )}
            {order.isAdvanceOrder && (
              <Badge className="bg-amber-100 text-amber-800 border-0">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Advance Order
              </Badge>
            )}
          </div>
        </div>

        {/* Time estimate */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Estimated production: ~{order.estimatedMinutes} minutes
        </div>

        {/* Special Notes */}
        {order.specialNotes && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
            <FileText className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">{order.specialNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-border pt-4 space-y-3">
          {onMessage && (
            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              onClick={() => onMessage(order)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message Customer
            </Button>
          )}

          {canPostToBaker && onPostToBaker && (
            <Button
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              onClick={() => onPostToBaker(order.id)}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Post to Baker Portal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
