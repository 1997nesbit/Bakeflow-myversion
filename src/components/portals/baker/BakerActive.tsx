'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { BakerSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Order } from '@/types/order'
import type { DailyBatchItem, FulfillmentMethod, TimerState, BulkBatch, FulfillmentChoice } from '@/types/production'
import { mockOrders } from '@/data/mock/orders'
import { mockDailyBatches } from '@/data/mock/production'
import { orderTypeLabels } from '@/data/constants/labels'
import { FulfillmentDialog } from './FulfillmentDialog'
import { OverduePopup } from './OverduePopup'
import { BulkBatchPanel } from './BulkBatchPanel'
import { BakingOrderCard } from './BakingOrderCard'
import {
  ChefHat,
  Clock,
  Flame,
  Cake,
  FileText,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  Inbox,
  ThumbsUp,
  Palette,
  Bell,
  Users,
  Package,
} from 'lucide-react'

export function BakerActive() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter(o => ['baker', 'quality'].includes(o.status))
  )
  const [dailyBatches, setDailyBatches] = useState<DailyBatchItem[]>(mockDailyBatches)
  const [timers, setTimers] = useState<Record<string, TimerState>>({})
  const [now, setNow] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [overduePopup, setOverduePopup] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('incoming')

  // Fulfillment choice modal
  const [choosingOrder, setChoosingOrder] = useState<Order | null>(null)
  const [fulfillments, setFulfillments] = useState<Record<string, FulfillmentChoice>>({})

  // Bulk batches (created by BulkBatchPanel, stored here)
  const [batches, setBatches] = useState<BulkBatch[]>([])

  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const baking = orders.filter(o => o.status === 'baker' && o.postedToBakerAt)
    for (const o of baking) {
      const t = timers[o.id]
      if (t && t.running) {
        const elapsed = Math.floor((now - t.startedAt + t.elapsed) / 1000 / 60)
        if (elapsed > o.estimatedMinutes && !overduePopup) {
          setOverduePopup(o)
        }
      }
    }
  }, [now, orders, timers, overduePopup, mounted])

  useEffect(() => {
    const incoming = orders.filter(o => o.status === 'baker' && !o.postedToBakerAt)
    const baking = orders.filter(o => o.status === 'baker' && o.postedToBakerAt)
    const qa = orders.filter(o => o.status === 'quality')
    if (incoming.length > 0 && baking.length === 0 && qa.length === 0) setActiveTab('incoming')
  }, [orders])

  const getTimerDisplay = useCallback(
    (orderId: string, estimatedMin: number) => {
      const t = timers[orderId]
      if (!t || !mounted) return { min: 0, sec: 0, pct: 0, running: false, overdue: false }
      const totalMs = t.running ? now - t.startedAt + t.elapsed : t.elapsed
      const totalSec = Math.floor(totalMs / 1000)
      const min = Math.floor(totalSec / 60)
      const sec = totalSec % 60
      const pct = Math.min(100, Math.round((min / estimatedMin) * 100))
      return { min, sec, pct, running: t.running, overdue: min > estimatedMin }
    },
    [now, timers, mounted]
  )

  const findMatchingBatches = (order: Order): DailyBatchItem[] =>
    dailyBatches.filter(b => {
      if (b.quantityRemaining <= 0) return false
      return order.items.some(item =>
        b.productName.toLowerCase().includes(item.name.toLowerCase().split(' - ')[0].split('(')[0].trim()) ||
        item.name.toLowerCase().includes(b.productName.toLowerCase())
      )
    })

  const handleShowFulfillmentChoice = (order: Order) => {
    if (order.orderType === 'custom') { handleAcceptOrder(order.id, 'bake_fresh'); return }
    if (findMatchingBatches(order).length === 0) { handleAcceptOrder(order.id, 'bake_fresh'); return }
    setChoosingOrder(order)
  }

  const handleAcceptOrder = (orderId: string, method: FulfillmentMethod, batchItem?: DailyBatchItem) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, postedToBakerAt: new Date().toISOString() } : o))
    if (method === 'from_batch' && batchItem) {
      const order = orders.find(o => o.id === orderId)
      const totalQty = order?.items.reduce((s, i) => s + i.quantity, 0) || 1
      setDailyBatches(prev =>
        prev.map(b => b.id === batchItem.id ? { ...b, quantityRemaining: Math.max(0, b.quantityRemaining - totalQty) } : b)
      )
      setFulfillments(prev => ({
        ...prev,
        [orderId]: { orderId, method: 'from_batch', batchItemId: batchItem.id, batchItemName: batchItem.productName },
      }))
      toast(`Taken from batch: ${batchItem.productName}`)
    } else {
      setFulfillments(prev => ({ ...prev, [orderId]: { orderId, method: 'bake_fresh' } }))
      toast('Order accepted -- Bake Fresh!')
    }
    setChoosingOrder(null)
    setActiveTab('baking')
  }

  const handleAcceptAll = () => {
    const incoming = orders.filter(o => o.status === 'baker' && !o.postedToBakerAt)
    if (incoming.length === 0) return
    setOrders(prev =>
      prev.map(o => o.status === 'baker' && !o.postedToBakerAt ? { ...o, postedToBakerAt: new Date().toISOString() } : o)
    )
    for (const o of incoming) setFulfillments(prev => ({ ...prev, [o.id]: { orderId: o.id, method: 'bake_fresh' } }))
    setActiveTab('baking')
    toast(`${incoming.length} orders accepted (Bake Fresh)!`)
  }

  const handleStartTimer = (orderId: string) => {
    setTimers(prev => ({
      ...prev,
      [orderId]: { startedAt: Date.now(), elapsed: prev[orderId]?.elapsed || 0, running: true },
    }))
  }

  const handlePauseTimer = (orderId: string) => {
    setTimers(prev => {
      const t = prev[orderId]
      if (!t || !t.running) return prev
      return { ...prev, [orderId]: { ...t, elapsed: t.elapsed + (Date.now() - t.startedAt), running: false } }
    })
  }

  const handleSendToQA = (orderId: string) => {
    handlePauseTimer(orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'quality' as Order['status'] } : o))
    setActiveTab('qa')
    toast('Moved to QA.')
  }

  const handleQAPass = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'decorator' as Order['status'] } : o))
    toast('QA Passed! Sent to Decorator.')
  }

  const handleQAFail = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'baker' as Order['status'], postedToBakerAt: new Date().toISOString() } : o)
    )
    setRejectingId(null)
    setRejectNote('')
    setActiveTab('baking')
    toast('QA Failed. Returned to baking.')
  }

  const handleStartBatchTimers = (batch: BulkBatch) => {
    for (const oid of batch.orderIds) handleStartTimer(oid)
    toast(`Started timers for "${batch.name}"`)
  }

  const handleSendBatchToQA = (batch: BulkBatch) => {
    for (const oid of batch.orderIds) handleSendToQA(oid)
    setBatches(prev => prev.filter(b => b.id !== batch.id))
  }

  const incomingOrders = orders.filter(o => o.status === 'baker' && !o.postedToBakerAt)
  const bakingOrders = orders.filter(o => o.status === 'baker' && o.postedToBakerAt)
  const qaOrders = orders.filter(o => o.status === 'quality')
  const getBatchForOrder = (orderId: string) => batches.find(b => b.orderIds.includes(orderId))

  return (
    <div className="min-h-screen" style={{ background: '#fdf2f4' }}>
      <BakerSidebar />
      <main className="ml-64">
        <FulfillmentDialog
          order={choosingOrder}
          findMatchingBatches={findMatchingBatches}
          onAccept={handleAcceptOrder}
          onClose={() => setChoosingOrder(null)}
        />

        <OverduePopup order={overduePopup} onClose={() => setOverduePopup(null)} />

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Active Orders</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {incomingOrders.length} incoming &middot; {bakingOrders.length} baking &middot; {qaOrders.length} QA -- visible to all bakers
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="bg-card border border-border h-11">
              <TabsTrigger value="incoming" className="gap-2">
                <Inbox className="h-4 w-4" />
                Incoming
                {incomingOrders.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full text-white text-[10px] font-bold px-1" style={{ background: '#CA0123' }}>
                    {incomingOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="baking" className="gap-2">
                <Flame className="h-4 w-4" />
                Baking
                {bakingOrders.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-xs font-bold px-1">
                    {bakingOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                QA
                {qaOrders.length > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-xs font-bold px-1">
                    {qaOrders.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* INCOMING TAB */}
            <TabsContent value="incoming" className="mt-0 space-y-4">
              {incomingOrders.length > 1 && (
                <div className="flex justify-end">
                  <Button size="sm" className="text-white border-0" style={{ background: '#CA0123' }} onClick={handleAcceptAll}>
                    <ThumbsUp className="mr-1.5 h-3.5 w-3.5" />
                    Accept All Fresh ({incomingOrders.length})
                  </Button>
                </div>
              )}
              {incomingOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">No new orders</p>
                  <p className="text-sm text-muted-foreground mt-1">Orders from Front Desk will appear here for any baker to claim</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {incomingOrders.map(order => {
                    const matchingBatches = findMatchingBatches(order)
                    const isCustom = order.orderType === 'custom'
                    return (
                      <Card key={order.id} className="border-2 shadow-sm overflow-hidden" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
                        <div className="px-4 py-2 flex items-center justify-between" style={{ background: '#e66386' }}>
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-white" />
                            <p className="text-xs font-semibold text-white">New from Front Desk</p>
                          </div>
                          {!isCustom && matchingBatches.length > 0 && (
                            <Badge className="text-[10px] bg-white/20 text-white border-0">
                              <Package className="mr-1 h-3 w-3" />
                              Batch available
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-lg font-bold text-foreground">{order.id}</p>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs bg-transparent">
                                {orderTypeLabels[order.orderType]}
                              </Badge>
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
                                    <Cake className="h-3 w-3 shrink-0" style={{ color: '#e66386' }} />
                                    <p className="text-xs" style={{ color: '#CA0123' }}>
                                      {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {order.cakeDescription && (
                            <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: '#fce7ea', borderColor: '#fbd5db' }}>
                              <Cake className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#CA0123' }} />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#CA0123' }}>Cake Description</p>
                                <p className="text-xs" style={{ color: '#CA0123' }}>{order.cakeDescription}</p>
                              </div>
                            </div>
                          )}

                          {order.noteForCustomer && (
                            <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
                              <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#e66386' }} />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#e66386' }}>Write on cake</p>
                                <p className="text-xs text-foreground">{order.noteForCustomer}</p>
                              </div>
                            </div>
                          )}

                          {order.specialNotes && (
                            <div className="flex items-start gap-2 rounded-lg border p-3" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
                              <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#e66386' }} />
                              <p className="text-xs" style={{ color: '#CA0123' }}>{order.specialNotes}</p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                          </div>

                          <Button
                            className="w-full h-11 text-white border-0"
                            style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
                            onClick={() => handleShowFulfillmentChoice(order)}
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            {isCustom ? 'Accept & Bake Fresh' : 'Accept Order'}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* BAKING TAB */}
            <TabsContent value="baking" className="mt-0 space-y-4">
              {bakingOrders.length >= 2 && (
                <BulkBatchPanel
                  bakingOrders={bakingOrders}
                  batches={batches}
                  fulfillments={fulfillments}
                  getBatchForOrder={getBatchForOrder}
                  onCreateBatch={batch => {
                    setBatches(prev => [...prev, batch])
                    toast(`Group "${batch.name}" created with ${batch.orderIds.length} orders.`)
                  }}
                  onStartBatchTimers={handleStartBatchTimers}
                  onSendBatchToQA={handleSendBatchToQA}
                />
              )}

              {bakingOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">Nothing baking</p>
                  <p className="text-sm text-muted-foreground mt-1">Accept an incoming order to start</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bakingOrders.map(order => (
                    <BakingOrderCard
                      key={order.id}
                      order={order}
                      td={getTimerDisplay(order.id, order.estimatedMinutes)}
                      fulfillment={fulfillments[order.id]}
                      batch={getBatchForOrder(order.id)}
                      hasTimer={!!timers[order.id]}
                      onStartTimer={() => handleStartTimer(order.id)}
                      onPauseTimer={() => handlePauseTimer(order.id)}
                      onSendToQA={() => handleSendToQA(order.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* QA TAB */}
            <TabsContent value="qa" className="mt-0 space-y-4">
              {qaOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">No items awaiting QA</p>
                  <p className="text-sm text-muted-foreground mt-1">Finish baking an order and it will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {qaOrders.map(order => (
                    <Card key={order.id} className="border-2 shadow-sm overflow-hidden" style={{ borderColor: '#e66386' }}>
                      <div className="px-4 py-2 flex items-center gap-2" style={{ background: '#e66386' }}>
                        <CheckCircle className="h-4 w-4 text-white" />
                        <p className="text-xs font-semibold text-white">Quality Assurance</p>
                        {fulfillments[order.id] && (
                          <Badge className="text-[10px] bg-white/20 text-white border-0 ml-auto">
                            {fulfillments[order.id].method === 'from_batch' ? 'From Batch' : 'Fresh Bake'}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-lg font-bold text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="rounded-lg border p-3" style={{ background: '#fdf2f4', borderColor: '#fce7ea' }}>
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-sm text-foreground">{item.name}</p>
                                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                              </div>
                              {item.isCustom && item.customCake && (
                                <p className="text-xs mt-1" style={{ color: '#e66386' }}>
                                  {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                                  {item.customCake.description && ` - ${item.customCake.description}`}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl border p-4" style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}>
                          <p className="text-sm font-medium mb-2" style={{ color: '#CA0123' }}>QA Checklist</p>
                          <div className="space-y-1.5 text-xs" style={{ color: '#e66386' }}>
                            <p>{'- Correct flavour and icing?'}</p>
                            <p>{'- Proper texture, colour, consistency?'}</p>
                            <p>{'- Correct weight/size?'}</p>
                            <p>{'- No defects or damage?'}</p>
                          </div>
                        </div>

                        {rejectingId === order.id ? (
                          <div className="space-y-3">
                            <Textarea
                              placeholder="What needs fixing?"
                              value={rejectNote}
                              onChange={e => setRejectNote(e.target.value)}
                              className="min-h-[60px] text-sm"
                            />
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => { setRejectingId(null); setRejectNote('') }}>Cancel</Button>
                              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleQAFail(order.id)}>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />{'Fail → Re-bake'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 bg-transparent" style={{ borderColor: '#fbd5db', color: '#CA0123' }} onClick={() => setRejectingId(order.id)}>
                              <XCircle className="mr-1.5 h-4 w-4" />Fail QA
                            </Button>
                            <Button className="flex-1 text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }} onClick={() => handleQAPass(order.id)}>
                              <Palette className="mr-1.5 h-4 w-4" />{'Pass → Decorator'}
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
      </main>
    </div>
  )
}
