'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, Truck, CheckCircle } from 'lucide-react'
import type { Order } from '@/types/order'

interface DepositTrackerProps {
  depositOrders: Order[]
  dispatchedOrders: Order[]
}

export function DepositTracker({ depositOrders, dispatchedOrders }: DepositTrackerProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Outstanding Balances */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-500" />
            Outstanding Balances
            {depositOrders.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">{depositOrders.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {depositOrders.length > 0 ? (
            <div className="space-y-3">
              {depositOrders.map(order => {
                const balance = order.totalPrice - order.amountPaid
                const paidPercent = (order.amountPaid / order.totalPrice) * 100
                return (
                  <div key={order.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-foreground">{order.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">{order.id} - Due: {new Date(order.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <span className="text-sm font-bold text-secondary">TZS {balance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${paidPercent}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{Math.round(paidPercent)}% paid</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
              <CheckCircle className="mx-auto h-7 w-7 text-green-400 mb-2" />
              <p className="text-xs text-muted-foreground">No outstanding balances</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Out for Delivery */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Truck className="h-4 w-4 text-violet-500" />
            Out for Delivery
            {dispatchedOrders.length > 0 && (
              <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] px-1.5 py-0">{dispatchedOrders.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {dispatchedOrders.length > 0 ? (
            <div className="space-y-3">
              {dispatchedOrders.map(order => (
                <div key={order.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-xs font-bold text-foreground">{order.id} - {order.customerName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{order.deliveryAddress}</p>
                    </div>
                    {order.driverAccepted ? (
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0 shrink-0">Accepted</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                    )}
                  </div>
                  {order.assignedTo && (
                    <p className="text-[10px] text-muted-foreground mt-1">Driver: {order.assignedTo}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
              <Truck className="mx-auto h-7 w-7 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No active deliveries</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
