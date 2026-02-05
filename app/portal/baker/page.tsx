'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
import { ChefHat, Clock, Calendar, FileText, ArrowRight, CheckCircle } from 'lucide-react'

export default function BakerPortalPage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status === 'baker' || o.status === 'pending')
  )
  const [showCompleted, setShowCompleted] = useState(false)

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const activeOrders = orders.filter((o) => o.status === 'baker')

  const handleStartOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'baker' as Order['status'] } : order
      )
    )
  }

  const handleCompleteOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'decorator' as Order['status'] } : order
      )
    )
    setShowCompleted(true)
    setTimeout(() => setShowCompleted(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ChefHat className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Baker Portal</h1>
            <p className="text-muted-foreground">
              {activeOrders.length} active orders | {pendingOrders.length} pending
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {activeOrders.length}
            </span>
            Active Orders - In Progress
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => (
              <Card key={order.id} className="border-2 border-primary bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground border-0">
                      In Progress
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {orderTypeLabels[order.orderType]}
                    </p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-accent p-3">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        {item.customization && (
                          <p className="text-sm text-secondary mt-1">
                            {item.customization}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialNotes && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                      <FileText className="h-4 w-4 mt-0.5 text-amber-600" />
                      <p className="text-sm text-amber-800">{order.specialNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {order.pickupDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.pickupTime}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    Complete & Send to Decorator
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {activeOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No active baking orders</p>
            </div>
          )}
        </section>

        {/* Pending Orders */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingOrders.length}
            </span>
            Pending Orders - Waiting to Start
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border border-border bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-0">
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {orderTypeLabels[order.orderType]}
                    </p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-accent p-3">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {order.pickupDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.pickupTime}
                    </span>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleStartOrder(order.id)}
                  >
                    Start Baking
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {pendingOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No pending orders</p>
            </div>
          )}
        </section>

        {/* Completed Toast */}
        {showCompleted && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Order sent to Decorator Portal!</span>
          </div>
        )}
      </main>
    </div>
  )
}
