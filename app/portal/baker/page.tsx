'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
import { ChefHat, Clock, Calendar, FileText, ArrowRight, CheckCircle, Cake } from 'lucide-react'

export default function BakerPortalPage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status === 'baker')
  )
  const [showCompleted, setShowCompleted] = useState(false)

  const activeOrders = orders.filter((o) => o.status === 'baker')

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
              {activeOrders.length} orders to bake
            </p>
          </div>
        </div>

        {/* Active Orders */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {activeOrders.length}
            </span>
            Orders from Front Desk
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
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground border-0">
                      Baking
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      {orderTypeLabels[order.orderType]}
                    </p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-accent p-3 space-y-1">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        {item.isCustom && item.customCake && (
                          <div className="flex items-start gap-2 mt-1 pt-1 border-t border-border">
                            <Cake className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                            <div className="text-sm text-secondary">
                              <p>{item.customCake.flavour} / {item.customCake.icingType} / {item.customCake.kilogram}kg</p>
                              {item.customCake.description && (
                                <p className="text-muted-foreground">{item.customCake.description}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialNotes && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                      <FileText className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
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
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      ~{order.estimatedMinutes}min
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
              <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No orders to bake right now</p>
              <p className="text-sm text-muted-foreground">Orders posted from Front Desk will appear here</p>
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
