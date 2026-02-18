'use client'

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import {
  mockOrders,
  mockInventory,
  Order,
  statusLabels,
  statusColors,
  daysUntilDue,
  minutesSincePosted,
} from '@/lib/mock-data'
import {
  ShoppingCart,
  Clock,
  ChefHat,
  Truck,
  Package,
  AlertTriangle,
  Bell,
  CreditCard,
  DollarSign,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  PlusCircle,
  Users,
  Timer,
  PackageCheck,
} from 'lucide-react'

export default function FrontDeskDashboard() {
  const [orders] = useState<Order[]>(mockOrders)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Metrics
  const todayOrders = orders.filter(o => {
    const d = new Date(o.createdAt)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })
  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0)
  const pendingPayments = orders.filter(o => o.paymentStatus === 'unpaid')
  const depositOrders = orders.filter(o => o.paymentStatus === 'deposit')
  const outstandingBalance = depositOrders.reduce((s, o) => s + (o.totalPrice - o.amountPaid), 0)
  const paidReadyToPost = orders.filter(o => o.status === 'paid')
  const inKitchen = orders.filter(o => ['baker', 'decorator', 'quality', 'packing'].includes(o.status))
  const readyOrders = orders.filter(o => o.status === 'ready')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const lowStockItems = mockInventory.filter(i => i.quantity < i.minStock)

  // Overdue kitchen orders
  const overdueOrders = orders.filter(o => {
    if (!['baker', 'decorator'].includes(o.status) || !o.postedToBakerAt) return false
    return minutesSincePosted(o.postedToBakerAt) > o.estimatedMinutes
  })

  // Advance orders due soon
  const advanceDueSoon = orders.filter(o => {
    if (!o.isAdvanceOrder || !['paid', 'pending'].includes(o.status)) return false
    const days = daysUntilDue(o.pickupDate)
    return days <= 2 && days >= 0
  })

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Front Desk Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' - '}
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Link href="/front-desk/orders">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Order
            </Button>
          </Link>
        </div>

        {/* ===== URGENT ALERTS ===== */}
        {(overdueOrders.length > 0 || advanceDueSoon.length > 0) && (
          <div className="mb-6 space-y-2">
            {overdueOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between gap-4 rounded-xl border-2 border-red-300 bg-red-50 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900">Kitchen Overdue: {order.id} - {order.customerName}</p>
                    <p className="text-sm text-red-700">
                      Est. {order.estimatedMinutes}min | {minutesSincePosted(order.postedToBakerAt!)}min elapsed. Check on the kitchen!
                    </p>
                  </div>
                </div>
                <Link href="/front-desk/orders">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent shrink-0">
                    View Orders <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
            {advanceDueSoon.map(order => {
              const days = daysUntilDue(order.pickupDate)
              return (
                <div key={order.id} className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
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
                  <Link href="/front-desk/orders">
                    <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0">
                      <ChefHat className="mr-1 h-4 w-4" /> Go to Orders
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* ===== METRIC CARDS ===== */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{"Today's Orders"}</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue Collected</p>
                <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-2xl font-bold text-foreground">${outstandingBalance.toFixed(0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <Package className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-foreground">{lowStockItems.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== WORKFLOW STATUS PIPELINE ===== */}
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Order Pipeline</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {([
              { label: 'Awaiting Payment', count: pendingPayments.length, icon: CreditCard, color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
              { label: 'Ready to Post', count: paidReadyToPost.length, icon: ChefHat, color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
              { label: 'In Kitchen', count: inKitchen.length, icon: Timer, color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
              { label: 'Ready', count: readyOrders.length, icon: PackageCheck, color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
              { label: 'With Driver', count: dispatchedOrders.length, icon: Truck, color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
              { label: 'Completed', count: completedOrders.length, icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
            ] as const).map((stage) => (
              <div key={stage.label} className={`rounded-xl border p-4 ${stage.bgColor}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stage.color}`}>
                    <stage.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className={`text-2xl font-bold ${stage.textColor}`}>{stage.count}</span>
                </div>
                <p className={`text-xs font-medium ${stage.textColor}`}>{stage.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== TWO COLUMN: ACTIONS NEEDED + RECENT ACTIVITY ===== */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Actions Needed */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Actions Needed</h2>
              <Link href="/front-desk/orders">
                <Button variant="outline" size="sm" className="bg-transparent">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {paidReadyToPost.length > 0 && paidReadyToPost.slice(0, 3).map(order => (
                <Card key={order.id} className="border-l-4 border-l-emerald-500 border-t-0 border-r-0 border-b-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{order.id}</p>
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">Post to Baker</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.customerName} - {order.items.map(i => i.name).join(', ')}</p>
                    </div>
                    <Link href="/front-desk/orders">
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <ChefHat className="mr-1 h-4 w-4" /> Post
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {readyOrders.filter(o => o.deliveryType === 'delivery').slice(0, 3).map(order => (
                <Card key={order.id} className="border-l-4 border-l-blue-500 border-t-0 border-r-0 border-b-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{order.id}</p>
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">Dispatch to Driver</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.customerName} - {order.deliveryAddress}</p>
                    </div>
                    <Link href="/front-desk/orders">
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <Truck className="mr-1 h-4 w-4" /> Dispatch
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {readyOrders.filter(o => o.deliveryType === 'pickup').slice(0, 3).map(order => (
                <Card key={order.id} className="border-l-4 border-l-green-500 border-t-0 border-r-0 border-b-0 shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{order.id}</p>
                        <Badge className="bg-green-100 text-green-800 border-0 text-xs">Customer Pickup</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.customerName} - Call or Text</p>
                    </div>
                    <Link href="/front-desk/orders">
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                        <Users className="mr-1 h-4 w-4" /> Handle
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {paidReadyToPost.length === 0 && readyOrders.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">All caught up! No actions needed right now.</p>
                </div>
              )}
            </div>
          </div>

          {/* In Kitchen Tracker */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Kitchen Tracker</h2>
            <div className="space-y-3">
              {inKitchen.length > 0 ? inKitchen.map(order => {
                const elapsed = order.postedToBakerAt ? minutesSincePosted(order.postedToBakerAt) : 0
                const isOverdue = elapsed > order.estimatedMinutes
                const progress = Math.min((elapsed / order.estimatedMinutes) * 100, 100)
                return (
                  <Card key={order.id} className={`border-0 shadow-sm ${isOverdue ? 'ring-2 ring-red-300' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{order.id} - {order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.items.map(i => i.name).join(', ')}</p>
                        </div>
                        <Badge className={`${statusColors[order.status]} border-0 text-xs`}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : progress > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {elapsed}m / {order.estimatedMinutes}m
                        </span>
                      </div>
                      {isOverdue && (
                        <p className="mt-2 text-xs font-medium text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Overdue by {elapsed - order.estimatedMinutes} minutes
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              }) : (
                <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
                  <ChefHat className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No orders in the kitchen</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== DEPOSIT / BALANCE TRACKING ===== */}
        {depositOrders.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Outstanding Deposits</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {depositOrders.map(order => (
                <Card key={order.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.id} - Due: {order.pickupDate}</p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                        <CreditCard className="mr-1 h-3 w-3" /> Deposit
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Paid: ${order.amountPaid.toFixed(2)}</span>
                      <span className="font-bold text-secondary">Balance: ${(order.totalPrice - order.amountPaid).toFixed(2)}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(order.amountPaid / order.totalPrice) * 100}%` }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
