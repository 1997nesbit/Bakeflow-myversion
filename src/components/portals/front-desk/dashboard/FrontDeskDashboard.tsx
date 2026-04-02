'use client'

import { useState, useEffect } from 'react'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Order } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { daysUntilDue, minutesSincePosted } from '@/lib/utils/date'
import { Bell, PlusCircle } from 'lucide-react'
import { DashboardAlerts } from './DashboardAlerts'
import { DashboardMetricCards } from './DashboardMetricCards'
import { OrderPipeline } from './OrderPipeline'
import { ActionNeededPanel } from './ActionNeededPanel'
import { KitchenTracker } from './KitchenTracker'
import { DepositTracker } from './DepositTracker'

export function FrontDeskDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const interval = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setOrders(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0)
  const pendingPayments = orders.filter(o => o.paymentStatus === 'unpaid')
  const depositOrders = orders.filter(o => o.paymentStatus === 'deposit')
  const outstandingBalance = [...pendingPayments, ...depositOrders].reduce((s, o) => s + (o.totalPrice - o.amountPaid), 0)
  const paidReadyToPost = orders.filter(o => o.status === 'paid')
  const inKitchen = orders.filter(o => ['baker', 'decorator', 'quality', 'packing'].includes(o.status))
  const readyOrders = orders.filter(o => o.status === 'ready')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const goldCustomerOrders = orders.filter(o => o.customer.isGold)

  const overdueOrders = mounted ? orders.filter(o => {
    if (!['baker', 'decorator'].includes(o.status) || !o.postedToBakerAt) return false
    return minutesSincePosted(o.postedToBakerAt) > o.estimatedMinutes
  }) : []

  const advanceDueSoon = mounted ? orders.filter(o => {
    if (!o.isAdvanceOrder || !['paid', 'pending'].includes(o.status)) return false
    const days = daysUntilDue(o.pickupDate)
    return days <= 2 && days >= 0
  }) : []

  const actionCount = paidReadyToPost.length + readyOrders.length + pendingPayments.length

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Front Desk</h1>
              <p className="text-xs text-muted-foreground">
                {currentTime
                  ? `${currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} \u00B7 ${currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                  : '\u00A0'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {actionCount > 0 && (
                <Link href="/front-desk/orders">
                  <Badge className="bg-secondary text-secondary-foreground px-3 py-1.5 text-xs cursor-pointer hover:bg-secondary/90">
                    <Bell className="mr-1.5 h-3.5 w-3.5" />
                    {actionCount} action{actionCount === 1 ? '' : 's'} needed
                  </Badge>
                </Link>
              )}
              <Link href="/front-desk/orders">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DashboardAlerts overdueOrders={overdueOrders} advanceDueSoon={advanceDueSoon} mounted={mounted} />
          <DashboardMetricCards
            orders={orders} totalRevenue={totalRevenue} outstandingBalance={outstandingBalance}
            completedOrders={completedOrders} goldCustomerOrders={goldCustomerOrders}
            pendingPayments={pendingPayments} depositOrders={depositOrders}
          />
          <OrderPipeline
            pendingPayments={pendingPayments} paidReadyToPost={paidReadyToPost}
            inKitchen={inKitchen} readyOrders={readyOrders}
            dispatchedOrders={dispatchedOrders} completedOrders={completedOrders}
          />
          <div className="grid gap-6 lg:grid-cols-5">
            <ActionNeededPanel
              paidReadyToPost={paidReadyToPost} readyOrders={readyOrders}
              pendingPayments={pendingPayments} actionCount={actionCount}
            />
            <KitchenTracker inKitchen={inKitchen} overdueOrders={overdueOrders} mounted={mounted} />
          </div>
          <DepositTracker depositOrders={depositOrders} dispatchedOrders={dispatchedOrders} />
        </div>
      </main>
    </div>
  )
}
