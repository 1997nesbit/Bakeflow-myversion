'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockOrders, mockDrivers, Order, Driver } from '@/lib/mock-data'
import {
  Truck,
  Phone,
  MapPin,
  Clock,
  User,
  Bell,
  CheckCircle,
  Package,
} from 'lucide-react'

export default function DriversPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers)

  const readyOrders = orders.filter(
    (order) => order.status === 'ready' && order.isDelivery
  )
  const pickupOrders = orders.filter(
    (order) => order.status === 'ready' && !order.isDelivery
  )

  const notifyDriver = (driverId: string, orderId: string) => {
    // Mock notification - in real app would send actual notification
    alert(`Notification sent to driver for order ${orderId}`)
  }

  const markDelivered = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' } : order
      )
    )
  }

  const markPickedUp = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' } : order
      )
    )
  }

  const driverStatusColors: Record<Driver['status'], string> = {
    available: 'bg-green-100 text-green-800',
    'on-delivery': 'bg-blue-100 text-blue-800',
    offline: 'bg-gray-100 text-gray-800',
  }

  const driverStatusLabels: Record<Driver['status'], string> = {
    available: 'Available',
    'on-delivery': 'On Delivery',
    offline: 'Offline',
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Drivers & Pickup
          </h1>
          <p className="text-muted-foreground">
            Manage deliveries and customer pickups
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Deliveries
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {readyOrders.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20">
                <Package className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready for Pickup</p>
                <p className="text-2xl font-bold text-foreground">
                  {pickupOrders.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Available Drivers
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {drivers.filter((d) => d.status === 'available').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Delivery</p>
                <p className="text-2xl font-bold text-foreground">
                  {drivers.filter((d) => d.status === 'on-delivery').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Drivers Panel */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Drivers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {driver.name}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`${driverStatusColors[driver.status]} border-0`}
                  >
                    {driverStatusLabels[driver.status]}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Orders */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5" />
                Pending Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readyOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No pending deliveries
                </p>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-0">
                        Ready
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {order.pickupDate} at {order.pickupTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{order.customerPhone}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          notifyDriver(drivers[0].id, order.id)
                        }
                        className="flex-1"
                      >
                        <Bell className="mr-1 h-4 w-4" />
                        Notify Driver
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => markDelivered(order.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Delivered
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pickup Orders */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Ready for Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pickupOrders.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No orders ready for pickup
                </p>
              ) : (
                pickupOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName}
                        </p>
                      </div>
                      <span className="font-semibold text-primary">
                        ${order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {order.items.map((item, index) => (
                        <p key={index}>
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {order.pickupTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {order.customerPhone}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="mt-4 w-full bg-primary hover:bg-primary/90"
                      onClick={() => markPickedUp(order.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Picked Up
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
