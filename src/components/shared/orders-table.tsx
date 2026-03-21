'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/order'
import { statusLabels, statusColors, orderTypeLabels } from '@/data/constants/labels'
import { Clock, MapPin } from 'lucide-react'

interface OrdersTableProps {
  orders: Order[]
  title?: string
}

export function OrdersTable({ orders, title = "Today's Orders" }: OrdersTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/20 text-sm font-bold text-secondary">
                  {order.orderType.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{order.customerName}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{order.id}</span>
                    <span className="text-border">|</span>
                    <span>{orderTypeLabels[order.orderType]}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{order.pickupTime}</span>
                  </div>
                  {order.deliveryType === 'delivery' && (
                    <div className="flex items-center gap-1 text-xs text-secondary">
                      <MapPin className="h-3 w-3" />
                      <span>Delivery</span>
                    </div>
                  )}
                </div>

                <Badge className={`${statusColors[order.status]} border-0`}>
                  {statusLabels[order.status]}
                </Badge>

                <p className="w-24 text-right font-semibold text-foreground text-sm">
                  TZS {order.totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
