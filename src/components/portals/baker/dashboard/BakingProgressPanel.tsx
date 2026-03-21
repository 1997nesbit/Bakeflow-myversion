'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Flame } from 'lucide-react'
import Link from 'next/link'
import type { Order } from '@/types/order'

interface Props {
  orders: Order[]
  getElapsed: (postedAt?: string) => number
}

export function BakingProgressPanel({ orders, getElapsed }: Props) {
  if (orders.length === 0) return null

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4" style={{ color: '#CA0123' }} />
            <h3 className="text-sm font-semibold text-foreground">Active Baking</h3>
          </div>
          <Link href="/portal/baker/active" className="text-xs font-medium hover:underline" style={{ color: '#CA0123' }}>
            View All
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.slice(0, 6).map(order => {
            const elapsed = getElapsed(order.postedToBakerAt)
            const isOverdue = elapsed > order.estimatedMinutes
            const pct = Math.min(100, Math.round((elapsed / order.estimatedMinutes) * 100))
            return (
              <div
                key={order.id}
                className={`rounded-xl border p-3 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-border'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                      style={{ background: isOverdue ? '#CA0123' : '#e66386' }}
                    >
                      {order.id.split('-')[1]}
                    </span>
                    <div>
                      <p className="font-medium text-sm text-foreground leading-tight">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {order.items.map(i => i.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-mono font-bold tabular-nums ${isOverdue ? 'text-[#CA0123]' : 'text-foreground'}`}>
                    {elapsed}m / {order.estimatedMinutes}m
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: isOverdue ? '#CA0123' : pct > 75 ? '#e66386' : '#22c55e',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
