'use client'

import React from "react"
import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { OrderForm, NewOrderData } from '@/components/front-desk/order-form'
import { OrderDetail } from '@/components/front-desk/order-detail'
import {
  mockOrders,
  mockDrivers,
  Order,
  OrderStatus,
  statusLabels,
  statusColors,
  orderTypeLabels,
} from '@/lib/mock-data'
import { Plus, Search, Clock, MapPin, MessageSquare, Send, ChefHat, CheckCircle, Truck, Package, User, Calendar, Navigation } from 'lucide-react'

export default function FrontDeskPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageOrder, setMessageOrder] = useState<Order | null>(null)
  const [messageText, setMessageText] = useState('')
  const [showSentConfirm, setShowSentConfirm] = useState(false)
  const [showPostedConfirm, setShowPostedConfirm] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Driver dispatch state
  const [dispatchDialog, setDispatchDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null })
  const [selectedDriver, setSelectedDriver] = useState('')

  const availableDrivers = mockDrivers.filter(d => d.status === 'available')

  // Separate ready orders (for dispatch section)
  const readyOrders = orders.filter(o => o.status === 'ready')
  const readyDeliveryOrders = readyOrders.filter(o => o.isDelivery)
  const readyPickupOrders = readyOrders.filter(o => !o.isDelivery)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter
    // Exclude ready orders from main grid (they show in dispatch section)
    const notReady = order.status !== 'ready'
    return matchesSearch && matchesStatus && notReady
  })

  const handleNewOrder = (data: NewOrderData) => {
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      ...data,
      status: 'pending',
      totalPrice: data.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
      createdAt: new Date().toISOString(),
    }
    setOrders([newOrder, ...orders])
    setShowNewOrder(false)
  }

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    setSelectedOrder(null)
  }

  const handlePostToBaker = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'baker' as OrderStatus } : order
      )
    )
    setSelectedOrder(null)
    setToastMessage('Order posted to Baker Portal!')
    setShowPostedConfirm(true)
    setTimeout(() => setShowPostedConfirm(false), 2000)
  }

  const handleOpenMessage = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMessageOrder(order)
    setMessageText('')
    setShowMessageDialog(true)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(false)
    setToastMessage('Message sent successfully!')
    setShowSentConfirm(true)
    setTimeout(() => setShowSentConfirm(false), 2000)
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
    setToastMessage(`Order dispatched to ${driver?.name}! Driver notified with location.`)
    setShowPostedConfirm(true)
    setTimeout(() => setShowPostedConfirm(false), 3000)
  }

  const handleMarkPickedUp = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' as OrderStatus } : order
      )
    )
    setToastMessage('Order marked as picked up!')
    setShowPostedConfirm(true)
    setTimeout(() => setShowPostedConfirm(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Front Desk</h1>
            <p className="text-muted-foreground">
              Manage orders, dispatch deliveries, and notify customers
            </p>
          </div>
          <Button
            onClick={() => setShowNewOrder(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </div>

        {/* Ready Orders Section - Dispatch & Pickup */}
        {readyOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                {readyOrders.length}
              </span>
              <h2 className="text-lg font-semibold text-foreground">Ready Orders - Action Required</h2>
            </div>

            {/* Ready for Delivery - Dispatch to Driver */}
            {readyDeliveryOrders.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Ready for Delivery ({readyDeliveryOrders.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {readyDeliveryOrders.map((order) => (
                    <Card key={order.id} className="border-2 border-green-400 bg-card shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base font-semibold text-foreground">
                              {order.id}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Ready
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-foreground">
                          {order.items.map((item, idx) => (
                            <span key={idx}>{item.name} x{item.quantity}{idx < order.items.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>

                        {/* Delivery Location */}
                        <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 space-y-1">
                          <p className="text-xs font-semibold uppercase text-secondary">Delivery Location</p>
                          <div className="flex items-start gap-2 text-sm font-medium text-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                            {order.deliveryAddress}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {order.pickupDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {order.pickupTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                            onClick={() => handleOpenMessage(order)}
                          >
                            <MessageSquare className="mr-1 h-4 w-4" />
                            Message
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                            onClick={() => setDispatchDialog({ open: true, order })}
                          >
                            <Send className="mr-1 h-4 w-4" />
                            Send to Driver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Ready for Customer Pickup */}
            {readyPickupOrders.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Ready for Customer Pickup ({readyPickupOrders.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {readyPickupOrders.map((order) => (
                    <Card key={order.id} className="border border-green-300 bg-card shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-0">
                            Pickup
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {order.pickupTime}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                            onClick={() => handleOpenMessage(order)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleMarkPickedUp(order.id)}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Picked Up
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="baker">With Baker</SelectItem>
              <SelectItem value="decorator">Decorating</SelectItem>
              <SelectItem value="quality">Quality Check</SelectItem>
              <SelectItem value="packing">Packing</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer border-0 shadow-sm transition-shadow hover:shadow-md bg-card"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.id}</p>
                  </div>
                  <Badge className={`${statusColors[order.status]} border-0`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm text-foreground">
                    {orderTypeLabels[order.orderType]} -{' '}
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {order.pickupTime}
                    </span>
                    {order.isDelivery && (
                      <span className="flex items-center gap-1 text-secondary">
                        <MapPin className="h-3.5 w-3.5" />
                        Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">
                    {order.pickupDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      onClick={(e) => handleOpenMessage(order, e)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-secondary">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}

        {/* Order Form Modal */}
        {showNewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <OrderForm
                onClose={() => setShowNewOrder(false)}
                onSubmit={handleNewOrder}
              />
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <OrderDetail
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={handleUpdateStatus}
                onPostToBaker={handlePostToBaker}
                onMessage={(order) => handleOpenMessage(order)}
              />
            </div>
          </div>
        )}

        {/* Dispatch to Driver Dialog */}
        <Dialog open={dispatchDialog.open} onOpenChange={(open) => setDispatchDialog({ open, order: dispatchDialog.order })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Send to Driver Portal</DialogTitle>
              <DialogDescription>
                Select a driver to notify. Location and order details will be sent to their portal.
              </DialogDescription>
            </DialogHeader>
            
            {dispatchDialog.order && (
              <div className="space-y-4">
                {/* Order Summary */}
                <div className="rounded-lg bg-accent p-4 space-y-2">
                  <p className="font-semibold text-foreground">{dispatchDialog.order.id}</p>
                  <p className="text-sm text-muted-foreground">{dispatchDialog.order.customerName}</p>
                  <div className="text-sm text-foreground">
                    {dispatchDialog.order.items.map((item, idx) => (
                      <span key={idx}>{item.name} x{item.quantity}{idx < dispatchDialog.order!.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                </div>

                {/* Delivery Location - Will be sent to driver */}
                <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-secondary flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    Location Sent to Driver
                  </p>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                    <span className="font-medium text-foreground">{dispatchDialog.order.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {dispatchDialog.order.pickupDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {dispatchDialog.order.pickupTime}
                    </span>
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
                      <SelectValue placeholder="Choose a driver to notify..." />
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
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={handleDispatchToDriver}
                    disabled={!selectedDriver}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Dispatch to Driver
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Send Message to Customer</DialogTitle>
            </DialogHeader>
            {messageOrder && (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-3">
                  <p className="font-medium text-foreground">{messageOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{messageOrder.customerPhone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is ready for pickup!`)}
                  >
                    Ready for Pickup
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is out for delivery!`)}
                  >
                    Out for Delivery
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setMessageText(`Hi ${messageOrder.customerName}, we need to confirm some details about your order ${messageOrder.id}. Please call us at your earliest convenience.`)}
                  >
                    Need Confirmation
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-primary hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        {showSentConfirm && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {showPostedConfirm && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-lg">
            <Truck className="h-5 w-5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  )
}
