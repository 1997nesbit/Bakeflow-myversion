'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderForm } from '@/components/portals/front-desk/orders/OrderForm'
import { OrderDetail } from '@/components/portals/front-desk/orders/OrderDetail'
import { OrderAlertsBar } from '@/components/portals/front-desk/orders/OrderAlertsBar'
import { PaymentConfirmDialog } from '@/components/portals/front-desk/orders/PaymentConfirmDialog'
import { MessageCustomerDialog } from '@/components/portals/front-desk/orders/MessageCustomerDialog'
import { ActionCenterTab } from '@/components/portals/front-desk/orders/ActionCenterTab'
import { AwaitingPaymentTab } from '@/components/portals/front-desk/orders/AwaitingPaymentTab'
import { TrackingTab } from '@/components/portals/front-desk/orders/TrackingTab'
import type { Order, OrderStatus, OverdueAlert, NewOrderData } from '@/types/order'
import { mockOrders } from '@/data/mock/orders'
import { daysUntilDue, minutesSincePosted } from '@/lib/utils/date'
import { Plus, Clock, Timer, Banknote } from 'lucide-react'

export function FrontDeskOrders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('actions')
  const [mounted, setMounted] = useState(false)

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
      paymentTerms: data.paymentTerms,
      trackingId: data.trackingId,
      createdAt: new Date().toISOString(),
    }
    setOrders([newOrder, ...orders])
    setShowNewOrder(false)
    if (data.paymentStatus === 'unpaid') {
      toast.warning(`Order ${newOrder.id} saved. Awaiting payment of TZS ${data.totalPrice.toLocaleString()}`)
    } else {
      toast.success(`Order ${newOrder.id} created! Payment: TZS ${data.amountPaid.toLocaleString()}`)
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
    toast.success('Order posted to Baker Portal with timer started.')
  }

  const handleDispatchToDriver = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'dispatched' as OrderStatus, dispatchedAt: new Date().toISOString(), driverAccepted: false } : o
    ))
    toast.info('Order sent to Driver Portal. Waiting for driver to accept.')
  }

  const handleMarkPickedUp = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'delivered' as OrderStatus } : o))
    toast.success('Order marked as picked up!')
  }

  const handleConfirmPayment = (orderId: string, paymentType: 'full' | 'deposit') => {
    setOrders(orders.map(o => {
      if (o.id !== orderId) return o
      const amountPaid = paymentType === 'full' ? o.totalPrice : Math.ceil(o.totalPrice / 2)
      return { ...o, status: 'paid' as OrderStatus, amountPaid, paymentStatus: paymentType === 'full' ? 'paid' as const : 'deposit' as const }
    }))
    setShowPaymentDialog(false)
    setPaymentOrder(null)
    toast.success('Payment confirmed! Order moved to Post to Baker queue.')
  }

  const handleOpenMessage = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMessageOrder(order)
    setShowMessageDialog(true)
  }

  const pendingPaymentCount = pendingPayment.length
  const actionCount = paidOrders.length + readyDeliveryOrders.length + readyPickupOrders.length
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
          <Button onClick={() => setShowNewOrder(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
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
              readyPickupOrders={readyPickupOrders}
              onPostToBaker={handlePostToBaker}
              onDispatchToDriver={handleDispatchToDriver}
              onMarkPickedUp={handleMarkPickedUp}
              onOpenMessage={handleOpenMessage}
              copyTrackingLink={copyTrackingLink}
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
            toast.success(`Message sent to ${messageOrder?.customerName}!`)
          }}
          getTrackingUrl={getTrackingUrl}
          onCopyLink={copyTrackingLink}
        />
      </main>
    </div>
  )
}
