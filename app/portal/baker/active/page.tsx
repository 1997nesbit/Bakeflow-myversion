'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
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
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Calendar,
} from 'lucide-react'

interface TimerState {
  orderId: string
  startedAt: number
  pausedAt?: number
  elapsed: number
  running: boolean
}

export default function BakerActivePage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) =>
      ['baker', 'quality'].includes(o.status)
    )
  )
  const [timers, setTimers] = useState<Record<string, TimerState>>({})
  const [now, setNow] = useState<number>(Date.now())
  const [toastMsg, setToastMsg] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  // Tick every second for live timers
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Overdue notification popup
  const [overduePopup, setOverduePopup] = useState<Order | null>(null)

  useEffect(() => {
    const check = () => {
      const baking = orders.filter((o) => o.status === 'baker')
      for (const o of baking) {
        const t = timers[o.id]
        if (t && t.running) {
          const elapsed = Math.floor((now - t.startedAt + t.elapsed) / 1000 / 60)
          if (elapsed > o.estimatedMinutes && !overduePopup) {
            setOverduePopup(o)
          }
        }
      }
    }
    check()
  }, [now, orders, timers, overduePopup])

  const getTimerDisplay = useCallback(
    (orderId: string, estimatedMin: number) => {
      const t = timers[orderId]
      if (!t) return { min: 0, sec: 0, pct: 0, running: false, overdue: false }
      const totalMs = t.running ? now - t.startedAt + t.elapsed : t.elapsed
      const totalSec = Math.floor(totalMs / 1000)
      const min = Math.floor(totalSec / 60)
      const sec = totalSec % 60
      const pct = Math.min(100, Math.round((min / estimatedMin) * 100))
      return { min, sec, pct, running: t.running, overdue: min > estimatedMin }
    },
    [now, timers]
  )

  const handleStartTimer = (orderId: string) => {
    setTimers((prev) => ({
      ...prev,
      [orderId]: {
        orderId,
        startedAt: Date.now(),
        elapsed: prev[orderId]?.elapsed || 0,
        running: true,
      },
    }))
  }

  const handlePauseTimer = (orderId: string) => {
    setTimers((prev) => {
      const t = prev[orderId]
      if (!t || !t.running) return prev
      return {
        ...prev,
        [orderId]: {
          ...t,
          elapsed: t.elapsed + (Date.now() - t.startedAt),
          running: false,
        },
      }
    })
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Baking done -> send to decorator
  const handleSendToDecorator = (orderId: string) => {
    handlePauseTimer(orderId)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'decorator' as Order['status'] } : o
      )
    )
    showToast('Order sent to Decorator Portal')
  }

  // Baking done -> send straight to QA (baker is QA)
  const handleSendToQA = (orderId: string) => {
    handlePauseTimer(orderId)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'quality' as Order['status'] } : o
      )
    )
    showToast('Order moved to Quality Assurance')
  }

  // QA approve -> packing
  const handleQAApprove = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'packing' as Order['status'] } : o
      )
    )
    showToast('QA Passed. Sent to Packing.')
  }

  // QA reject -> back to decorator
  const handleQAReject = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'decorator' as Order['status'] } : o
      )
    )
    setRejectingId(null)
    setRejectNote('')
    showToast('Order returned to Decorator with notes')
  }

  const bakingOrders = orders.filter((o) => o.status === 'baker')
  const qaOrders = orders.filter((o) => o.status === 'quality')

  return (
    <div className="min-h-screen bg-amber-50/40">
      <BakerSidebar />
      <main className="ml-64">
        {/* Overdue Popup Modal */}
        {overduePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 border-2 border-red-500 shadow-2xl bg-card">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 animate-bounce">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-700">Order Overdue!</h2>
                <p className="text-sm text-muted-foreground">
                  Order <span className="font-bold text-foreground">{overduePopup.id}</span> for{' '}
                  <span className="font-bold text-foreground">{overduePopup.customerName}</span> has exceeded
                  its estimated time of <span className="font-bold">{overduePopup.estimatedMinutes} minutes</span>.
                </p>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    Front Desk has been notified. Please check this order immediately.
                  </p>
                </div>
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white border-0"
                  onClick={() => setOverduePopup(null)}
                >
                  Acknowledged - Checking Now
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Active Orders</h1>
              <p className="text-sm text-muted-foreground">
                {bakingOrders.length} baking, {qaOrders.length} awaiting QA
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="baking" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="baking" className="gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Flame className="h-4 w-4" />
                Baking
                {bakingOrders.length > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                    {bakingOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <CheckCircle className="h-4 w-4" />
                Quality Check
                {qaOrders.length > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                    {qaOrders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* =================== BAKING TAB =================== */}
            <TabsContent value="baking" className="mt-0 space-y-4">
              {bakingOrders.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                  <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">Kitchen is clear</p>
                  <p className="text-sm text-muted-foreground">Orders posted from Front Desk appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bakingOrders.map((order) => {
                    const td = getTimerDisplay(order.id, order.estimatedMinutes)
                    const hasTimer = !!timers[order.id]
                    return (
                      <Card
                        key={order.id}
                        className={`border-2 shadow-sm transition-colors ${
                          td.overdue
                            ? 'border-red-400 bg-red-50/50'
                            : td.running
                              ? 'border-amber-400 bg-amber-50/30'
                              : 'border-border bg-card'
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-bold text-foreground">{order.id}</CardTitle>
                                <Badge variant="outline" className="text-xs bg-transparent">
                                  {orderTypeLabels[order.orderType]}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5">{order.customerName}</p>
                            </div>
                            {td.overdue ? (
                              <Badge className="bg-red-600 text-white border-0 animate-pulse">OVERDUE</Badge>
                            ) : td.running ? (
                              <Badge className="bg-amber-500 text-white border-0">BAKING</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-transparent">QUEUED</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Timer Display */}
                          <div className={`rounded-xl p-4 text-center ${td.overdue ? 'bg-red-100' : 'bg-muted/50'}`}>
                            <p className={`text-4xl font-mono font-bold tabular-nums ${td.overdue ? 'text-red-700' : 'text-foreground'}`}>
                              {String(td.min).padStart(2, '0')}:{String(td.sec).padStart(2, '0')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Est. {order.estimatedMinutes} min
                            </p>
                            {/* Progress */}
                            <div className="mt-3 h-2.5 rounded-full bg-border overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${
                                  td.overdue ? 'bg-red-500' : td.pct > 75 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${td.pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Timer Controls */}
                          <div className="flex gap-2">
                            {!hasTimer || !td.running ? (
                              <Button
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                                onClick={() => handleStartTimer(order.id)}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                {hasTimer ? 'Resume' : 'Start Timer'}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="flex-1 bg-transparent"
                                onClick={() => handlePauseTimer(order.id)}
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </Button>
                            )}
                          </div>

                          {/* Items */}
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="rounded-lg bg-muted/50 p-3">
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-foreground text-sm">{item.name}</p>
                                  <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                </div>
                                {item.isCustom && item.customCake && (
                                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
                                    <Cake className="h-3.5 w-3.5 mt-0.5 text-pink-600 shrink-0" />
                                    <div className="text-xs">
                                      <p className="text-pink-700 font-medium">
                                        {item.customCake.flavour} / {item.customCake.icingType} / {item.customCake.kilogram}kg
                                      </p>
                                      {item.customCake.description && (
                                        <p className="text-muted-foreground mt-0.5">{item.customCake.description}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {order.specialNotes && (
                            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                              <FileText className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                              <p className="text-xs text-amber-800">{order.specialNotes}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {order.pickupDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {order.pickupTime}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-border">
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                              onClick={() => handleSendToQA(order.id)}
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" />
                              Done - QA Check
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white border-0"
                              onClick={() => handleSendToDecorator(order.id)}
                            >
                              <Cake className="mr-1.5 h-4 w-4" />
                              Send to Decorator
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* =================== QA TAB =================== */}
            <TabsContent value="qa" className="mt-0 space-y-4">
              {qaOrders.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">No items awaiting QA</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {qaOrders.map((order) => (
                    <Card key={order.id} className="border-2 border-blue-300 bg-card shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground">{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 border-0">QA Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="rounded-lg bg-blue-50 p-3">
                              <p className="font-medium text-foreground text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                              {item.isCustom && item.customCake && (
                                <p className="text-xs text-pink-700 mt-1">
                                  {item.customCake.flavour} / {item.customCake.icingType} / {item.customCake.kilogram}kg
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {order.specialNotes && (
                          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                            <FileText className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800">{order.specialNotes}</p>
                          </div>
                        )}

                        {rejectingId === order.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Reason for rejection (sent to decorator)..."
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              className="min-h-[70px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => { setRejectingId(null); setRejectNote('') }}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleQAReject(order.id)}
                              >
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Return to Decorator
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                              onClick={() => setRejectingId(order.id)}
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                              onClick={() => handleQAApprove(order.id)}
                            >
                              <CheckCircle className="mr-1.5 h-4 w-4" />
                              Approve - To Packing
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-background shadow-lg animate-in slide-in-from-bottom-4">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toastMsg}</span>
          </div>
        )}
      </main>
    </div>
  )
}
