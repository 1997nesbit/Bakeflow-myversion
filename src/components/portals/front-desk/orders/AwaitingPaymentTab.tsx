'use client'

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
      <div className="flex flex-col gap-2">
        {pendingPayment.map(order => {
          return (
            <Card key={order.id} className="border border-amber-200 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  {/* Order ID + Customer */}
                  <div className="min-w-0 w-40 shrink-0">
                    <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                  </div>

                  {/* Items summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {order.items?.map(item => (
                        <span key={item.name} className="text-xs text-muted-foreground">
                          {item.name} <span className="font-medium text-foreground">×{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                      <span className="flex items-center gap-1">
                        {order.deliveryType === 'delivery'
                          ? <><Truck className="h-3 w-3 text-secondary" />Delivery</>
                          : <><User className="h-3 w-3" />Pickup</>}
                      </span>
                      {order.isAdvanceOrder && (
                        <span className="flex items-center gap-1 text-amber-700">
                          <AlertTriangle className="h-3 w-3" />Advance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + badge */}
                  <div className="text-right shrink-0 w-32">
                    <p className="text-base font-bold text-secondary">TZS {order.totalPrice.toLocaleString()}</p>
                    <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Unpaid</Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onConfirmPaymentClick(order)}>
                      <DollarSign className="mr-1 h-4 w-4" /> Confirm Payment
                    </Button>
                    <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent" onClick={() => onOpenMessage(order)}>
                      <MessageSquare className="h-3.5 w-3.5" />
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
