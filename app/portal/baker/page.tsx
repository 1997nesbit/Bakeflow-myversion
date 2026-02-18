'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mockOrders, Order, minutesSincePosted } from '@/lib/mock-data'
import {
  ChefHat,
  Clock,
  Flame,
  AlertTriangle,
  ArrowRight,
  Cake,
  FileText,
  CheckCircle,
  Timer,
  Palette,
  Bell,
  Inbox,
} from 'lucide-react'
import Link from 'next/link'

export default function BakerDashboardPage() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(id)
  }, [])

  const incomingOrders = mockOrders.filter((o) => o.status === 'baker' && !o.postedToBakerAt)
  const bakingOrders = mockOrders.filter((o) => o.status === 'baker' && o.postedToBakerAt)
  const qaOrders = mockOrders.filter((o) => o.status === 'quality')
  const decoratorOrders = mockOrders.filter((o) => o.status === 'decorator')
  const completedToday = mockOrders.filter(
    (o) => ['decorator', 'packing', 'ready', 'dispatched', 'delivered'].includes(o.status)
  )

  const overdueOrders = bakingOrders.filter(
    (o) => o.postedToBakerAt && minutesSincePosted(o.postedToBakerAt) > o.estimatedMinutes
  )
  const totalEstMin = bakingOrders.reduce((s, o) => s + o.estimatedMinutes, 0)

  const getElapsed = useCallback(
    (postedAt?: string) => {
      if (!postedAt || !now) return 0
      return Math.floor((now.getTime() - new Date(postedAt).getTime()) / (1000 * 60))
    },
    [now]
  )

  return (
    <div className="min-h-screen bg-amber-50/40">
      <BakerSidebar />
      <main className="ml-64">
        {/* Overdue Banner */}
        {overdueOrders.length > 0 && (
          <div className="bg-red-600 px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
              <p className="text-sm font-semibold text-white">
                {overdueOrders.length} order{overdueOrders.length > 1 ? 's' : ''} overdue!
                Front desk has been alerted.
              </p>
              <Link href="/portal/baker/active" className="ml-auto">
                <Button size="sm" variant="secondary" className="bg-white text-red-700 hover:bg-red-50 border-0">
                  View Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Incoming orders notification */}
        {incomingOrders.length > 0 && (
          <div className="bg-amber-500 px-6 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-white animate-bounce" />
              <p className="text-sm font-semibold text-white">
                {incomingOrders.length} new order{incomingOrders.length > 1 ? 's' : ''} from Front Desk waiting to be accepted!
              </p>
              <Link href="/portal/baker/active" className="ml-auto">
                <Button size="sm" className="bg-white text-amber-700 hover:bg-amber-50 border-0">
                  Accept Orders
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-balance">Kitchen Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {now
                    ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                    : '\u00A0'}
                </p>
              </div>
            </div>
            <Link href="/portal/baker/active">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 hover:from-amber-600 hover:to-orange-700">
                <Flame className="mr-2 h-4 w-4" />
                Go to Kitchen
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Incoming', count: incomingOrders.length, icon: Inbox, color: 'bg-amber-100 text-amber-700', urgent: incomingOrders.length > 0 },
              { label: 'Baking', count: bakingOrders.length, icon: Flame, color: 'bg-orange-100 text-orange-700', urgent: overdueOrders.length > 0 },
              { label: 'QA Check', count: qaOrders.length, icon: CheckCircle, color: 'bg-blue-100 text-blue-700', urgent: false },
              { label: 'At Decorator', count: decoratorOrders.length, icon: Palette, color: 'bg-pink-100 text-pink-700', urgent: false },
              { label: 'Done Today', count: completedToday.length, icon: CheckCircle, color: 'bg-green-100 text-green-700', urgent: false },
            ].map((s) => (
              <Card key={s.label} className="border-0 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.color.split(' ')[0]}`}>
                      <s.icon className={`h-4 w-4 ${s.color.split(' ')[1]}`} />
                    </span>
                    {s.urgent && (
                      <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workload + Baking Queue */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Workload */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Timer className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-foreground">Workload</h3>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-center">
                  <p className="text-xs text-amber-700 mb-1 uppercase tracking-wider font-medium">Estimated Total Time</p>
                  <p className="text-3xl font-bold text-amber-800">
                    {totalEstMin >= 60 ? `${Math.floor(totalEstMin / 60)}h ${totalEstMin % 60}m` : `${totalEstMin}m`}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Custom Cakes</span>
                    <span className="font-semibold text-foreground">
                      {bakingOrders.filter((o) => o.orderType === 'custom').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Menu Items</span>
                    <span className="font-semibold text-foreground">
                      {bakingOrders.filter((o) => o.orderType === 'menu').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className={`font-semibold ${overdueOrders.length > 0 ? 'text-red-600' : 'text-foreground'}`}>
                      {overdueOrders.length}
                    </span>
                  </div>
                </div>

                {/* Flow diagram */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Your Flow</p>
                  <div className="flex items-center justify-between text-center">
                    {[
                      { label: 'Bake', count: bakingOrders.length, c: 'bg-orange-500' },
                      { label: 'QA', count: qaOrders.length, c: 'bg-blue-500' },
                      { label: 'Decor', count: decoratorOrders.length, c: 'bg-pink-500' },
                    ].map((s, i, arr) => (
                      <div key={s.label} className="flex items-center gap-1 flex-1">
                        <div className="flex-1">
                          <div className={`mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full ${s.c} text-white font-bold text-xs`}>
                            {s.count}
                          </div>
                          <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        </div>
                        {i < arr.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0 -mt-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Baking Queue */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <h3 className="text-sm font-semibold text-foreground">Active Baking</h3>
                  </div>
                  <Link href="/portal/baker/active" className="text-xs text-amber-600 font-medium hover:underline">
                    View All
                  </Link>
                </div>

                {bakingOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
                    <ChefHat className="mx-auto h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground text-sm">No orders baking right now</p>
                    {incomingOrders.length > 0 && (
                      <Link href="/portal/baker/active">
                        <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white border-0">
                          Accept {incomingOrders.length} Incoming
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bakingOrders.slice(0, 5).map((order) => {
                      const elapsed = getElapsed(order.postedToBakerAt)
                      const isOverdue = elapsed > order.estimatedMinutes
                      const pct = Math.min(100, Math.round((elapsed / order.estimatedMinutes) * 100))
                      return (
                        <div
                          key={order.id}
                          className={`rounded-xl border p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-border'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${isOverdue ? 'bg-red-500' : 'bg-amber-500'}`}>
                                {order.id.split('-')[1]}
                              </span>
                              <div>
                                <p className="font-semibold text-sm text-foreground">{order.customerName}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {order.items.slice(0, 2).map((item, idx) => (
                                    <span key={idx} className="text-[11px] text-muted-foreground">
                                      {item.name}{idx < Math.min(order.items.length, 2) - 1 ? ',' : ''}{' '}
                                    </span>
                                  ))}
                                  {order.items.length > 2 && (
                                    <span className="text-[11px] text-muted-foreground">+{order.items.length - 2}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-mono font-bold tabular-nums ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
                                {elapsed}m
                              </p>
                              <p className="text-[10px] text-muted-foreground">of {order.estimatedMinutes}m</p>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* QA Queue */}
          {qaOrders.length > 0 && (
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-foreground">Awaiting Your QA</h3>
                    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">{qaOrders.length}</Badge>
                  </div>
                  <Link href="/portal/baker/active" className="text-xs text-blue-600 font-medium hover:underline">
                    Inspect
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {qaOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-foreground">{order.id}</p>
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">QA</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{order.customerName}</p>
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{item.name}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
