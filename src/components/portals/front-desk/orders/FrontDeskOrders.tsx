'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderDetail } from '@/components/portals/front-desk/orders/OrderDetail'
import { OrderAlertsBar } from '@/components/portals/front-desk/orders/OrderAlertsBar'
import { PaymentConfirmDialog } from '@/components/portals/front-desk/orders/PaymentConfirmDialog'
import { MessageCustomerDialog } from '@/components/portals/front-desk/orders/MessageCustomerDialog'
import { ActionCenterTab } from '@/components/portals/front-desk/orders/ActionCenterTab'
import { AwaitingPaymentTab } from '@/components/portals/front-desk/orders/AwaitingPaymentTab'
import { TrackingTab } from '@/components/portals/front-desk/orders/TrackingTab'
import { DispatchDriverDialog } from '@/components/portals/front-desk/orders/DispatchDriverDialog'
import type { Order, OrderStatus, OverdueAlert } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { daysUntilDue, minutesSincePosted } from '@/lib/utils/date'
import { Plus, Cake, Clock, Timer, Banknote } from 'lucide-react'

export function FrontDeskOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('actions')
  const [mounted, setMounted] = useState(false)

  // Dispatch dialog
  const [showDispatchDialog, setShowDispatchDialog] = useState(false)
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null)

  // Message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageOrder, setMessageOrder] = useState<Order | null>(null)

  // Payment confirmation dialog
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)

  // Overdue kitchen alerts
  const [overdueAlerts, setOverdueAlerts] = useState<OverdueAlert[]>([])
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setOrders(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const getTrackingUrl = useCallback((trackingId: string) => {
    return typeof globalThis.window !== 'undefined'
      ? `${globalThis.window.location.origin}/track/${trackingId}`
      : `/track/${trackingId}`
  }, [])

  const copyTrackingLink = useCallback((trackingId: string) => {
    navigator.clipboard.writeText(getTrackingUrl(trackingId))
    toast.info('Tracking link copied!')
  }, [getTrackingUrl])

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
      toast.success('Driver Tom Martinez accepted the delivery!')
    }, 8000)
    return () => clearTimeout(timer)
  }, [orders])

  // Advance order reminders
  const advanceReminders = orders.filter(o => {
    if (!o.isAdvanceOrder || !['paid', 'pending'].includes(o.status)) return false
    const days = daysUntilDue(o.pickupDate)
    return days <= 2 && days >= 0
  })

  // Awaiting Payment: only orders that still have an outstanding balance
  const pendingPayment = orders.filter(o => o.status === 'pending' && o.paymentStatus !== 'paid')
  // Action Center: paid orders + COD orders ready to be posted to baker
  const paidOrders = orders.filter(o =>
    o.status === 'paid' ||
    (o.status === 'pending' && o.paymentStatus === 'paid') ||
    (o.status === 'pending' && o.paymentTerms === 'on_delivery')
  )
  // Paid + COD delivery orders can be dispatched directly
  const readyDeliveryOrders = orders.filter(
    o => o.status === 'ready' && o.deliveryType === 'delivery' &&
         (o.paymentStatus === 'paid' || o.paymentTerms === 'on_delivery')
  )
  // Truly blocked: non-COD delivery orders with outstanding balance
  const readyDeliveryUnpaid = orders.filter(
    o => o.status === 'ready' && o.deliveryType === 'delivery' &&
         o.paymentStatus !== 'paid' && o.paymentTerms !== 'on_delivery'
  )
  const readyPickupOrders = orders.filter(o => o.status === 'ready' && o.deliveryType === 'pickup')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const inKitchenOrders = orders.filter(o => ['baker', 'decorator', 'quality', 'packing'].includes(o.status))

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setSelectedOrder(null)
  }

  const handlePostToBaker = async (orderId: string) => {
    const prev = orders
    setOrders(p => p.map(o =>
      o.id === orderId ? { ...o, status: 'baker' as OrderStatus, postedToBakerAt: new Date().toISOString() } : o
    ))
    setSelectedOrder(null)
    toast.success('Order posted to Baker Portal.')
    try {
      const updated = await ordersService.postToBaker(orderId)
      setOrders(p => p.map(o => o.id === orderId ? updated : o))
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
  }

  const handleDispatchToDriver = (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    setDispatchOrder(order)
    setShowDispatchDialog(true)
  }

  const handleConvertToDelivery = async (orderId: string, deliveryAddress: string) => {
    const prev = orders
    // Optimistic update
    setOrders(p => p.map(o =>
      o.id === orderId ? { ...o, deliveryType: 'delivery' as const, deliveryAddress } : o
    ))
    try {
      const updated = await ordersService.update(orderId, {
        deliveryType: 'delivery' as const,
        deliveryAddress,
      })
      setOrders(p => p.map(o => o.id === orderId ? updated : o))
      toast.success('Order converted to delivery!')
      // Open driver dispatch immediately
      setDispatchOrder(updated)
      setShowDispatchDialog(true)
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
  }

  const handleMarkPickedUp = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    // Block only non-COD unpaid pickup orders
    if (order && order.paymentStatus !== 'paid' && order.paymentTerms !== 'on_delivery') {
      toast.error('This order has an outstanding balance. Please collect full payment before marking as picked up.')
      return
    }
    const prev = orders
    setOrders(p => p.map(o => o.id === orderId ? { ...o, status: 'delivered' as OrderStatus } : o))
    toast.success('Order marked as picked up!')
    try {
      const updated = await ordersService.markDelivered(orderId)
      setOrders(p => p.map(o => o.id === orderId ? updated : o))
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
  }

  const handleConfirmPayment = async (orderId: string, paymentType: 'full' | 'deposit', amountOverride?: number) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return
    // Use the amount passed from the dialog (which may differ from 50% for deposits)
    const amount = amountOverride ?? (paymentType === 'full' ? order.totalPrice : Math.ceil(order.totalPrice / 2))
    const prev = orders
    setOrders(p => p.map(o => {
      if (o.id !== orderId) return o
      // Don't optimistically set status='paid' — only the backend knows if the full
      // amount has been paid. Just update the financial fields and let the API
      // response set the authoritative status.
      const newPaymentStatus = paymentType === 'full' ? 'paid' as const : 'deposit' as const
      return { ...o, amountPaid: amount, paymentStatus: newPaymentStatus }
    }))
    setShowPaymentDialog(false)
    setPaymentOrder(null)
    toast.success(
      paymentType === 'full'
        ? 'Full payment confirmed! Order moved to baker queue.'
        : `Deposit of TZS ${amount.toLocaleString()} recorded.`
    )
    try {
      const updated = await ordersService.recordPayment(orderId, amount, order.paymentMethod ?? 'cash')
      setOrders(p => p.map(o => o.id === orderId ? updated : o))
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
  }

  const handleOpenMessage = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMessageOrder(order)
    setShowMessageDialog(true)
  }

  const pendingPaymentCount = pendingPayment.length
  const actionCount = paidOrders.length + readyDeliveryOrders.length + readyDeliveryUnpaid.length + readyPickupOrders.length
  const trackingCount = inKitchenOrders.length + dispatchedOrders.length

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">Create, manage, and track all bakery orders</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
              <Link href="/front-desk/orders/new?mode=menu">
                <Plus className="mr-2 h-5 w-5" />
                New Order
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/front-desk/orders/new?mode=custom">
                <Cake className="mr-2 h-5 w-5" />
                Custom Cake
              </Link>
            </Button>
          </div>
        </div>

        <OrderAlertsBar
          overdueAlerts={overdueAlerts}
          advanceReminders={advanceReminders}
          onDismissAlert={orderId => setDismissedAlerts(new Set([...dismissedAlerts, orderId]))}
          onConfirmPayment={order => { setPaymentOrder(order); setShowPaymentDialog(true) }}
          onPostToBaker={handlePostToBaker}
        />

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

          <TabsContent value="actions">
            <ActionCenterTab
              paidOrders={paidOrders}
              readyDeliveryOrders={readyDeliveryOrders}
              readyDeliveryUnpaid={readyDeliveryUnpaid}
              readyPickupOrders={readyPickupOrders}
              onPostToBaker={handlePostToBaker}
              onDispatchToDriver={handleDispatchToDriver}
              onMarkPickedUp={handleMarkPickedUp}
              onOpenMessage={handleOpenMessage}
              copyTrackingLink={copyTrackingLink}
              onCollectPayment={(order: Order) => { setPaymentOrder(order); setShowPaymentDialog(true) }}
              onConvertToDelivery={handleConvertToDelivery}
            />
          </TabsContent>

          <TabsContent value="awaiting">
            <AwaitingPaymentTab
              pendingPayment={pendingPayment}
              onConfirmPaymentClick={order => { setPaymentOrder(order); setShowPaymentDialog(true) }}
              onOpenMessage={handleOpenMessage}
            />
          </TabsContent>

          <TabsContent value="tracking">
            <TrackingTab
              inKitchenOrders={inKitchenOrders}
              dispatchedOrders={dispatchedOrders}
              mounted={mounted}
              onSelectOrder={setSelectedOrder}
              copyTrackingLink={copyTrackingLink}
            />
          </TabsContent>
        </Tabs>

        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <OrderDetail
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={handleUpdateStatus}
                onPostToBaker={handlePostToBaker}
                onMessage={order => handleOpenMessage(order)}
              />
            </div>
          </div>
        )}

        <PaymentConfirmDialog
          order={paymentOrder}
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onConfirm={handleConfirmPayment}
        />

        <MessageCustomerDialog
          order={messageOrder}
          open={showMessageDialog}
          onOpenChange={open => {
            setShowMessageDialog(open)
            if (!open) setMessageOrder(null)
          }}
          onSend={() => {
            setShowMessageDialog(false)
            toast.success(`Message sent to ${messageOrder?.customer.name}!`)
          }}
          getTrackingUrl={getTrackingUrl}
          onCopyLink={copyTrackingLink}
        />

        <DispatchDriverDialog
          order={dispatchOrder}
          open={showDispatchDialog}
          onOpenChange={open => {
            setShowDispatchDialog(open)
            if (!open) setDispatchOrder(null)
          }}
          onDispatched={updatedOrder => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o))
          }}
        />
      </main>
    </div>
  )
}
