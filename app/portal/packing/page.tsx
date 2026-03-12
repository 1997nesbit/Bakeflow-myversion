'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
import { PackageCheck, Clock, Calendar, MapPin, ArrowRight, CheckCircle, Truck, Send } from 'lucide-react'

export default function PackingPortalPage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status === 'packing')
  )
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleCompleteAndSendToFrontDesk = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'ready' as Order['status'] } : order
      )
    )
    setToastMessage('Order packed and sent to Front Desk!')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const packingOrders = orders.filter(o => o.status === 'packing')

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <PackageCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Packing Portal</h1>
            <p className="text-muted-foreground">
              {packingOrders.length} order{packingOrders.length !== 1 ? 's' : ''} to pack
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 rounded-lg bg-accent border border-border p-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">Workflow:</span> Once you finish packing, click the button to send the order back to Front Desk. They will handle customer notification and driver dispatch.
          </p>
        </div>

        {/* Orders to Pack */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
              {packingOrders.length}
            </span>
            Orders Ready for Packing
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packingOrders.map((order) => (
              <Card key={order.id} className="border-2 border-indigo-400 bg-card shadow-sm">
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
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-indigo-100 text-indigo-800 border-0">
                        Packing
                      </Badge>
                      {order.deliveryType === 'delivery' ? (
                        <Badge variant="outline" className="border-secondary text-secondary bg-transparent">
                          <Truck className="mr-1 h-3 w-3" />
                          Delivery
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-600 text-green-600 bg-transparent">
                          Pickup
                        </Badge>
                      )}
                    </div>
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

                  <div className="rounded-lg bg-accent p-3 space-y-2">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {order.pickupDate}
                      </span>
                      <span className="flex items-center gap-1 text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {order.pickupTime}
                      </span>
                    </div>
                    {order.deliveryType === 'delivery' && order.deliveryAddress && (
                      <div className="flex items-start gap-1 text-sm text-secondary">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleCompleteAndSendToFrontDesk(order.id)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Pack Complete - Send to Front Desk
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {packingOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
              <PackageCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">All caught up!</p>
              <p className="text-muted-foreground">No orders awaiting packing</p>
            </div>
          )}
        </section>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  )
}
