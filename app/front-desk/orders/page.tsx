'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FrontDeskSidebar } from '@/components/front-desk/front-desk-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderForm, NewOrderData } from '@/components/front-desk/order-form'
import { OrderDetail } from '@/components/front-desk/order-detail'
import {
  mockOrders,
  Order,
  OrderStatus,
  statusLabels,
  statusColors,
  daysUntilDue,
  minutesSincePosted,
} from '@/lib/mock-data'
import {
  Plus,
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
  Loader2,
  Timer,
  DollarSign,
  Banknote,
  Link2,
  Copy,
} from 'lucide-react'

interface OverdueAlert {
  order: Order
  minutesOver: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('actions')

  // Message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageOrder, setMessageOrder] = useState<Order | null>(null)
  const [messageText, setMessageText] = useState('')

  // Payment confirmation dialog
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)

  // Mounted guard for time-dependent renders
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'warning' }>({ show: false, message: '', type: 'success' })

  // Overdue kitchen alerts
  const [overdueAlerts, setOverdueAlerts] = useState<OverdueAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  const getTrackingUrl = useCallback((trackingId: string) => {
    return typeof window !== 'undefined' ? `${window.location.origin}/track/${trackingId}` : `/track/${trackingId}`
  }, [])

  const copyTrackingLink = useCallback((trackingId: string) => {
    const url = getTrackingUrl(trackingId)
    navigator.clipboard.writeText(url)
    showToast('Tracking link copied!', 'info')
  }, [getTrackingUrl, showToast])

  // Overdue check
  useEffect(() => {
    const checkOverdue = () => {
      const inKitchen = orders.filter(o => ['baker', 'decorator'].includes(o.status) && o.postedToBakerAt)
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

  // Advance order reminders
  const advanceReminders = orders.filter(o => {
    if (!o.isAdvanceOrder || !['paid', 'pending'].includes(o.status)) return false
    const days = daysUntilDue(o.pickupDate)
    return days <= 2 && days >= 0
  })

  // Categorize orders
  const pendingPayment = orders.filter(o => o.status === 'pending')
  const paidOrders = orders.filter(o => o.status === 'paid')
  const readyDeliveryOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'delivery' && o.paymentStatus === 'paid')
  const readyPickupOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'pickup')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const inKitchenOrders = orders.filter(o => ['baker', 'decorator', 'quality', 'packing'].includes(o.status))

  const handleNewOrder = (data: NewOrderData) => {
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      orderType: data.orderType,
      items: data.items,
      status: data.paymentStatus === 'unpaid' ? 'pending' : 'paid',
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
    if (data.paymentStatus === 'unpaid') {
      showToast(`Order ${newOrder.id} saved. Awaiting payment of $${data.totalPrice.toFixed(2)}`, 'warning')
    } else {
      showToast(`Order ${newOrder.id} created! Payment: $${data.amountPaid.toFixed(2)}`, 'success')
    }
  }

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setSelectedOrder(null)
  }

  const handlePostToBaker = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'baker' as OrderStatus, postedToBakerAt: new Date().toISOString() } : o
    ))
    setSelectedOrder(null)
    showToast('Order posted to Baker Portal with timer started.', 'success')
  }

  const handleDispatchToDriver = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'dispatched' as OrderStatus, dispatchedAt: new Date().toISOString(), driverAccepted: false } : o
    ))
    showToast('Order sent to Driver Portal. Waiting for driver to accept.', 'info')
  }

  const handleMarkPickedUp = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivered' as OrderStatus } : o))
    showToast('Order marked as picked up!', 'success')
  }

  const handleConfirmPayment = (orderId: string, paymentType: 'full' | 'deposit') => {
    setOrders(orders.map(o => {
      if (o.id !== orderId) return o
      const amountPaid = paymentType === 'full' ? o.totalPrice : Math.ceil(o.totalPrice / 2)
      return {
        ...o,
        status: 'paid' as OrderStatus,
        amountPaid,
        paymentStatus: paymentType === 'full' ? 'paid' as const : 'deposit' as const,
      }
    }))
    setShowPaymentDialog(false)
    setPaymentOrder(null)
    showToast(`Payment confirmed! Order moved to Post to Baker queue.`, 'success')
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

  // Simulate driver accepting
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

  const pendingPaymentCount = pendingPayment.length
  const actionCount = paidOrders.length + readyDeliveryOrders.length + readyPickupOrders.length
  const trackingCount = inKitchenOrders.length + dispatchedOrders.length

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">
              Create, manage, and track all bakery orders
            </p>
          </div>
          <Button onClick={() => setShowNewOrder(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </div>

        {/* ===== ALERTS ===== */}
        {(overdueAlerts.length > 0 || advanceReminders.length > 0) && (
          <div className="mb-5 space-y-2">
            {overdueAlerts.map(alert => (
              <div key={alert.order.id} className="flex items-center justify-between gap-4 rounded-xl border-2 border-red-300 bg-red-50 p-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-red-900">Kitchen Overdue: {alert.order.id} - {alert.order.customerName}</p>
                    <p className="text-xs text-red-700">Est. {alert.order.estimatedMinutes}min | {alert.minutesOver}min overdue - Check on the kitchen!</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent shrink-0" onClick={() => setDismissedAlerts(new Set([...dismissedAlerts, alert.order.id]))}>
                  Dismiss
                </Button>
              </div>
            ))}
            {advanceReminders.map(order => {
              const days = daysUntilDue(order.pickupDate)
              return (
                <div key={order.id} className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-amber-900">
                        Advance Order {days === 0 ? 'Due Today' : days === 1 ? 'Due Tomorrow' : `Due in ${days} days`}: {order.id}
                      </p>
                      <p className="text-xs text-amber-700">{order.customerName} {order.paymentStatus === 'deposit' ? `| Balance: $${(order.totalPrice - order.amountPaid).toFixed(2)}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shrink-0" onClick={() => { setPaymentOrder(order); setShowPaymentDialog(true) }}>
                        <DollarSign className="mr-1 h-4 w-4" /> Confirm Pay
                      </Button>
                    )}
                    {order.status === 'paid' && (
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0" onClick={() => handlePostToBaker(order.id)}>
                        <ChefHat className="mr-1 h-4 w-4" /> Post to Baker
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== TABS ===== */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-5 w-full grid grid-cols-3">
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Timer className="h-4 w-4" /> Action Center
              {actionCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary text-xs text-secondary-foreground font-bold px-1">
                  {actionCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="awaiting" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Awaiting Payment
              {pendingPaymentCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 text-xs text-white font-bold px-1">
                  {pendingPaymentCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Tracking
              {trackingCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-bold px-1">
                  {trackingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ===== ACTION CENTER TAB ===== */}
          <TabsContent value="actions">
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Post to Baker */}
              <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">{paidOrders.length}</span>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Post to Baker</h2>
                </div>
                <p className="text-xs text-emerald-700/70 mb-3">Paid orders ready to send to the kitchen</p>
                {paidOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-emerald-200 py-8 text-center">
                    <ChefHat className="mx-auto h-8 w-8 text-emerald-300 mb-2" />
                    <p className="text-sm text-muted-foreground">No orders waiting</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paidOrders.map(order => (
                      <Card key={order.id} className="border-0 shadow-sm bg-card">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-foreground">{order.id}</p>
                              <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                                <CreditCard className="mr-1 h-3 w-3" />
                                {order.paymentStatus === 'deposit' ? 'Deposit' : 'Paid'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-foreground truncate">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />{order.pickupDate}
                            <Clock className="h-3 w-3 ml-1" />{order.pickupTime}
                            <Timer className="h-3 w-3 ml-1" />~{order.estimatedMinutes}min
                          </div>
                          <button
                            type="button"
                            onClick={() => copyTrackingLink(order.trackingId)}
                            className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                          >
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                            <Copy className="h-3 w-3 shrink-0" />
                          </button>
                          <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => handlePostToBaker(order.id)}>
                            <ChefHat className="mr-1 h-4 w-4" /> Post to Baker
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Dispatch to Driver */}
              <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">{readyDeliveryOrders.length}</span>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800">Dispatch to Driver</h2>
                </div>
                <p className="text-xs text-blue-700/70 mb-3">Packed orders that need delivery dispatch</p>
                {readyDeliveryOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-blue-200 py-8 text-center">
                    <Truck className="mx-auto h-8 w-8 text-blue-300 mb-2" />
                    <p className="text-sm text-muted-foreground">No delivery orders ready</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {readyDeliveryOrders.map(order => (
                      <Card key={order.id} className="border-0 shadow-sm bg-card">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-foreground">{order.id}</p>
                              <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 border-0 text-xs shrink-0">
                              <Truck className="mr-1 h-3 w-3" /> Delivery
                            </Badge>
                          </div>
                          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 space-y-1">
                            <div className="flex items-start gap-1.5 text-xs text-foreground">
                              <MapPin className="h-3 w-3 mt-0.5 text-blue-600 shrink-0" />
                              <span className="font-medium">{order.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />{order.customerPhone}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyTrackingLink(order.trackingId)}
                            className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                          >
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                            <Copy className="h-3 w-3 shrink-0" />
                          </button>
                          <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => handleDispatchToDriver(order.id)}>
                            <Send className="mr-1 h-4 w-4" /> Send to Driver
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Customer Pickup */}
              <section className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">{readyPickupOrders.length}</span>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-green-800">Customer Pickup</h2>
                </div>
                <p className="text-xs text-green-700/70 mb-3">Ready orders waiting for customer pickup</p>
                {readyPickupOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-green-200 py-8 text-center">
                    <Package className="mx-auto h-8 w-8 text-green-300 mb-2" />
                    <p className="text-sm text-muted-foreground">No pickup orders ready</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {readyPickupOrders.map(order => (
                      <Card key={order.id} className="border-0 shadow-sm bg-card">
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-foreground">{order.id}</p>
                              <p className="text-xs text-muted-foreground truncate">{order.customerName}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-0 text-xs shrink-0">
                              <Package className="mr-1 h-3 w-3" /> Pickup
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground truncate">{order.items.map(i => i.name).join(', ')}</p>
                          <button
                            type="button"
                            onClick={() => copyTrackingLink(order.trackingId)}
                            className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                          >
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                            <Copy className="h-3 w-3 shrink-0" />
                          </button>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" onClick={() => {
                              if (order.customerPhone) window.open(`tel:${order.customerPhone}`, '_self')
                              showToast(`Calling ${order.customerName}...`, 'info')
                            }}>
                              <Phone className="mr-1 h-3.5 w-3.5" /> Call Customer
                            </Button>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent" onClick={() => handleOpenMessage(order)}>
                                <MessageSquare className="mr-1 h-3.5 w-3.5" /> Text
                              </Button>
                              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleMarkPickedUp(order.id)}>
                                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Picked Up
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>

          {/* ===== AWAITING PAYMENT TAB ===== */}
          <TabsContent value="awaiting">
            <div className="space-y-4">
              {pendingPayment.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">No orders awaiting payment</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">All orders are paid or saved orders will appear here</p>
                </div>
              ) : (
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-muted-foreground">
                    {pendingPayment.length} order{pendingPayment.length !== 1 ? 's' : ''} awaiting customer payment. Confirm payment to move to baker queue.
                  </p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pendingPayment.map(order => {
                  const timeSinceCreated = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))
                  return (
                    <Card key={order.id} className="border-2 border-amber-200 bg-card shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-foreground">{order.id}</p>
                              {timeSinceCreated > 30 && (
                                <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                                  <Clock className="mr-1 h-3 w-3" />{timeSinceCreated}min ago
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-bold text-secondary">${order.totalPrice.toFixed(2)}</p>
                            <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Unpaid</Badge>
                          </div>
                        </div>

                        {/* Items */}
                        <div className="rounded-lg bg-muted/50 p-2.5 space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-foreground">{item.name} x{item.quantity}</span>
                              <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                          <span className="flex items-center gap-1">
                            {order.deliveryType === 'delivery' ? <><Truck className="h-3 w-3 text-secondary" />Delivery</> : <><User className="h-3 w-3" />Pickup</>}
                          </span>
                        </div>
                        {order.isAdvanceOrder && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            Advance order - 50% deposit option available
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-1">
                          <Button
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => { setPaymentOrder(order); setShowPaymentDialog(true) }}
                          >
                            <DollarSign className="mr-1 h-4 w-4" /> Confirm Payment
                          </Button>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent" onClick={() => handleOpenMessage(order)}>
                              <MessageSquare className="mr-1 h-3.5 w-3.5" /> Remind
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent" onClick={() => {
                              if (order.customerPhone) window.open(`tel:${order.customerPhone}`, '_self')
                              showToast(`Calling ${order.customerName}...`, 'info')
                            }}>
                              <Phone className="mr-1 h-3.5 w-3.5" /> Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* ===== TRACKING TAB ===== */}
          <TabsContent value="tracking">
            <div className="space-y-6">
              {/* Dispatched orders */}
              {dispatchedOrders.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">{dispatchedOrders.length}</span>
                    <h2 className="text-sm font-bold uppercase tracking-wide text-purple-800">Out for Delivery</h2>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {dispatchedOrders.map(order => (
                      <Card key={order.id} className={`shadow-sm bg-card ${order.driverAccepted ? 'border-2 border-green-300' : 'border-2 border-purple-200'}`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            {order.driverAccepted ? (
                              <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" /> Driver Accepted
                              </Badge>
                            ) : (
                              <Badge className="bg-purple-100 text-purple-800 border-0 text-xs animate-pulse">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Waiting for Driver
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
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); copyTrackingLink(order.trackingId) }}
                            className="flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors w-full"
                          >
                            <Link2 className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono flex-1 text-left">{order.trackingId}</span>
                            <Copy className="h-3 w-3 shrink-0" />
                          </button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* In Kitchen */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">{inKitchenOrders.length}</span>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-orange-800">In Kitchen</h2>
                </div>
                {inKitchenOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
                    <ChefHat className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No orders in the kitchen</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {inKitchenOrders.map(order => {
                      const elapsed = mounted && order.postedToBakerAt ? minutesSincePosted(order.postedToBakerAt) : 0
                      const isOverdue = elapsed > order.estimatedMinutes
                      const progress = Math.min((elapsed / order.estimatedMinutes) * 100, 100)
                      return (
                        <Card key={order.id} className={`border-0 shadow-sm bg-card cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'ring-2 ring-red-300' : ''}`} onClick={() => setSelectedOrder(order)}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-sm text-foreground">{order.id} - {order.customerName}</p>
                                <p className="text-xs text-muted-foreground truncate">{order.items.map(i => i.name).join(', ')}</p>
                              </div>
                              <Badge className={`${statusColors[order.status]} border-0 text-xs shrink-0`}>{statusLabels[order.status]}</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : progress > 75 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${progress}%` }} />
                              </div>
                              <span className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {elapsed}m / {order.estimatedMinutes}m
                              </span>
                            </div>
                            {isOverdue && (
                              <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Overdue by {elapsed - order.estimatedMinutes}min
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </section>

              {/* Nothing in tracking */}
              {inKitchenOrders.length === 0 && dispatchedOrders.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
                  <Timer className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">Nothing to track right now</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Orders in production or delivery will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* ===== MODALS ===== */}
        {showNewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <OrderForm onClose={() => setShowNewOrder(false)} onSubmit={handleNewOrder} />
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={handleUpdateStatus} onPostToBaker={handlePostToBaker} onMessage={(order) => handleOpenMessage(order)} />
            </div>
          </div>
        )}

        {/* Payment Confirmation Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirm Payment</DialogTitle>
            </DialogHeader>
            {paymentOrder && (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{paymentOrder.id}</p>
                    <p className="text-lg font-bold text-secondary">${paymentOrder.totalPrice.toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{paymentOrder.customerName} - {paymentOrder.customerPhone}</p>
                  <p className="text-xs text-muted-foreground">{paymentOrder.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left transition-all hover:border-green-500 hover:shadow-sm"
                    onClick={() => handleConfirmPayment(paymentOrder.id, 'full')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-900">Full Payment</p>
                        <p className="text-xs text-green-700">Customer pays full amount now</p>
                      </div>
                      <p className="text-xl font-bold text-green-800">${paymentOrder.totalPrice.toFixed(2)}</p>
                    </div>
                  </button>

                  {paymentOrder.isAdvanceOrder && (
                    <button
                      type="button"
                      className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-left transition-all hover:border-amber-500 hover:shadow-sm"
                      onClick={() => handleConfirmPayment(paymentOrder.id, 'deposit')}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-amber-900">50% Deposit</p>
                          <p className="text-xs text-amber-700">Balance ${(paymentOrder.totalPrice / 2).toFixed(2)} on pickup day</p>
                        </div>
                        <p className="text-xl font-bold text-amber-800">${(paymentOrder.totalPrice / 2).toFixed(2)}</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Message Dialog */}
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
                  <Textarea placeholder="Type message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="min-h-[100px]" />
                </div>
                {/* Auto-include tracking link */}
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2.5 mb-2">
                  <Link2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-600 font-mono truncate flex-1">{getTrackingUrl(messageOrder.trackingId)}</p>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-700 hover:bg-blue-100" onClick={() => copyTrackingLink(messageOrder.trackingId)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Tracking link is auto-appended to every message sent.</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is ready for pickup! Track here: ${getTrackingUrl(messageOrder.trackingId)}`)}>Ready for Pickup</Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is out for delivery! Track live: ${getTrackingUrl(messageOrder.trackingId)}`)}>Out for Delivery</Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, we are waiting for your payment of $${messageOrder.totalPrice.toFixed(2)} for order ${messageOrder.id}. Please confirm. Track: ${getTrackingUrl(messageOrder.trackingId)}`)}>Payment Reminder</Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order has a balance of $${(messageOrder.totalPrice - messageOrder.amountPaid).toFixed(2)}. Track: ${getTrackingUrl(messageOrder.trackingId)}`)}>Balance Reminder</Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="bg-transparent">Cancel</Button>
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast */}
        {toast.show && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3 shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'
          }`}>
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  )
}
