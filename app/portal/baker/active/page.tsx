'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
import {
  ChefHat,
  Clock,
  Flame,
  AlertTriangle,
  Cake,
  FileText,
  CheckCircle,
  Play,
  Pause,
  XCircle,
  RotateCcw,
  Calendar,
  Inbox,
  ThumbsUp,
  Palette,
  Bell,
} from 'lucide-react'

interface TimerState {
  startedAt: number
  elapsed: number
  running: boolean
}

export default function BakerActivePage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => ['baker', 'quality'].includes(o.status))
  )
  const [timers, setTimers] = useState<Record<string, TimerState>>({})
  const [now, setNow] = useState<number>(Date.now())
  const [toastMsg, setToastMsg] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [overduePopup, setOverduePopup] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('incoming')

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Check overdue
  useEffect(() => {
    const baking = orders.filter((o) => o.status === 'baker' && o.postedToBakerAt)
    for (const o of baking) {
      const t = timers[o.id]
      if (t && t.running) {
        const elapsed = Math.floor((now - t.startedAt + t.elapsed) / 1000 / 60)
        if (elapsed > o.estimatedMinutes && !overduePopup) {
          setOverduePopup(o)
        }
      }
    }
  }, [now, orders, timers, overduePopup])

  // Auto-switch to relevant tab
  useEffect(() => {
    const incoming = orders.filter((o) => o.status === 'baker' && !o.postedToBakerAt)
    const baking = orders.filter((o) => o.status === 'baker' && o.postedToBakerAt)
    const qa = orders.filter((o) => o.status === 'quality')
    if (incoming.length > 0 && baking.length === 0 && qa.length === 0) setActiveTab('incoming')
  }, [orders])

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

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleAcceptOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, postedToBakerAt: new Date().toISOString() } : o
      )
    )
    setActiveTab('baking')
    showToast('Order accepted. Start baking!')
  }

  const handleStartTimer = (orderId: string) => {
    setTimers((prev) => ({
      ...prev,
      [orderId]: {
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
      return { ...prev, [orderId]: { ...t, elapsed: t.elapsed + (Date.now() - t.startedAt), running: false } }
    })
  }

  // Baking done -> QA
  const handleSendToQA = (orderId: string) => {
    handlePauseTimer(orderId)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'quality' as Order['status'] } : o))
    )
    setActiveTab('qa')
    showToast('Baking complete. Moved to QA inspection.')
  }

  // QA pass -> decorator
  const handleQAPass = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'decorator' as Order['status'] } : o))
    )
    showToast('QA Passed! Sent to Decorator.')
  }

  // QA fail -> back to baking
  const handleQAFail = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'baker' as Order['status'], postedToBakerAt: new Date().toISOString() } : o))
    )
    setRejectingId(null)
    setRejectNote('')
    setActiveTab('baking')
    showToast('QA Failed. Order returned to baking.')
  }

  const incomingOrders = orders.filter((o) => o.status === 'baker' && !o.postedToBakerAt)
  const bakingOrders = orders.filter((o) => o.status === 'baker' && o.postedToBakerAt)
  const qaOrders = orders.filter((o) => o.status === 'quality')

  return (
    <div className="min-h-screen bg-amber-50/40">
      <BakerSidebar />
      <main className="ml-64">
        {/* Overdue Popup */}
        {overduePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 border-2 border-red-500 shadow-2xl bg-card">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 animate-bounce">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-700 text-balance">Order Overdue!</h2>
                <p className="text-sm text-muted-foreground">
                  Order <span className="font-bold text-foreground">{overduePopup.id}</span> for{' '}
                  <span className="font-bold text-foreground">{overduePopup.customerName}</span> has exceeded
                  its estimated time of <span className="font-bold">{overduePopup.estimatedMinutes} minutes</span>.
                </p>
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-800">Front Desk has been notified automatically.</p>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-0" onClick={() => setOverduePopup(null)}>
                  Acknowledged
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
                {incomingOrders.length} incoming &middot; {bakingOrders.length} baking &middot; {qaOrders.length} awaiting QA
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="bg-card border border-border h-11">
              <TabsTrigger value="incoming" className="gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                <Inbox className="h-4 w-4" />
                Incoming
                {incomingOrders.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
                    {incomingOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="baking" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                <Flame className="h-4 w-4" />
                Baking
                {bakingOrders.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold px-1">
                    {bakingOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <CheckCircle className="h-4 w-4" />
                Quality Check
                {qaOrders.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold px-1">
                    {qaOrders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ============ INCOMING TAB ============ */}
            <TabsContent value="incoming" className="mt-0 space-y-4">
              {incomingOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">No new orders</p>
                  <p className="text-sm text-muted-foreground mt-1">Orders from Front Desk will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {incomingOrders.map((order) => (
                    <Card key={order.id} className="border-2 border-amber-300 bg-amber-50/50 shadow-sm overflow-hidden">
                      <div className="bg-amber-500 px-4 py-2 flex items-center gap-2">
                        <Bell className="h-4 w-4 text-white" />
                        <p className="text-xs font-semibold text-white">New Order from Front Desk</p>
                      </div>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-bold text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                              <Clock className="h-3 w-3" />
                              Est. {order.estimatedMinutes}m
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="rounded-lg bg-card border border-border p-3">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm text-foreground">{item.name}</p>
                                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                              </div>
                              {item.isCustom && item.customCake && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <Cake className="h-3 w-3 text-pink-600 shrink-0" />
                                  <p className="text-xs text-pink-700">
                                    {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {order.specialNotes && (
                          <div className="flex items-start gap-2 rounded-lg bg-amber-100/50 border border-amber-200 p-3">
                            <FileText className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800">{order.specialNotes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                        </div>

                        <Button
                          className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 text-base"
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          <ThumbsUp className="mr-2 h-5 w-5" />
                          Accept Order
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ============ BAKING TAB ============ */}
            <TabsContent value="baking" className="mt-0 space-y-4">
              {bakingOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">Nothing baking</p>
                  <p className="text-sm text-muted-foreground mt-1">Accept an incoming order to start</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bakingOrders.map((order) => {
                    const td = getTimerDisplay(order.id, order.estimatedMinutes)
                    const hasTimer = !!timers[order.id]
                    return (
                      <Card
                        key={order.id}
                        className={`border-2 shadow-sm transition-all ${
                          td.overdue ? 'border-red-400 bg-red-50/50' : td.running ? 'border-orange-300 bg-orange-50/30' : 'border-border bg-card'
                        }`}
                      >
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-foreground">{order.id}</p>
                                <Badge variant="outline" className="text-[10px] bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            {td.overdue ? (
                              <Badge className="bg-red-600 text-white border-0 animate-pulse text-xs">OVERDUE</Badge>
                            ) : td.running ? (
                              <Badge className="bg-orange-500 text-white border-0 text-xs">BAKING</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-transparent text-xs">READY</Badge>
                            )}
                          </div>

                          {/* Timer */}
                          <div className={`rounded-xl p-5 text-center ${td.overdue ? 'bg-red-100' : 'bg-muted/50'}`}>
                            <p className={`text-5xl font-mono font-bold tabular-nums ${td.overdue ? 'text-red-700' : 'text-foreground'}`}>
                              {String(td.min).padStart(2, '0')}:{String(td.sec).padStart(2, '0')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">Estimated: {order.estimatedMinutes} min</p>
                            <div className="mt-3 h-2 rounded-full bg-border overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${td.overdue ? 'bg-red-500' : td.pct > 75 ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${td.pct}%` }}
                              />
                            </div>
                          </div>

                          {/* Timer button */}
                          {!hasTimer || !td.running ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0" onClick={() => handleStartTimer(order.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              {hasTimer ? 'Resume' : 'Start Timer'}
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full bg-transparent" onClick={() => handlePauseTimer(order.id)}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </Button>
                          )}

                          {/* Items */}
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="rounded-lg bg-muted/50 p-3">
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-sm text-foreground">{item.name}</p>
                                  <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                </div>
                                {item.isCustom && item.customCake && (
                                  <p className="text-xs text-pink-700 mt-1 flex items-center gap-1">
                                    <Cake className="h-3 w-3" />
                                    {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                                  </p>
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

                          {/* Action: Done Baking -> QA */}
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                            onClick={() => handleSendToQA(order.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Done Baking &rarr; QA Check
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* ============ QA TAB ============ */}
            <TabsContent value="qa" className="mt-0 space-y-4">
              {qaOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">No items awaiting QA</p>
                  <p className="text-sm text-muted-foreground mt-1">{'Finish baking an order and it will appear here for quality check'}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {qaOrders.map((order) => (
                    <Card key={order.id} className="border-2 border-blue-300 bg-card shadow-sm overflow-hidden">
                      <div className="bg-blue-600 px-4 py-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-white" />
                        <p className="text-xs font-semibold text-white">Quality Assurance Check</p>
                      </div>
                      <CardContent className="p-5 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-bold text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm text-foreground">{item.name}</p>
                                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                              </div>
                              {item.isCustom && item.customCake && (
                                <p className="text-xs text-pink-700 mt-1">
                                  {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                                  {item.customCake.description && ` - ${item.customCake.description}`}
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

                        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                          <p className="text-sm font-medium text-blue-900 mb-2">QA Checklist</p>
                          <div className="space-y-1.5 text-xs text-blue-800">
                            <p>{'- Correct flavour and icing as per order?'}</p>
                            <p>{'- Proper texture, colour, and consistency?'}</p>
                            <p>{'- Correct weight/size?'}</p>
                            <p>{'- No defects or damage?'}</p>
                          </div>
                        </div>

                        {rejectingId === order.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="What needs to be fixed? (will be visible when order returns to baking)"
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                              className="min-h-[70px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => { setRejectingId(null); setRejectNote('') }}>
                                Cancel
                              </Button>
                              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleQAFail(order.id)}>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                Fail &rarr; Re-bake
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex-1 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
                              onClick={() => setRejectingId(order.id)}
                            >
                              <XCircle className="mr-1.5 h-4 w-4" />
                              Fail QA
                            </Button>
                            <Button
                              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white border-0"
                              onClick={() => handleQAPass(order.id)}
                            >
                              <Palette className="mr-1.5 h-4 w-4" />
                              Pass &rarr; Decorator
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
