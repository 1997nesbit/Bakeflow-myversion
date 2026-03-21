'use client'

import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Order } from '@/types/order'
import {
  DollarSign,
  Clock,
  Calendar,
  Truck,
  User,
  AlertTriangle,
  MessageSquare,
  Phone,
} from 'lucide-react'

interface AwaitingPaymentTabProps {
  pendingPayment: Order[]
  onConfirmPaymentClick: (order: Order) => void
  onOpenMessage: (order: Order) => void
}

export function AwaitingPaymentTab({
  pendingPayment,
  onConfirmPaymentClick,
  onOpenMessage,
}: AwaitingPaymentTabProps) {
  return (
    <div className="space-y-4">
      {pendingPayment.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No orders awaiting payment</p>
          <p className="text-sm text-muted-foreground/70 mt-1">All orders are paid or saved orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-1 mb-4">
          <p className="text-sm text-muted-foreground">
            {pendingPayment.length} order{pendingPayment.length === 1 ? '' : 's'} awaiting customer payment. Confirm payment to move to baker queue.
          </p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pendingPayment.map(order => {
          const timeSinceCreated = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))
          return (
            <Card key={order.id} className="border-2 border-amber-200 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{order.id}</p>
                      {timeSinceCreated > 30 && (
                        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                          <Clock className="mr-1 h-3 w-3" />{timeSinceCreated}min ago
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-secondary">TZS {order.totalPrice.toLocaleString()}</p>
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Unpaid</Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
                  {order.items.map(item => (
                    <div key={item.name} className="flex justify-between text-xs">
                      <span className="text-foreground">{item.name} x{item.quantity}</span>
                      <span className="font-medium text-foreground">TZS {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                  <span className="flex items-center gap-1">
                    {order.deliveryType === 'delivery'
                      ? <><Truck className="h-3 w-3 text-secondary" />Delivery</>
                      : <><User className="h-3 w-3" />Pickup</>}
                  </span>
                </div>
                {order.isAdvanceOrder && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Advance order - 50% deposit option available
                  </div>
                )}
                <div className="flex flex-col gap-2 pt-1">
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => onConfirmPaymentClick(order)}>
                    <DollarSign className="mr-1 h-4 w-4" /> Confirm Payment
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent" onClick={() => onOpenMessage(order)}>
                      <MessageSquare className="mr-1 h-3.5 w-3.5" /> Remind
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => {
                      if (order.customerPhone) window.open(`tel:${order.customerPhone}`, '_self')
                      toast.info(`Calling ${order.customerName}...`)
                    }}>
                      <Phone className="mr-1 h-3.5 w-3.5" /> Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
