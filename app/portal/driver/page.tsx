'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockOrders, Order, orderTypeLabels, mockDrivers, Driver } from '@/lib/mock-data'
import { Truck, Clock, Calendar, MapPin, Phone, CheckCircle, Navigation, Package, Bell, User } from 'lucide-react'

export default function DriverPortalPage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => (o.status === 'ready' || o.status === 'dispatched') && o.deliveryType === 'delivery')
  )
  const [drivers] = useState<Driver[]>(mockDrivers)
  const [showCompleted, setShowCompleted] = useState(false)
  const [newDeliveryAlert, setNewDeliveryAlert] = useState(true)

  // Simulate receiving a new delivery notification
  useEffect(() => {
    if (newDeliveryAlert) {
      const timer = setTimeout(() => setNewDeliveryAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [newDeliveryAlert])

  const availableDrivers = drivers.filter(d => d.status === 'available')
  const deliveryOrders = orders.filter(o => (o.status === 'ready' || o.status === 'dispatched') && o.deliveryType === 'delivery')
  const pickupOrders = mockOrders.filter(o => o.status === 'ready' && o.deliveryType === 'pickup')

  const handleMarkDelivered = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' as Order['status'] } : order
      )
    )
    setShowCompleted(true)
    setTimeout(() => setShowCompleted(false), 2000)
  }

  const handleAcceptDelivery = (orderId: string) => {
    // In a real app, this would assign the driver and update the order status
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, assignedTo: 'You' } : order
      )
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* New Delivery Alert Banner */}
        {newDeliveryAlert && deliveryOrders.length > 0 && (
          <div className="mb-6 rounded-lg bg-primary p-4 flex items-center gap-4 animate-pulse">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-primary-foreground">New Delivery Request!</p>
              <p className="text-sm text-primary-foreground/80">
                You have {deliveryOrders.length} delivery order(s) waiting for pickup
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => setNewDeliveryAlert(false)}
            >
              View Orders
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Truck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Driver Portal</h1>
            <p className="text-muted-foreground">
              {deliveryOrders.length} deliveries | {pickupOrders.length} pickups ready
            </p>
          </div>
        </div>

        {/* Driver Status */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Driver Status</h2>
          <div className="flex gap-4 flex-wrap">
            {drivers.map((driver) => (
              <Card key={driver.id} className="w-64 border border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{driver.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            driver.status === 'available'
                              ? 'bg-green-100 text-green-800 border-0'
                              : driver.status === 'on-delivery'
                              ? 'bg-amber-100 text-amber-800 border-0'
                              : 'bg-gray-100 text-gray-800 border-0'
                          }
                        >
                          {driver.status === 'available' ? 'Available' : driver.status === 'on-delivery' ? 'On Delivery' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Delivery Orders */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {deliveryOrders.length}
            </span>
            Pending Deliveries
            {deliveryOrders.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Bell className="h-3 w-3" />
                New
              </span>
            )}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deliveryOrders.map((order) => (
              <Card key={order.id} className="border-2 border-secondary bg-card shadow-sm overflow-hidden">
                {/* Notification Banner */}
                <div className="bg-primary px-4 py-2 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary-foreground" />
                  <span className="text-sm font-medium text-primary-foreground">
                    Dispatched from Packing
                  </span>
                </div>
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
                    <Badge className="bg-secondary text-secondary-foreground border-0">
                      <Truck className="mr-1 h-3 w-3" />
                      Delivery
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {orderTypeLabels[order.orderType]}
                    </p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-accent p-2 text-sm">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground"> x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location - Highlighted */}
                  <div className="rounded-lg bg-secondary/10 border-2 border-secondary/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-secondary" />
                      <span className="text-xs font-bold uppercase tracking-wide text-secondary">Delivery Location</span>
                    </div>
                    <p className="font-semibold text-foreground text-base">
                      {order.deliveryAddress}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {order.customerPhone}
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
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress || '')}`, '_blank')}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleMarkDelivered(order.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Delivered
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {deliveryOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <Truck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No pending deliveries</p>
              <p className="text-sm text-muted-foreground/70">Orders will appear here when dispatched from packing</p>
            </div>
          )}
        </section>

        {/* Pickup Ready */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              {pickupOrders.length}
            </span>
            Ready for Customer Pickup
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pickupOrders.map((order) => (
              <Card key={order.id} className="border border-green-400 bg-card shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <Package className="mr-1 h-3 w-3" />
                      Pickup
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {order.pickupTime}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pickupOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No orders ready for pickup</p>
            </div>
          )}
        </section>

        {/* Completed Toast */}
        {showCompleted && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Order marked as delivered!</span>
          </div>
        )}
      </main>
    </div>
  )
}
