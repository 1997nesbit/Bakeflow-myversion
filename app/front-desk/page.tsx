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
  DialogFooter,
} from '@/components/ui/dialog'
import { OrderForm, NewOrderData } from '@/components/front-desk/order-form'
import { OrderDetail } from '@/components/front-desk/order-detail'
import {
  mockOrders,
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
  AlertTriangle,
  Bell,
  CreditCard,
  Phone,
  ArrowRight,
  Loader2,
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

  // Check for overdue orders in kitchen
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
    const interval = setInterval(checkOverdue, 30000)
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

  // Categorize orders
  const paidOrders = orders.filter(o => o.status === 'paid')
  const readyDeliveryOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'delivery' && o.paymentStatus === 'paid')
  const readyPickupOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'pickup')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const activeActionCount = paidOrders.length + readyDeliveryOrders.length + readyPickupOrders.length

  // In-kitchen orders
  const inKitchenOrders = orders.filter(o => ['baker', 'decorator', 'quality', 'packing'].includes(o.status))

  // Filtered for the all-orders table
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
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
    showToast(`Order ${newOrder.id} created! Payment: $${data.amountPaid.toFixed(2)}`, 'success')
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
    showToast('Order posted to Baker Portal with timer started.', 'success')
  }

  const handleDispatchToDriver = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'dispatched' as OrderStatus, dispatchedAt: new Date().toISOString(), driverAccepted: false }
          : order
      )
    )
    showToast('Order sent to Driver Portal. Waiting for driver to accept.', 'info')
  }

  const handleMarkPickedUp = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'delivered' as OrderStatus } : order
      )
    )
    showToast('Order marked as picked up!', 'success')
  }

  const handleOpenMessage = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMessageOrder(order)
    setMessageText('')
    setShowMessageDialog(true)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(false)
    showToast(`Message sent to ${messageOrder?.customerName}!`, 'success')
  }

  const handleDismissAlert = (orderId: string) => {
    setDismissedAlerts(new Set([...dismissedAlerts, orderId]))
  }

  // Simulate a driver accepting after dispatch (for demo)
  useEffect(() => {
    const pendingAcceptance = orders.filter(o => o.status === 'dispatched' && o.driverAccepted === false)
    if (pendingAcceptance.length === 0) return
    const timer = setTimeout(() => {
      setOrders(prev =>
        prev.map(o =>
          o.status === 'dispatched' && o.driverAccepted === false
            ? { ...o, driverAccepted: true, assignedTo: 'Tom Martinez' }
            : o
        )
      )
      showToast('Driver Tom Martinez accepted the delivery!', 'success')
    }, 8000)
    return () => clearTimeout(timer)
  }, [orders, showToast])

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* ===== HEADER ===== */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Front Desk</h1>
            <p className="text-sm text-muted-foreground">
              {activeActionCount > 0
                ? `${activeActionCount} order(s) need your attention`
                : 'All caught up!'}
            </p>
          </div>
          <Button
            onClick={() => setShowNewOrder(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </div>

        {/* ===== OVERDUE KITCHEN ALERTS ===== */}
        {overdueAlerts.length > 0 && (
          <section className="mb-5 space-y-2">
            {overdueAlerts.map((alert) => (
              <div
                key={alert.order.id}
                className="flex items-center justify-between gap-4 rounded-xl border-2 border-red-300 bg-red-50 p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">
                      Kitchen Overdue: {alert.order.id} - {alert.order.customerName}
                    </p>
                    <p className="text-sm text-red-700">
                      Est. {alert.order.estimatedMinutes}min | {alert.minutesOver}min overdue. Check on the kitchen.
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
          </section>
        )}

        {/* ===== ADVANCE ORDER REMINDERS ===== */}
        {advanceReminders.length > 0 && (
          <section className="mb-5 space-y-2">
            {advanceReminders.map((order) => {
              const days = daysUntilDue(order.pickupDate)
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">
                        Advance Order Due {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}: {order.id}
                      </p>
                      <p className="text-sm text-amber-700">
                        {order.customerName} - {order.items.map(i => i.name).join(', ')}
                        {order.paymentStatus === 'deposit' && ` | Balance: $${(order.totalPrice - order.amountPaid).toFixed(2)}`}
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
          </section>
        )}

        {/* ===== ACTION BOARDS ===== */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">

          {/* --- BOARD 1: Paid - Post to Baker --- */}
          <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                {paidOrders.length}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Post to Baker</h2>
            </div>
            {paidOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No orders waiting</p>
            ) : (
              <div className="space-y-3">
                {paidOrders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm bg-card">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                          <CreditCard className="mr-1 h-3 w-3" />
                          {order.paymentStatus === 'deposit' ? 'Deposit' : 'Paid'}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />{order.pickupDate}
                        <Clock className="h-3 w-3 ml-1" />{order.pickupTime}
                        <Clock className="h-3 w-3 ml-1" />~{order.estimatedMinutes}min
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        onClick={() => handlePostToBaker(order.id)}
                      >
                        <ChefHat className="mr-1 h-4 w-4" />
                        Post to Baker
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* --- BOARD 2: Ready - Delivery dispatch --- */}
          <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                {readyDeliveryOrders.length}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">Dispatch to Driver</h2>
            </div>
            {readyDeliveryOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No delivery orders ready</p>
            ) : (
              <div className="space-y-3">
                {readyDeliveryOrders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm bg-card">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                          <Truck className="mr-1 h-3 w-3" />
                          Delivery
                        </Badge>
                      </div>
                      <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-2 space-y-1">
                        <div className="flex items-start gap-1.5 text-xs text-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 text-secondary shrink-0" />
                          <span className="font-medium">{order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />{order.customerPhone}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        onClick={() => handleDispatchToDriver(order.id)}
                      >
                        <Send className="mr-1 h-4 w-4" />
                        Send to Driver
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* --- BOARD 3: Ready - Customer Pickup --- */}
          <section className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                {readyPickupOrders.length}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-green-800">Customer Pickup</h2>
            </div>
            {readyPickupOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No pickup orders ready</p>
            ) : (
              <div className="space-y-3">
                {readyPickupOrders.map((order) => (
                  <Card key={order.id} className="border-0 shadow-sm bg-card">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                          <Package className="mr-1 h-3 w-3" />
                          Pickup
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground">{order.items.map(i => i.name).join(', ')}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          onClick={() => {
                            if (order.customerPhone) window.open(`tel:${order.customerPhone}`, '_self')
                            showToast(`Calling ${order.customerName}...`, 'info')
                          }}
                        >
                          <Phone className="mr-1 h-3.5 w-3.5" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                          onClick={() => handleOpenMessage(order)}
                        >
                          <MessageSquare className="mr-1 h-3.5 w-3.5" />
                          Text
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleMarkPickedUp(order.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Picked Up
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ===== DISPATCHED ORDERS - DRIVER TRACKING ===== */}
        {dispatchedOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                {dispatchedOrders.length}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-purple-800">Out for Delivery</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {dispatchedOrders.map((order) => (
                <Card key={order.id} className={`border-2 shadow-sm bg-card ${order.driverAccepted ? 'border-green-300' : 'border-purple-200'}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      {order.driverAccepted ? (
                        <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Driver Accepted
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-100 text-purple-800 border-0 text-xs animate-pulse">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Waiting for Driver
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                    {order.driverAccepted && order.assignedTo && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-2 text-sm">
                        <User className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">{order.assignedTo} is delivering</span>
                      </div>
                    )}
                    {!order.driverAccepted && (
                      <p className="text-xs text-muted-foreground">Notification sent to driver portal. Waiting for acceptance...</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ===== IN KITCHEN TRACKER ===== */}
        {inKitchenOrders.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                {inKitchenOrders.length}
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-orange-800">In Kitchen</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {inKitchenOrders.map((order) => (
                <Card
                  key={order.id}
                  className="border-0 shadow-sm bg-card cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-sm text-foreground">{order.id}</p>
                      <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{order.customerName}</p>
                    <p className="text-xs text-foreground">{order.items.map(i => i.name).join(', ')}</p>
                    {order.postedToBakerAt && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {minutesSincePosted(order.postedToBakerAt)}min elapsed / {order.estimatedMinutes}min est.
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ===== ALL ORDERS TABLE ===== */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">All Orders</h2>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Payment</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="baker">With Baker</SelectItem>
                  <SelectItem value="decorator">Decorating</SelectItem>
                  <SelectItem value="quality">Quality Check</SelectItem>
                  <SelectItem value="packing">Packing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="dispatched">With Driver</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer border-0 shadow-sm bg-card transition-shadow hover:shadow-md"
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                        {statusLabels[order.status]}
                      </Badge>
                      {order.paymentStatus === 'deposit' && (
                        <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Deposit</Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-foreground">{order.items.map(i => i.name).join(', ')}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                      <span className="flex items-center gap-1">
                        {order.deliveryType === 'delivery' ? (
                          <><Truck className="h-3 w-3 text-secondary" />Delivery</>
                        ) : (
                          <><User className="h-3 w-3" />Pickup</>
                        )}
                      </span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                    <span className="text-sm font-semibold text-secondary">${order.totalPrice.toFixed(2)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      onClick={(e) => handleOpenMessage(order, e)}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="mt-8 text-center py-12 rounded-xl border-2 border-dashed border-border">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </section>

        {/* ===== ORDER FORM MODAL ===== */}
        {showNewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <OrderForm onClose={() => setShowNewOrder(false)} onSubmit={handleNewOrder} />
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

        {/* ===== MESSAGE DIALOG ===== */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Message Customer</DialogTitle>
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
                    placeholder="Type message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is ready for pickup!`)}>
                    Ready for Pickup
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is out for delivery!`)}>
                    Out for Delivery
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order has a balance of $${(messageOrder.totalPrice - messageOrder.amountPaid).toFixed(2)}. Please settle before pickup.`)}>
                    Balance Reminder
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
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' :
            toast.type === 'warning' ? 'bg-amber-500 text-white' :
            'bg-primary text-primary-foreground'
          }`}>
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  )
}
