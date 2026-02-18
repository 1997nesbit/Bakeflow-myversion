'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { mockOrders, Order, minutesSincePosted, orderTypeLabels } from '@/lib/mock-data'
import {
  ChefHat,
  Clock,
  Flame,
  AlertTriangle,
  ArrowRight,
  Cake,
  CheckCircle,
  Timer,
  Palette,
  Bell,
  Inbox,
  FileText,
  ThumbsUp,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'

export default function BakerDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  const incomingOrders = mockOrders.filter((o) => o.status === 'baker' && !o.postedToBakerAt)
  const bakingOrders = mockOrders.filter((o) => o.status === 'baker' && o.postedToBakerAt)
  const qaOrders = mockOrders.filter((o) => o.status === 'quality')
  const sentToDecorator = mockOrders.filter((o) =>
    ['decorator', 'packing', 'ready', 'dispatched', 'delivered'].includes(o.status)
  )

  const overdueOrders = mounted
    ? bakingOrders.filter(
        (o) => o.postedToBakerAt && minutesSincePosted(o.postedToBakerAt) > o.estimatedMinutes
      )
    : []

  const getElapsed = useCallback(
    (postedAt?: string) => {
      if (!postedAt || !mounted) return 0
      return Math.floor((Date.now() - new Date(postedAt).getTime()) / (1000 * 60))
    },
    [mounted]
  )

  const totalActiveOrders = incomingOrders.length + bakingOrders.length + qaOrders.length

  return (
    <div className="min-h-screen" style={{ background: '#fdf2f4' }}>
      <BakerSidebar />
      <main className="ml-64">
        {/* Overdue Banner */}
        {overdueOrders.length > 0 && (
          <div style={{ background: '#CA0123' }} className="px-6 py-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
              <p className="text-sm font-semibold text-white">
                {overdueOrders.length} order{overdueOrders.length > 1 ? 's' : ''} overdue! Front desk has been alerted.
              </p>
              <Link href="/portal/baker/active" className="ml-auto">
                <Button size="sm" variant="secondary" className="bg-white text-[#CA0123] hover:bg-red-50 border-0">
                  View Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Incoming notification */}
        {incomingOrders.length > 0 && (
          <div style={{ background: '#e66386' }} className="px-6 py-3">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-white animate-bounce" />
              <p className="text-sm font-semibold text-white">
                {incomingOrders.length} new order{incomingOrders.length > 1 ? 's' : ''} from Front Desk waiting to be accepted!
              </p>
              <Link href="/portal/baker/active" className="ml-auto">
                <Button size="sm" className="bg-white text-[#e66386] hover:bg-pink-50 border-0">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-balance">Kitchen Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {totalActiveOrders} active order{totalActiveOrders !== 1 ? 's' : ''} in your pipeline
                </p>
              </div>
            </div>
            <Link href="/portal/baker/active">
              <Button className="text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
                <Flame className="mr-2 h-4 w-4" />
                Go to Kitchen
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Incoming', count: incomingOrders.length, icon: Inbox, bg: '#fce7ea', color: '#CA0123', pulse: incomingOrders.length > 0 },
              { label: 'Baking', count: bakingOrders.length, icon: Flame, bg: '#fbd5db', color: '#CA0123', pulse: overdueOrders.length > 0 },
              { label: 'QA Check', count: qaOrders.length, icon: CheckCircle, bg: '#fce7ea', color: '#e66386', pulse: false },
              { label: 'Sent to Decorator', count: sentToDecorator.length, icon: Palette, bg: '#f0fdf4', color: '#16a34a', pulse: false },
            ].map((s) => (
              <Card key={s.label} className="border-0 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: s.bg }}>
                      <s.icon className="h-5 w-5" style={{ color: s.color }} />
                    </span>
                    {s.pulse && <span className="flex h-3 w-3 rounded-full animate-pulse" style={{ background: '#CA0123' }} />}
                  </div>
                  <p className="text-3xl font-bold text-foreground">{s.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Flow Diagram */}
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Your Workflow</p>
              <div className="flex items-center justify-between">
                {[
                  { label: 'Incoming', count: incomingOrders.length, bg: '#e66386' },
                  { label: 'Baking', count: bakingOrders.length, bg: '#CA0123' },
                  { label: 'QA', count: qaOrders.length, bg: '#e66386' },
                  { label: 'Decorator', count: sentToDecorator.length, bg: '#16a34a' },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center gap-2 flex-1">
                    <div className="flex-1 text-center">
                      <div
                        className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-sm shadow-md"
                        style={{ background: step.bg }}
                      >
                        {step.count}
                      </div>
                      <p className="text-xs font-medium text-foreground">{step.label}</p>
                    </div>
                    {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 -mt-5" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Incoming Orders */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Inbox className="h-4 w-4" style={{ color: '#e66386' }} />
                    <h3 className="text-sm font-semibold text-foreground">Incoming Orders</h3>
                    {incomingOrders.length > 0 && (
                      <Badge className="text-[10px] text-white border-0" style={{ background: '#CA0123' }}>
                        {incomingOrders.length}
                      </Badge>
                    )}
                  </div>
                  <Link href="/portal/baker/active" className="text-xs font-medium hover:underline" style={{ color: '#e66386' }}>
                    View All
                  </Link>
                </div>

                {incomingOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                    <Bell className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No new orders from Front Desk</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="rounded-xl border-2 p-4" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#fce7ea', color: '#CA0123' }}>
                              {item.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Est. {order.estimatedMinutes}m
                          </span>
                          <Link href="/portal/baker/active">
                            <Button size="sm" className="h-7 text-xs text-white border-0" style={{ background: '#e66386' }}>
                              <ThumbsUp className="mr-1 h-3 w-3" />
                              Accept
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Baking */}
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" style={{ color: '#CA0123' }} />
                    <h3 className="text-sm font-semibold text-foreground">Active Baking</h3>
                  </div>
                  <Link href="/portal/baker/active" className="text-xs font-medium hover:underline" style={{ color: '#CA0123' }}>
                    View All
                  </Link>
                </div>

                {bakingOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                    <ChefHat className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No orders baking right now</p>
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
                              <span
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                                style={{ background: isOverdue ? '#CA0123' : '#e66386' }}
                              >
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
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-mono font-bold tabular-nums ${isOverdue ? 'text-[#CA0123]' : 'text-foreground'}`}>
                                {elapsed}m
                              </p>
                              <p className="text-[10px] text-muted-foreground">of {order.estimatedMinutes}m</p>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-border overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                background: isOverdue ? '#CA0123' : pct > 75 ? '#e66386' : '#22c55e',
                              }}
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
                    <CheckCircle className="h-4 w-4" style={{ color: '#e66386' }} />
                    <h3 className="text-sm font-semibold text-foreground">Awaiting Your QA</h3>
                    <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>{qaOrders.length}</Badge>
                  </div>
                  <Link href="/portal/baker/active" className="text-xs font-medium hover:underline" style={{ color: '#e66386' }}>
                    Inspect
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {qaOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border-2 p-4" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-foreground">{order.id}</p>
                        <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>QA</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{order.customerName}</p>
                      <div className="flex flex-wrap gap-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#fce7ea', color: '#CA0123' }}>
                            {item.name}
                          </span>
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
