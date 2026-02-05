'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockOrders, Order, orderTypeLabels, mockDrivers } from '@/lib/mock-data'
import { PackageCheck, Clock, Calendar, MapPin, ArrowRight, CheckCircle, Truck, Send, User, Package } from 'lucide-react'

export default function PackingPortalPage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status === 'packing' || o.status === 'ready')
  )
  const [showCompleted, setShowCompleted] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [dispatchDialog, setDispatchDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null })
  const [selectedDriver, setSelectedDriver] = useState('')

  const availableDrivers = mockDrivers.filter(d => d.status === 'available')
  const packingOrders = orders.filter(o => o.status === 'packing')
  const readyDeliveryOrders = orders.filter(o => o.status === 'ready' && o.isDelivery)
  const readyPickupOrders = orders.filter(o => o.status === 'ready' && !o.isDelivery)

  const handleCompleteOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'ready' as Order['status'] } : order
      )
    )
    setToastMessage('Order marked as packed!')
    setShowCompleted(true)
    setTimeout(() => setShowCompleted(false), 2000)
  }

  const handleDispatchToDriver = () => {
    if (!dispatchDialog.order || !selectedDriver) return
    
    const driver = mockDrivers.find(d => d.id === selectedDriver)
    setOrders(
      orders.map((order) =>
        order.id === dispatchDialog.order?.id 
          ? { ...order, status: 'delivered' as Order['status'], assignedTo: driver?.name } 
          : order
      )
    )
    setDispatchDialog({ open: false, order: null })
    setSelectedDriver('')
    setToastMessage(`Order dispatched to ${driver?.name} with delivery location!`)
    setShowCompleted(true)
    setTimeout(() => setShowCompleted(false), 3000)
  }

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
              {packingOrders.length} to pack | {readyDeliveryOrders.length} ready for dispatch
            </p>
          </div>
        </div>

        {/* Orders to Pack */}
        <section className="mb-8">
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
                      {order.isDelivery && (
                        <Badge variant="outline" className="border-secondary text-secondary bg-transparent">
                          <Truck className="mr-1 h-3 w-3" />
                          Delivery
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
                    {order.isDelivery && order.deliveryAddress && (
                      <div className="flex items-start gap-1 text-sm text-secondary">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    Mark as Packed & Ready
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {packingOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No orders awaiting packing</p>
            </div>
          )}
        </section>

        {/* Ready for Delivery - Send to Driver */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
              {readyDeliveryOrders.length}
            </span>
            Ready for Delivery - Dispatch to Driver
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {readyDeliveryOrders.map((order) => (
              <Card key={order.id} className="border-2 border-green-400 bg-card shadow-sm">
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
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Packed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-accent p-2 text-sm">
                        <span className="font-medium text-foreground">{item.name}</span>
                        <span className="text-muted-foreground"> x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location Info */}
                  <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 space-y-2">
                    <p className="text-xs font-semibold uppercase text-secondary">Delivery Location</p>
                    <div className="flex items-start gap-2 text-sm font-medium text-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
                      {order.deliveryAddress}
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

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => setDispatchDialog({ open: true, order })}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send to Driver Portal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {readyDeliveryOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No orders ready for dispatch</p>
            </div>
          )}
        </section>

        {/* Ready for Customer Pickup */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
              {readyPickupOrders.length}
            </span>
            Ready for Customer Pickup
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {readyPickupOrders.map((order) => (
              <Card key={order.id} className="border border-green-300 bg-card shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
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
          {readyPickupOrders.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No orders ready for pickup</p>
            </div>
          )}
        </section>

        {/* Dispatch to Driver Dialog */}
        <Dialog open={dispatchDialog.open} onOpenChange={(open) => setDispatchDialog({ open, order: dispatchDialog.order })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Dispatch to Driver</DialogTitle>
              <DialogDescription>
                Select a driver to notify about this delivery
              </DialogDescription>
            </DialogHeader>
            
            {dispatchDialog.order && (
              <div className="space-y-4">
                {/* Order Summary */}
                <div className="rounded-lg bg-accent p-4 space-y-2">
                  <p className="font-semibold text-foreground">{dispatchDialog.order.id}</p>
                  <p className="text-sm text-muted-foreground">{dispatchDialog.order.customerName}</p>
                  <div className="flex items-center gap-2 text-sm">
                    {dispatchDialog.order.items.map((item, idx) => (
                      <span key={idx} className="text-foreground">{item.name} x{item.quantity}</span>
                    ))}
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-secondary">Delivery Details to Send</p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-secondary" />
                    <span className="font-medium text-foreground">{dispatchDialog.order.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Due: {dispatchDialog.order.pickupDate} at {dispatchDialog.order.pickupTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {dispatchDialog.order.customerPhone}
                  </div>
                </div>

                {/* Driver Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Driver</label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a driver..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.length > 0 ? (
                        availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500" />
                              {driver.name} - {driver.phone}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No drivers available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 bg-transparent" 
                    onClick={() => setDispatchDialog({ open: false, order: null })}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={handleDispatchToDriver}
                    disabled={!selectedDriver}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Dispatch with Location
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Toast */}
        {showCompleted && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  )
}
