'use client'

import { useState, useEffect } from 'react'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import type { Order } from '@/types/order'
import { mockOrders } from '@/data/mock/orders'
import { statusLabels, statusColors } from '@/data/constants/labels'
import { daysUntilDue, minutesSincePosted } from '@/lib/utils/date'
import {
  Star,
  ShoppingCart,
  ChefHat,
  Truck,
  AlertTriangle,
  Bell,
  CreditCard,
  DollarSign,
  ArrowRight,
  CheckCircle,
  PlusCircle,
  Timer,
  PackageCheck,
  Activity as ActivityIcon,
  Wallet,
  CircleDollarSign,
  CalendarClock,
  Phone,
} from 'lucide-react'

export function FrontDeskDashboard() {
  const [orders] = useState<Order[]>(mockOrders)
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Metrics
  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0)
  const pendingPayments = orders.filter(o => o.paymentStatus === 'unpaid')
  const depositOrders = orders.filter(o => o.paymentStatus === 'deposit')
  const outstandingBalance = [...pendingPayments, ...depositOrders].reduce((s, o) => s + (o.totalPrice - o.amountPaid), 0)
  const paidReadyToPost = orders.filter(o => o.status === 'paid')
  const inKitchen = orders.filter(o => ['baker', 'decorator', 'quality', 'packing'].includes(o.status))
  const readyOrders = orders.filter(o => o.status === 'ready')
  const dispatchedOrders = orders.filter(o => o.status === 'dispatched')
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const goldCustomerOrders = orders.filter(o => o.isGoldCustomer)

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

  // Pipeline stages
  const pipeline = [
    { label: 'Awaiting Pay', count: pendingPayments.length, icon: Wallet, bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', textColor: 'text-amber-700' },
    { label: 'Post to Baker', count: paidReadyToPost.length, icon: ChefHat, bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', textColor: 'text-emerald-700' },
    { label: 'In Kitchen', count: inKitchen.length, icon: Timer, bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', textColor: 'text-orange-700' },
    { label: 'Ready', count: readyOrders.length, icon: PackageCheck, bg: 'bg-sky-50', border: 'border-sky-200', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', textColor: 'text-sky-700' },
    { label: 'With Driver', count: dispatchedOrders.length, icon: Truck, bg: 'bg-violet-50', border: 'border-violet-200', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', textColor: 'text-violet-700' },
    { label: 'Completed', count: completedOrders.length, icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600', textColor: 'text-green-700' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64">
        {/* ===== TOP BAR ===== */}
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
          {/* ===== ALERTS ===== */}
          {(overdueOrders.length > 0 || advanceDueSoon.length > 0) && (
            <div className="space-y-2">
              {overdueOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 animate-pulse">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-900">
                        Kitchen Overdue: {order.id}
                      </p>
                      <p className="text-xs text-red-600">
                        {order.customerName} - Est. {order.estimatedMinutes}min, now {mounted ? minutesSincePosted(order.postedToBakerAt!) : 0}min. Check kitchen.
                      </p>
                    </div>
                  </div>
                  <Link href="/front-desk/orders">
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent text-xs">
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))}
              {advanceDueSoon.map(order => {
                const days = daysUntilDue(order.pickupDate)
                let dueLabel: string
                if (days === 0) { dueLabel = 'Today' }
                else if (days === 1) { dueLabel = 'Tomorrow' }
                else { dueLabel = `in ${days} days` }
                return (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                        <CalendarClock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Advance Due {dueLabel}: {order.id}
                        </p>
                        <p className="text-xs text-amber-700">
                          {order.customerName} - {order.items.map(i => i.name).join(', ')}
                          {order.paymentStatus === 'deposit' && ` | Balance due: $${(order.totalPrice - order.amountPaid).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                    <Link href="/front-desk/orders">
                      <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs">
                        <ChefHat className="mr-1 h-3 w-3" /> Go to Orders
                      </Button>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}

          {/* ===== REVENUE ROW ===== */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Orders</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{completedOrders.length} completed today</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenue</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">TZS {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">collected from {orders.filter(o => o.amountPaid > 0).length} orders</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Outstanding</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <CircleDollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">TZS {outstandingBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingPayments.length} unpaid, {depositOrders.length} deposits</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Gold Customers</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{goldCustomerOrders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {goldCustomerOrders.length > 0 ? goldCustomerOrders.slice(0, 2).map(o => o.customerName).join(', ') : 'No gold orders today'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ===== ORDER PIPELINE ===== */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">Order Pipeline</CardTitle>
                <Link href="/front-desk/orders">
                  <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-auto p-0">
                    Open Orders <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid gap-3 grid-cols-3 lg:grid-cols-6">
                {pipeline.map((stage) => (
                  <div key={stage.label} className={`rounded-xl border ${stage.border} ${stage.bg} p-3`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stage.iconBg}`}>
                        <stage.icon className={`h-3.5 w-3.5 ${stage.iconColor}`} />
                      </div>
                      <span className={`text-xl font-bold ${stage.textColor}`}>{stage.count}</span>
                    </div>
                    <p className={`text-[11px] font-medium ${stage.textColor}`}>{stage.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== TWO COLUMNS: ACTIONS + KITCHEN ===== */}
          <div className="grid gap-6 lg:grid-cols-5">

            {/* Actions Needed - 3 cols */}
            <Card className="border-0 shadow-sm lg:col-span-3">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <ActivityIcon className="h-4 w-4 text-primary" />
                    Actions Needed
                    {actionCount > 0 && (
                      <Badge className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0">{actionCount}</Badge>
                    )}
                  </CardTitle>
                  <Link href="/front-desk/orders">
                    <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-auto p-0">
                      Go to Orders <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                  {/* Paid ready to post */}
                  {paidReadyToPost.map(order => (
                    <div key={order.id} className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        <ChefHat className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{order.id}</span>
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">Post to Baker</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          {order.isGoldCustomer && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                          {order.customerName} - {order.items.map(i => i.name).join(', ')}
                        </p>
                      </div>
                      <Link href="/front-desk/orders">
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs h-8 px-3">
                          Post
                        </Button>
                      </Link>
                    </div>
                  ))}

                  {/* Ready for delivery */}
                  {readyOrders.filter(o => o.deliveryType === 'delivery').map(order => (
                    <div key={order.id} className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50/50 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                        <Truck className="h-4 w-4 text-sky-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{order.id}</span>
                          <Badge className="bg-sky-100 text-sky-700 border-0 text-[10px] px-1.5 py-0">Send to Driver</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{order.customerName} - {order.deliveryAddress}</p>
                      </div>
                      <Link href="/front-desk/orders">
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs h-8 px-3">
                          Dispatch
                        </Button>
                      </Link>
                    </div>
                  ))}

                  {/* Ready for pickup */}
                  {readyOrders.filter(o => o.deliveryType === 'pickup').map(order => (
                    <div key={order.id} className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{order.id}</span>
                          <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0">Call / Text</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{order.customerName} - {order.customerPhone}</p>
                      </div>
                      <Link href="/front-desk/orders">
                        <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs h-8 px-3">
                          Handle
                        </Button>
                      </Link>
                    </div>
                  ))}

                  {/* Awaiting payment */}
                  {pendingPayments.map(order => (
                    <div key={order.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <CreditCard className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{order.id}</span>
                          <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">Awaiting Payment</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{order.customerName} - TZS {order.totalPrice.toLocaleString()}</p>
                      </div>
                      <Link href="/front-desk/orders">
                        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent text-xs h-8 px-3">
                          Confirm
                        </Button>
                      </Link>
                    </div>
                  ))}

                  {actionCount === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-border py-10 text-center">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                      <p className="text-xs text-muted-foreground mt-0.5">No actions needed right now.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Kitchen Tracker - 2 cols */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4 text-orange-500" />
                  Kitchen Tracker
                  {overdueOrders.length > 0 && (
                    <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0 border-0">{overdueOrders.length} overdue</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-3">
                  {inKitchen.length > 0 ? inKitchen.map(order => {
                    const elapsed = mounted && order.postedToBakerAt ? minutesSincePosted(order.postedToBakerAt) : 0
                    const isOverdue = elapsed > order.estimatedMinutes
                    const progress = Math.min((elapsed / order.estimatedMinutes) * 100, 100)
                    const kitchenCardClass = isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50 border border-border'
                    const progressBarColor = progress > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                    return (
                      <div key={order.id} className={`rounded-lg p-3 ${kitchenCardClass}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{order.id}</span>
                              <Badge className={`${statusColors[order.status]} border-0 text-[10px] px-1.5 py-0`}>
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{order.customerName}</p>
                          </div>
                          {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : progressBarColor}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-semibold shrink-0 tabular-nums ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {elapsed}m/{order.estimatedMinutes}m
                          </span>
                        </div>
                        {isOverdue && (
                          <p className="mt-1.5 text-[10px] font-semibold text-red-600">
                            Overdue by {elapsed - order.estimatedMinutes}min - check kitchen
                          </p>
                        )}
                      </div>
                    )
                  }) : (
                    <div className="rounded-xl border-2 border-dashed border-border py-10 text-center">
                      <ChefHat className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">Kitchen is clear</p>
                      <p className="text-xs text-muted-foreground mt-0.5">No orders in production</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===== BOTTOM ROW: DEPOSITS + DISPATCHED ===== */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Outstanding Deposits */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  Outstanding Balances
                  {depositOrders.length > 0 && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">{depositOrders.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {depositOrders.length > 0 ? (
                  <div className="space-y-3">
                    {depositOrders.map(order => {
                      const balance = order.totalPrice - order.amountPaid
                      const paidPercent = (order.amountPaid / order.totalPrice) * 100
                      return (
                        <div key={order.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-xs font-bold text-foreground">{order.customerName}</p>
                              <p className="text-[11px] text-muted-foreground">{order.id} - Due: {new Date(order.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                            </div>
                            <span className="text-sm font-bold text-secondary">TZS {balance.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${paidPercent}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{Math.round(paidPercent)}% paid</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
                    <CheckCircle className="mx-auto h-7 w-7 text-green-400 mb-2" />
                    <p className="text-xs text-muted-foreground">No outstanding balances</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Out for Delivery */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-violet-500" />
                  Out for Delivery
                  {dispatchedOrders.length > 0 && (
                    <Badge className="bg-violet-100 text-violet-700 border-0 text-[10px] px-1.5 py-0">{dispatchedOrders.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                {dispatchedOrders.length > 0 ? (
                  <div className="space-y-3">
                    {dispatchedOrders.map(order => (
                      <div key={order.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-xs font-bold text-foreground">{order.id} - {order.customerName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{order.deliveryAddress}</p>
                          </div>
                          {order.driverAccepted ? (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5 py-0 shrink-0">Accepted</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                          )}
                        </div>
                        {order.assignedTo && (
                          <p className="text-[10px] text-muted-foreground mt-1">Driver: {order.assignedTo}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-border py-8 text-center">
                    <Truck className="mx-auto h-7 w-7 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">No active deliveries</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
