'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Inbox, Bell, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types/order'
import { orderTypeLabels } from '@/data/constants/labels'

interface Props {
  orders: Order[]
}

export function IncomingOrdersCard({ orders }: Props) {
  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4" style={{ color: '#e66386' }} />
            <h3 className="text-sm font-semibold text-foreground">Incoming Orders</h3>
            {orders.length > 0 && (
              <Badge className="text-[10px] text-white border-0" style={{ background: '#CA0123' }}>
                {orders.length}
              </Badge>
            )}
          </div>
          <Link href="/baker/active" className="text-xs font-medium hover:underline" style={{ color: '#e66386' }}>
            View All
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No new orders</p>
            <p className="text-xs text-muted-foreground mt-1">Orders from Front Desk appear here for any baker</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 4).map(order => (
              <div key={order.id} className="rounded-xl border-2 p-4" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-transparent">
                    {orderTypeLabels[order.orderType]}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {order.items.map((item, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#fce7ea', color: '#CA0123' }}>
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                </div>
                {order.cakeDescription && (
                  <p className="text-[11px] mb-2" style={{ color: '#e66386' }}>{order.cakeDescription}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Est. {order.estimatedMinutes}m
                  </span>
                  <Link href="/baker/active">
                    <Button size="sm" className="h-7 text-xs text-white border-0" style={{ background: '#e66386' }}>
                      Accept
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
