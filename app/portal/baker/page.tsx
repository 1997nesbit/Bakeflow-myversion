'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

export default function BakerDashboardPage() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 15000)
    return () => clearInterval(id)
  }, [])

  const bakerOrders = mockOrders.filter((o) => o.status === 'baker')
  const decoratorOrders = mockOrders.filter((o) => o.status === 'decorator')
  const qualityOrders = mockOrders.filter((o) => o.status === 'quality')
  const completedToday = mockOrders.filter(
    (o) => ['packing', 'ready', 'dispatched', 'delivered'].includes(o.status)
  )
  const overdueOrders = bakerOrders.filter(
    (o) => o.postedToBakerAt && minutesSincePosted(o.postedToBakerAt) > o.estimatedMinutes
  )
  const totalEstMin = bakerOrders.reduce((s, o) => s + o.estimatedMinutes, 0)

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
                Front desk has been alerted. Please check.
              </p>
              <Link href="/portal/baker/active" className="ml-auto">
                <Button size="sm" variant="secondary" className="bg-white text-red-700 hover:bg-red-50 border-0">
                  View Orders
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
                <h1 className="text-2xl font-bold text-foreground">Kitchen Dashboard</h1>
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
                Active Orders
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Flame className="h-5 w-5 text-amber-600" />
                  </span>
                  {overdueOrders.length > 0 && (
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">{overdueOrders.length} overdue</Badge>
                  )}
                </div>
                <p className="text-3xl font-bold text-foreground">{bakerOrders.length}</p>
                <p className="text-sm text-muted-foreground mt-1">In Oven / Baking</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                    <Cake className="h-5 w-5 text-pink-600" />
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">{decoratorOrders.length}</p>
                <p className="text-sm text-muted-foreground mt-1">At Decorator</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">{qualityOrders.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Awaiting QA</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground">{completedToday.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Completed Today</p>
              </CardContent>
            </Card>
          </div>

          {/* Workload + Quick Queue */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Workload Info */}
            <Card className="lg:col-span-1 border-0 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-4 w-4 text-amber-600" />
                  Workload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <p className="text-sm text-amber-700 mb-1">Estimated Total Time</p>
                  <p className="text-3xl font-bold text-amber-800">
                    {Math.floor(totalEstMin / 60)}h {totalEstMin % 60}m
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Custom Cakes</span>
                    <span className="font-semibold text-foreground">
                      {bakerOrders.filter((o) => o.orderType === 'custom').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Menu Items</span>
                    <span className="font-semibold text-foreground">
                      {bakerOrders.filter((o) => o.orderType === 'menu').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Urgent (overdue)</span>
                    <span className={`font-semibold ${overdueOrders.length > 0 ? 'text-red-600' : 'text-foreground'}`}>
                      {overdueOrders.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Queue - next orders */}
            <Card className="lg:col-span-2 border-0 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Baking Queue
                  </CardTitle>
                  <Link href="/portal/baker/active" className="text-xs text-amber-600 font-medium hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {bakerOrders.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                    <ChefHat className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground">Kitchen is clear. No pending orders.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bakerOrders.slice(0, 4).map((order) => {
                      const elapsed = getElapsed(order.postedToBakerAt)
                      const isOverdue = elapsed > order.estimatedMinutes
                      const pct = Math.min(100, Math.round((elapsed / order.estimatedMinutes) * 100))
                      return (
                        <div
                          key={order.id}
                          className={`rounded-xl border p-4 ${isOverdue ? 'border-red-300 bg-red-50' : 'border-border bg-muted/30'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground">{order.id}</p>
                                {isOverdue && (
                                  <Badge className="bg-red-600 text-white border-0 text-xs animate-pulse">OVERDUE</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
                                {elapsed}m / {order.estimatedMinutes}m
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {order.items.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-transparent">
                                {item.name}
                              </Badge>
                            ))}
                          </div>
                          {order.specialNotes && (
                            <div className="flex items-start gap-1.5 mb-2">
                              <FileText className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                              <p className="text-xs text-amber-800">{order.specialNotes}</p>
                            </div>
                          )}
                          {/* Progress bar */}
                          <div className="h-2 rounded-full bg-border overflow-hidden">
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
          {qualityOrders.length > 0 && (
            <Card className="border-0 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Quality Assurance Queue
                  <Badge className="bg-blue-100 text-blue-700 border-0 ml-2">{qualityOrders.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {qualityOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">QA Pending</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-xs text-muted-foreground">{item.name}</span>
                        ))}
                      </div>
                      <Link href="/portal/baker/active">
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                          Inspect
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pipeline */}
          <Card className="border-0 shadow-sm bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">Order Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Baking', count: bakerOrders.length, color: 'bg-amber-500' },
                  { label: 'Decorating', count: decoratorOrders.length, color: 'bg-pink-500' },
                  { label: 'QA', count: qualityOrders.length, color: 'bg-blue-500' },
                  { label: 'Done Today', count: completedToday.length, color: 'bg-green-500' },
                ].map((stage, idx, arr) => (
                  <div key={stage.label} className="flex items-center gap-2 flex-1">
                    <div className="flex-1 text-center">
                      <div className={`mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full ${stage.color} text-white font-bold text-sm`}>
                        {stage.count}
                      </div>
                      <p className="text-xs text-muted-foreground">{stage.label}</p>
                    </div>
                    {idx < arr.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
