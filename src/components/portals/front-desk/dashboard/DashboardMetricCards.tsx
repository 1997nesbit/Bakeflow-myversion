'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, DollarSign, CircleDollarSign, Star } from 'lucide-react'
import type { Order } from '@/types/order'

interface DashboardMetricCardsProps {
  orders: Order[]
  totalRevenue: number
  outstandingBalance: number
  completedOrders: Order[]
  goldCustomerOrders: Order[]
  pendingPayments: Order[]
  depositOrders: Order[]
}

export function DashboardMetricCards({
  orders, totalRevenue, outstandingBalance, completedOrders,
  goldCustomerOrders, pendingPayments, depositOrders,
}: DashboardMetricCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{orders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{completedOrders.length} completed today</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">TZS {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">collected from {orders.filter(o => o.amountPaid > 0).length} orders</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outstanding</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <CircleDollarSign className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">TZS {outstandingBalance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{pendingPayments.length} unpaid, {depositOrders.length} deposits</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gold Customers</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{goldCustomerOrders.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {goldCustomerOrders.length > 0 ? goldCustomerOrders.slice(0, 2).map(o => o.customer.name).join(', ') : 'No gold orders today'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
