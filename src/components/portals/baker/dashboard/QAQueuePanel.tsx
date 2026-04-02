'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types/order'

interface Props {
  orders: Order[]
}

export function QAQueuePanel({ orders }: Props) {
  if (orders.length === 0) return null

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" style={{ color: '#e66386' }} />
            <h3 className="text-sm font-semibold text-foreground">Awaiting QA</h3>
            <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>
              {orders.length}
            </Badge>
          </div>
          <Link href="/baker/active" className="text-xs font-medium hover:underline" style={{ color: '#e66386' }}>
            Inspect
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="rounded-xl border-2 p-3"
              style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-foreground">{order.id}</p>
                <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>QA</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{order.customer.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {order.items.map((item, idx) => (
                  <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#fce7ea', color: '#CA0123' }}>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
