'use client'

import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  daysUntilDue,
  minutesSincePosted,
} from '@/lib/mock-data'
import {
  Plus,
  Search,
  Clock,
  MapPin,
  MessageSquare,
  Send,
  ChefHat,
  CheckCircle,
  Truck,
  Package,
  User,
  Calendar,
  Navigation,
  AlertTriangle,
  Bell,
  CreditCard,
  X,
  Phone,
} from 'lucide-react'

interface OverdueAlert {
  order: Order
  minutesOver: number
}

export default function FrontDeskPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageOrder, setMessageOrder] = useState<Order | null>(null)
  const [messageText, setMessageText] = useState('')

  // Driver dispatch dialog
  const [dispatchDialog, setDispatchDialog] = useState<{ open: boolean; order: Order | null }>({ open: false, order: null })
  const [selectedDriver, setSelectedDriver] = useState('')

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'warning' }>({ show: false, message: '', type: 'success' })

  // Overdue kitchen alerts
  const [overdueAlerts, setOverdueAlerts] = useState<OverdueAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  // Advance order reminders
  const [advanceReminders, setAdvanceReminders] = useState<Order[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  const availableDrivers = mockDrivers.filter(d => d.status === 'available')

  // Check for overdue orders in kitchen (baker/decorator status taking too long)
  useEffect(() => {
    const checkOverdue = () => {
      const inKitchen = orders.filter(
        (o) => ['baker', 'decorator'].includes(o.status) && o.postedToBakerAt
      )
      const alerts: OverdueAlert[] = []
      for (const order of inKitchen) {
        if (!order.postedToBakerAt) continue
        const elapsed = minutesSincePosted(order.postedToBakerAt)
        if (elapsed > order.estimatedMinutes && !dismissedAlerts.has(order.id)) {
          alerts.push({ order, minutesOver: elapsed - order.estimatedMinutes })
        }
      }
      setOverdueAlerts(alerts)
    }

    checkOverdue()
    const interval = setInterval(checkOverdue, 30000) // check every 30s
    return () => clearInterval(interval)
  }, [orders, dismissedAlerts])

  // Check for advance orders approaching their date
  useEffect(() => {
    const upcoming = orders.filter(
      (o) => o.isAdvanceOrder && ['paid', 'pending'].includes(o.status)
    )
    const reminders = upcoming.filter((o) => {
      const days = daysUntilDue(o.pickupDate)
      return days <= 2 && days >= 0
    })
    setAdvanceReminders(reminders)
  }, [orders])

  // Separate ready orders
  const readyDeliveryOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'delivery' && o.paymentStatus === 'paid')
  const readyPickupOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'pickup')
  const readyOrders = [...readyDeliveryOrders, ...readyPickupOrders]

  // Paid orders ready to post to baker
  const paidOrders = orders.filter(o => o.status === 'paid')

  // Filter for main grid (exclude ready, dispatched, delivered)
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const notReady = !['ready', 'dispatched', 'delivered'].includes(order.status)
    return matchesSearch && matchesStatus && notReady
  })

  const handleNewOrder = (data: NewOrderData) => {
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      orderType: data.orderType,
      items: data.items,
      status: 'paid',
      specialNotes: data.specialNotes,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress,
      totalPrice: data.totalPrice,
      amountPaid: data.amountPaid,
      paymentStatus: data.paymentStatus,
      isAdvanceOrder: data.isAdvanceOrder,
      estimatedMinutes: data.estimatedMinutes,
      createdAt: new Date().toISOString(),
    }
    setOrders([newOrder, ...orders])
    setShowNewOrder(false)
    showToast(`Order ${newOrder.id} created! Payment received: $${data.amountPaid.toFixed(2)}`, 'success')
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
        order.id === orderId
          ? { ...order, status: 'baker' as OrderStatus, postedToBakerAt: new Date().toISOString() }
          : order
      )
    )
    setSelectedOrder(null)
    showToast('Order posted to Baker Portal! Timer started.', 'success')
  }

  const handleOpenMessage = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMessageOrder(order)
    setMessageText('')
    setShowMessageDialog(true)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(false)
    showToast('Message sent to customer!', 'success')
  }

  const handleDispatchToDriver = () => {
    if (!dispatchDialog.order || !selectedDriver) return
    const driver = mockDrivers.find(d => d.id === selectedDriver)
    setOrders(
      orders.map((order) =>
        order.id === dispatchDialog.order?.id
          ? { ...order, status: 'dispatched' as OrderStatus, assignedTo: driver?.name }
          : order
      )
    )
    setDispatchDialog({ open: false, order: null })
    setSelectedDriver('')
    showToast(`Order dispatched to ${driver?.name}! Driver notified with location details.`, 'success')
  }

  const handleMarkPickedUp = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' as OrderStatus } : order
      )
    )
    showToast('Order marked as picked up!', 'success')
  }

  const handleDismissAlert = (orderId: string) => {
    setDismissedAlerts(new Set([...dismissedAlerts, orderId]))
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Front Desk</h1>
            <p className="text-muted-foreground">
              Orders, payments, dispatch & customer communication
            </p>
          </div>
          <Button
            onClick={() => setShowNewOrder(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </div>

        {/* ===== OVERDUE KITCHEN ALERTS ===== */}
        {overdueAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {overdueAlerts.map((alert) => (
              <div
                key={alert.order.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-red-50 border-2 border-red-300 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">
                      Kitchen Overdue: {alert.order.id} - {alert.order.customerName}
                    </p>
                    <p className="text-sm text-red-700">
                      Estimated {alert.order.estimatedMinutes} min, now {alert.minutesOver} min overdue. Please check on the kitchen.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent shrink-0"
                  onClick={() => handleDismissAlert(alert.order.id)}
                >
                  Dismiss
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ===== ADVANCE ORDER REMINDERS ===== */}
        {advanceReminders.length > 0 && (
          <div className="mb-6 space-y-2">
            {advanceReminders.map((order) => {
              const days = daysUntilDue(order.pickupDate)
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-amber-50 border-2 border-amber-300 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">
                        Advance Order Due {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}: {order.id}
                      </p>
                      <p className="text-sm text-amber-700">
                        {order.customerName} - {order.items.map(i => i.name).join(', ')}
                        {order.paymentStatus === 'deposit' && ` (Balance due: $${(order.totalPrice - order.amountPaid).toFixed(2)})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {order.status === 'paid' && (
                      <Button
                        size="sm"
                        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        onClick={() => handlePostToBaker(order.id)}
                      >
                        <ChefHat className="mr-1 h-4 w-4" />
                        Post to Baker
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== PAID ORDERS - READY TO POST ===== */}
        {paidOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                {paidOrders.length}
              </span>
              <h2 className="text-lg font-semibold text-foreground">Paid - Ready to Post to Baker</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {paidOrders.map((order) => (
                <Card key={order.id} className="border-2 border-emerald-300 bg-card shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-0">
                        <CreditCard className="mr-1 h-3 w-3" />
                        {order.paymentStatus === 'paid' ? 'Paid' : 'Deposit'}
                      </Badge>
                    </div>
                    <div className="text-sm text-foreground">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} x{item.quantity}
                          {idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{order.estimatedMinutes}min</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        onClick={() => handlePostToBaker(order.id)}
                      >
                        <ChefHat className="mr-1 h-4 w-4" />
                        Post to Baker
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ===== READY ORDERS - DISPATCH / PICKUP ===== */}
        {readyOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                {readyOrders.length}
              </span>
              <h2 className="text-lg font-semibold text-foreground">Ready Orders - Action Required</h2>
            </div>

            {/* Ready for Delivery - Send to Driver */}
            {readyDeliveryOrders.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Ready for Delivery ({readyDeliveryOrders.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {readyDeliveryOrders.map((order) => (
                    <Card key={order.id} className="border-2 border-green-400 bg-card shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 border-0">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Ready
                          </Badge>
                        </div>
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
                              <Phone className="h-3 w-3" />{order.customerPhone}
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          onClick={() => setDispatchDialog({ open: true, order })}
                        >
                          <Send className="mr-1 h-4 w-4" />
                          Send to Driver
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Ready for Customer Pickup - Text/Call customer */}
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
                          <Badge className="bg-green-100 text-green-800 border-0 text-xs">Pickup</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.map(i => i.name).join(', ')}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                            onClick={() => {
                              if (order.customerPhone) {
                                window.open(`tel:${order.customerPhone}`, '_self')
                              }
                              showToast(`Calling ${order.customerName} at ${order.customerPhone}...`, 'info')
                            }}
                          >
                            <Phone className="mr-1 h-4 w-4" />
                            Call Customer
                          </Button>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                              onClick={() => handleOpenMessage(order)}
                            >
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Text
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== FILTERS ===== */}
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
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="baker">With Baker</SelectItem>
              <SelectItem value="decorator">Decorating</SelectItem>
              <SelectItem value="quality">Quality Check</SelectItem>
              <SelectItem value="packing">Packing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ===== ORDERS GRID ===== */}
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
                    <p className="font-semibold text-foreground">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                      {statusLabels[order.status]}
                    </Badge>
                    {order.paymentStatus === 'deposit' && (
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                        Deposit Only
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm text-foreground">
                    {orderTypeLabels[order.orderType]} - {order.items.map((i) => i.name).join(', ')}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {order.pickupTime}
                    </span>
                    <span className="flex items-center gap-1">
                      {order.deliveryType === 'delivery' ? (
                        <><MapPin className="h-3.5 w-3.5 text-secondary" />Delivery</>
                      ) : (
                        <><User className="h-3.5 w-3.5" />Pickup</>
                      )}
                    </span>
                    {order.isAdvanceOrder && (
                      <Badge variant="outline" className="text-xs py-0 bg-transparent">Advance</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">{order.pickupDate}</span>
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

        {/* ===== ORDER FORM MODAL ===== */}
        {showNewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <OrderForm
                onClose={() => setShowNewOrder(false)}
                onSubmit={handleNewOrder}
              />
            </div>
          </div>
        )}

        {/* ===== ORDER DETAIL MODAL ===== */}
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

        {/* ===== DISPATCH TO DRIVER DIALOG ===== */}
        <Dialog open={dispatchDialog.open} onOpenChange={(open) => setDispatchDialog({ open, order: open ? dispatchDialog.order : null })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Send to Driver Portal</DialogTitle>
              <DialogDescription>
                Select a driver. The delivery location and customer details will be sent to their portal.
              </DialogDescription>
            </DialogHeader>

            {dispatchDialog.order && (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-4 space-y-2">
                  <p className="font-semibold text-foreground">{dispatchDialog.order.id} - {dispatchDialog.order.customerName}</p>
                  <div className="text-sm text-foreground">
                    {dispatchDialog.order.items.map((item, idx) => (
                      <span key={idx}>{item.name} x{item.quantity}{idx < dispatchDialog.order!.items.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                </div>

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
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{dispatchDialog.order.pickupDate}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{dispatchDialog.order.pickupTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />{dispatchDialog.order.customerPhone}
                  </div>
                </div>

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
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setDispatchDialog({ open: false, order: null })}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={handleDispatchToDriver}
                    disabled={!selectedDriver}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Dispatch
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ===== MESSAGE DIALOG ===== */}
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
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is ready for pickup! Please come collect it at your earliest convenience.`)}>
                    Ready for Pickup
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is out for delivery! Our driver is on the way.`)}>
                    Out for Delivery
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, a reminder that your order ${messageOrder.id} has a remaining balance of $${(messageOrder.totalPrice - messageOrder.amountPaid).toFixed(2)}. Please settle before pickup/delivery.`)}>
                    Balance Reminder
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, we need to confirm some details about your order ${messageOrder.id}. Please call us at your earliest convenience.`)}>
                    Need Confirmation
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="bg-transparent">Cancel</Button>
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== TOAST ===== */}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-white shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'warning' ? 'bg-amber-500' :
            'bg-primary'
          }`}>
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  )
}
