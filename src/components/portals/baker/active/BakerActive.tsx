'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { BakerSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Order } from '@/types/order'
import type { DailyBatchItem, FulfillmentMethod, TimerState, BulkBatch, FulfillmentChoice } from '@/types/production'
import { ordersService, productionService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { FulfillmentDialog } from './FulfillmentDialog'
import { OverduePopup } from './OverduePopup'
import { BulkBatchPanel } from './BulkBatchPanel'
import { BakingOrderCard } from './BakingOrderCard'
import { IncomingOrderCard } from './IncomingOrderCard'
import { QAOrderCard } from './QAOrderCard'
import {
  ChefHat,
  Flame,
  CheckCircle,
  Inbox,
  ThumbsUp,
  Bell,
  Users,
} from 'lucide-react'

export function BakerActive() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dailyBatches, setDailyBatches] = useState<DailyBatchItem[]>([])
  const [timers, setTimers] = useState<Record<string, TimerState>>({})
  const [now, setNow] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [overduePopup, setOverduePopup] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('incoming')
  const [choosingOrder, setChoosingOrder] = useState<Order | null>(null)
  const [fulfillments, setFulfillments] = useState<Record<string, FulfillmentChoice>>({})
  const [batches, setBatches] = useState<BulkBatch[]>([])

  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setOrders(res.results))
      .catch(handleApiError)
    productionService.getBatches({ signal: controller.signal })
      .then(res => setDailyBatches(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!mounted) return
    const baking = orders.filter(o => o.status === 'baker' && o.assignedTo)
    for (const o of baking) {
      const t = timers[o.id]
      if (t && t.running) {
        const elapsed = Math.floor((now - t.startedAt + t.elapsed) / 1000 / 60)
        if (elapsed > o.estimatedMinutes && !overduePopup) setOverduePopup(o)
      }
    }
  }, [now, orders, timers, overduePopup, mounted])

  useEffect(() => {
    const incoming = orders.filter(o => o.status === 'baker' && !o.assignedTo)
    const baking = orders.filter(o => o.status === 'baker' && o.assignedTo)
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

  const handleAcceptOrder = async (orderId: string, method: FulfillmentMethod, batchItem?: DailyBatchItem) => {
    const prev = orders
    setOrders(p => p.map(o => o.id === orderId ? { ...o, assignedTo: 'me' } : o))
    if (method === 'from_batch' && batchItem) {
      const order = orders.find(o => o.id === orderId)
      const totalQty = order?.items.reduce((s, i) => s + i.quantity, 0) || 1
      setDailyBatches(p =>
        p.map(b => b.id === batchItem.id ? { ...b, quantityRemaining: Math.max(0, b.quantityRemaining - totalQty) } : b)
      )
      setFulfillments(p => ({
        ...p,
        [orderId]: { orderId, method: 'from_batch', batchItemId: batchItem.id, batchItemName: batchItem.productName },
      }))
      toast(`Taken from batch: ${batchItem.productName}`)
    } else {
      setFulfillments(p => ({ ...p, [orderId]: { orderId, method: 'bake_fresh' } }))
      toast('Order accepted -- Bake Fresh!')
    }
    setChoosingOrder(null)
    setActiveTab('baking')
    try {
      await ordersService.accept(orderId)
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
  }

  const handleAcceptAll = () => {
    const incoming = orders.filter(o => o.status === 'baker' && !o.assignedTo)
    if (incoming.length === 0) return
    setOrders(prev =>
      prev.map(o => o.status === 'baker' && !o.assignedTo ? { ...o, assignedTo: 'me' } : o)
    )
    for (const o of incoming) {
      setFulfillments(prev => ({ ...prev, [o.id]: { orderId: o.id, method: 'bake_fresh' } }))
      ordersService.accept(o.id).catch(handleApiError)
    }
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

  const handleSendToQA = async (orderId: string) => {
    handlePauseTimer(orderId)
    const prev = orders
    setOrders(p => p.map(o => o.id === orderId ? { ...o, status: 'quality' as Order['status'] } : o))
    setActiveTab('qa')
    toast('Moved to QA.')
    try {
      await ordersService.qualityCheck(orderId)
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
  }

  const handleQAPass = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    const toStatus: Order['status'] = order?.orderType === 'custom' ? 'decorator' : 'packing'
    const prev = orders
    setOrders(p => p.map(o => o.id === orderId ? { ...o, status: toStatus } : o))
    toast(`QA Passed! Sent to ${toStatus === 'packing' ? 'Packing' : 'Decorator'}.`)
    try {
      if (toStatus === 'packing') {
        await ordersService.markPacking(orderId)
      } else {
        await ordersService.advanceStatus(orderId, 'decorator')
      }
    } catch (err) {
      setOrders(prev)
      handleApiError(err)
    }
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

  const incomingOrders = orders.filter(o => o.status === 'baker' && !o.assignedTo)
  const bakingOrders = orders.filter(o => o.status === 'baker' && !!o.assignedTo)
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
                  {incomingOrders.map(order => (
                    <IncomingOrderCard
                      key={order.id}
                      order={order}
                      matchingBatches={findMatchingBatches(order)}
                      onAccept={() => handleShowFulfillmentChoice(order)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

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
                    <QAOrderCard
                      key={order.id}
                      order={order}
                      fulfillment={fulfillments[order.id]}
                      rejectingId={rejectingId}
                      rejectNote={rejectNote}
                      onRejectStart={() => setRejectingId(order.id)}
                      onRejectCancel={() => { setRejectingId(null); setRejectNote('') }}
                      onRejectNoteChange={setRejectNote}
                      onQAPass={() => handleQAPass(order.id)}
                      onQAFail={() => handleQAFail(order.id)}
                    />
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
