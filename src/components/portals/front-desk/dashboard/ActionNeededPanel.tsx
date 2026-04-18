'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Activity, ArrowRight, ChefHat, Truck, Phone, CreditCard, Star, CheckCircle } from 'lucide-react'
import type { Order } from '@/types/order'

interface ActionNeededPanelProps {
  paidReadyToPost: Order[]
  readyOrders: Order[]
  pendingPayments: Order[]
  actionCount: number
}

export function ActionNeededPanel({ paidReadyToPost, readyOrders, pendingPayments, actionCount }: ActionNeededPanelProps) {
  return (
    <Card className="border-0 shadow-sm lg:col-span-3">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Actions Needed
            {actionCount > 0 && (
              <Badge className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0">{actionCount}</Badge>
            )}
          </CardTitle>
          <Link href="/front-desk/orders">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-auto p-0">
              Go to Orders <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="space-y-2">
          {paidReadyToPost.map(order => (
            <div key={order.id} className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <ChefHat className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{order.id}</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">Post to Baker</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  {order.customer.isGold && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                  {order.customer.name} - {order.items?.map(i => i.name).join(', ')}
                </p>
              </div>
              <Link href="/front-desk/orders">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs h-8 px-3">Post</Button>
              </Link>
            </div>
          ))}

          {readyOrders.filter(o => o.deliveryType === 'delivery').map(order => (
            <div key={order.id} className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                <Truck className="h-4 w-4 text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{order.id}</span>
                  <Badge className="bg-sky-100 text-sky-700 border-0 text-[10px] px-1.5 py-0">Send to Driver</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{order.customer.name} - {order.deliveryAddress}</p>
              </div>
              <Link href="/front-desk/orders">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs h-8 px-3">Dispatch</Button>
              </Link>
            </div>
          ))}

          {readyOrders.filter(o => o.deliveryType === 'pickup').map(order => (
            <div key={order.id} className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{order.id}</span>
                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0">Call / Text</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{order.customer.name} - {order.customer.phone}</p>
              </div>
              <Link href="/front-desk/orders">
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs h-8 px-3">Handle</Button>
              </Link>
            </div>
          ))}

          {pendingPayments.map(order => (
            <div key={order.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <CreditCard className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{order.id}</span>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">Awaiting Payment</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{order.customer.name} - TZS {order.totalPrice.toLocaleString()}</p>
              </div>
              <Link href="/front-desk/orders">
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent text-xs h-8 px-3">Confirm</Button>
              </Link>
            </div>
          ))}

          {actionCount === 0 && (
            <div className="rounded-xl border-2 border-dashed border-border py-10 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground mt-0.5">No actions needed right now.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
