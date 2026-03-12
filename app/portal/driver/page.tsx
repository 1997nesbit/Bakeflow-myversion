'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
import {
  Truck,
  Clock,
  Calendar,
  MapPin,
  Phone,
  CheckCircle,
  Navigation,
  Bell,
  X,
  Package,
} from 'lucide-react'

type DriverOrderStatus = 'pending' | 'accepted' | 'delivered'

interface DriverOrder extends Order {
  driverStatus: DriverOrderStatus
}

export default function DriverPortalPage() {
  const [orders, setOrders] = useState<DriverOrder[]>(
    mockOrders
      .filter((o) => (o.status === 'dispatched' || o.status === 'ready') && o.deliveryType === 'delivery')
      .map((o) => ({ ...o, driverStatus: 'pending' as DriverOrderStatus }))
  )
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' })

  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  const pendingOrders = orders.filter((o) => o.driverStatus === 'pending')
  const acceptedOrders = orders.filter((o) => o.driverStatus === 'accepted')
  const deliveredOrders = orders.filter((o) => o.driverStatus === 'delivered')

  const handleAccept = (orderId: string) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, driverStatus: 'accepted' } : o))
    )
    showToast('Delivery accepted! Front desk has been notified.')
  }

  const handleDecline = (orderId: string) => {
    setOrders(orders.filter((o) => o.id !== orderId))
    showToast('Delivery declined. Front desk has been notified.')
  }

  const handleDelivered = (orderId: string) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, driverStatus: 'delivered' } : o))
    )
    showToast('Marked as delivered! Front desk updated.')
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Truck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Driver Portal</h1>
            <p className="text-sm text-muted-foreground">
              {pendingOrders.length} new request(s) | {acceptedOrders.length} active delivery(ies)
            </p>
          </div>
        </div>

        {/* === NEW DELIVERY REQUESTS === */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingOrders.length}
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-800">New Delivery Requests</h2>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border py-10 text-center">
              <Bell className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No new requests</p>
              <p className="text-sm text-muted-foreground/60">Deliveries dispatched from front desk will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pendingOrders.map((order) => (
                <Card key={order.id} className="border-2 border-amber-300 bg-card shadow-sm overflow-hidden">
                  <div className="bg-amber-500 px-4 py-2 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">New Delivery Request</span>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Pending</Badge>
                    </div>

                    <p className="text-sm text-foreground">{order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</p>

                    {/* Location */}
                    <div className="rounded-xl bg-secondary/10 border-2 border-secondary/30 p-3 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-secondary flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Delivery Location
                      </p>
                      <p className="font-semibold text-foreground">{order.deliveryAddress}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />{order.customerPhone}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                        onClick={() => handleDecline(order.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Decline
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleAccept(order.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* === ACTIVE DELIVERIES === */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {acceptedOrders.length}
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">Active Deliveries</h2>
          </div>

          {acceptedOrders.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
              <p className="text-muted-foreground">No active deliveries. Accept a request above to start.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {acceptedOrders.map((order) => (
                <Card key={order.id} className="border-2 border-blue-300 bg-card shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                        <Truck className="mr-1 h-3 w-3" />
                        In Transit
                      </Badge>
                    </div>

                    <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-3 space-y-2">
                      <div className="flex items-start gap-2 text-sm text-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                        <span className="font-medium">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />{order.customerPhone}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress || '')}`, '_blank')}
                      >
                        <Navigation className="mr-1 h-4 w-4" />
                        Navigate
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleDelivered(order.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Delivered
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* === COMPLETED TODAY === */}
        {deliveredOrders.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                {deliveredOrders.length}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-green-800">Completed Today</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {deliveredOrders.map((order) => (
                <Card key={order.id} className="border-0 shadow-sm bg-card opacity-70">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.customerName}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Done
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{order.deliveryAddress}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Toast */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-green-600 px-5 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  )
}
