'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  mockOrders,
  mockDailyBatches,
  Order,
  DailyBatchItem,
  FulfillmentMethod,
  orderTypeLabels,
} from '@/lib/mock-data'
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
  Layers,
  Plus,
  X,
  Package,
  Users,
} from 'lucide-react'

interface TimerState {
  startedAt: number
  elapsed: number
  running: boolean
}

interface BulkBatch {
  id: string
  name: string
  orderIds: string[]
  notes: string
  createdAt: string
}

interface FulfillmentChoice {
  orderId: string
  method: FulfillmentMethod
  batchItemId?: string
  batchItemName?: string
}

export default function BakerActivePage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter(o => ['baker', 'quality'].includes(o.status))
  )
  const [dailyBatches, setDailyBatches] = useState<DailyBatchItem[]>(mockDailyBatches)
  const [timers, setTimers] = useState<Record<string, TimerState>>({})
  const [now, setNow] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [overduePopup, setOverduePopup] = useState<Order | null>(null)
  const [activeTab, setActiveTab] = useState('incoming')

  // Fulfillment choice modal
  const [choosingOrder, setChoosingOrder] = useState<Order | null>(null)
  const [fulfillments, setFulfillments] = useState<Record<string, FulfillmentChoice>>({})

  // Bulk baking state
  const [batches, setBatches] = useState<BulkBatch[]>([])
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [batchNotes, setBatchNotes] = useState('')
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set())

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

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  // Find matching daily batch items for an order
  const findMatchingBatches = (order: Order): DailyBatchItem[] => {
    return dailyBatches.filter(b => {
      if (b.quantityRemaining <= 0) return false
      return order.items.some(item =>
        b.productName.toLowerCase().includes(item.name.toLowerCase().split(' - ')[0].split('(')[0].trim()) ||
        item.name.toLowerCase().includes(b.productName.toLowerCase())
      )
    })
  }

  // Accept with fulfillment choice
  const handleShowFulfillmentChoice = (order: Order) => {
    // Custom orders always bake fresh
    if (order.orderType === 'custom') {
      handleAcceptOrder(order.id, 'bake_fresh')
      return
    }
    const matches = findMatchingBatches(order)
    if (matches.length === 0) {
      // No batch match, bake fresh
      handleAcceptOrder(order.id, 'bake_fresh')
      return
    }
    // Show choice modal
    setChoosingOrder(order)
  }

  const handleAcceptOrder = (orderId: string, method: FulfillmentMethod, batchItem?: DailyBatchItem) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, postedToBakerAt: new Date().toISOString() } : o
      )
    )

    if (method === 'from_batch' && batchItem) {
      // Deduct from batch
      const order = orders.find(o => o.id === orderId)
      const totalQty = order?.items.reduce((s, i) => s + i.quantity, 0) || 1
      setDailyBatches(prev =>
        prev.map(b =>
          b.id === batchItem.id
            ? { ...b, quantityRemaining: Math.max(0, b.quantityRemaining - totalQty) }
            : b
        )
      )
      setFulfillments(prev => ({
        ...prev,
        [orderId]: { orderId, method: 'from_batch', batchItemId: batchItem.id, batchItemName: batchItem.productName },
      }))
      showToast(`Taken from batch: ${batchItem.productName}`)
    } else {
      setFulfillments(prev => ({
        ...prev,
        [orderId]: { orderId, method: 'bake_fresh' },
      }))
      showToast('Order accepted -- Bake Fresh!')
    }

    setChoosingOrder(null)
    setActiveTab('baking')
  }

  const handleAcceptAll = () => {
    const incoming = orders.filter(o => o.status === 'baker' && !o.postedToBakerAt)
    if (incoming.length === 0) return
    // Accept all as bake fresh (bulk accept can't do individual fulfillment)
    setOrders(prev =>
      prev.map(o =>
        o.status === 'baker' && !o.postedToBakerAt
          ? { ...o, postedToBakerAt: new Date().toISOString() }
          : o
      )
    )
    for (const o of incoming) {
      setFulfillments(prev => ({ ...prev, [o.id]: { orderId: o.id, method: 'bake_fresh' } }))
    }
    setActiveTab('baking')
    showToast(`${incoming.length} orders accepted (Bake Fresh)!`)
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
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'quality' as Order['status'] } : o)))
    setActiveTab('qa')
    showToast('Moved to QA.')
  }

  const handleQAPass = (orderId: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: 'decorator' as Order['status'] } : o)))
    showToast('QA Passed! Sent to Decorator.')
  }

  const handleQAFail = (orderId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, status: 'baker' as Order['status'], postedToBakerAt: new Date().toISOString() } : o
      )
    )
    setRejectingId(null)
    setRejectNote('')
    setActiveTab('baking')
    showToast('QA Failed. Returned to baking.')
  }

  // Bulk batch
  const handleCreateBatch = () => {
    if (selectedForBatch.size < 2 || !batchName.trim()) return
    const batch: BulkBatch = {
      id: `GRP-${String(batches.length + 1).padStart(3, '0')}`,
      name: batchName.trim(),
      orderIds: Array.from(selectedForBatch),
      notes: batchNotes.trim(),
      createdAt: new Date().toISOString(),
    }
    setBatches(prev => [...prev, batch])
    setSelectedForBatch(new Set())
    setBatchName('')
    setBatchNotes('')
    setShowBatchForm(false)
    showToast(`Group "${batch.name}" created with ${batch.orderIds.length} orders.`)
  }

  const toggleBatchSelect = (orderId: string) => {
    setSelectedForBatch(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const handleStartBatchTimers = (batch: BulkBatch) => {
    for (const oid of batch.orderIds) handleStartTimer(oid)
    showToast(`Started timers for "${batch.name}"`)
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
        {/* Fulfillment Choice Modal */}
        {choosingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-lg mx-4 border-2 shadow-2xl bg-card" style={{ borderColor: '#e66386' }}>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#fce7ea' }}>
                      <Package className="h-5 w-5" style={{ color: '#CA0123' }} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground">How to fulfill {choosingOrder.id}?</h2>
                      <p className="text-xs text-muted-foreground">{choosingOrder.customerName} -- {choosingOrder.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setChoosingOrder(null)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* From Batch option */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#CA0123' }}>
                      Take from today&apos;s batch
                    </p>
                    {findMatchingBatches(choosingOrder).length === 0 ? (
                      <p className="text-xs text-muted-foreground px-3 py-4 rounded-lg border border-dashed text-center">
                        No matching batches available
                      </p>
                    ) : (
                      findMatchingBatches(choosingOrder).map(batch => (
                        <button
                          key={batch.id}
                          type="button"
                          className="w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors hover:border-[#e66386]"
                          style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}
                          onClick={() => handleAcceptOrder(choosingOrder.id, 'from_batch', batch)}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shrink-0" style={{ background: '#e66386' }}>
                            {batch.quantityRemaining}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground">{batch.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {batch.quantityRemaining} {batch.unit} remaining -- baked by {batch.bakedBy} at {new Date(batch.bakedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#22c55e' }}>
                            From Batch
                          </Badge>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Bake Fresh option */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors hover:border-[#CA0123]"
                    style={{ borderColor: '#fbd5db' }}
                    onClick={() => handleAcceptOrder(choosingOrder.id, 'bake_fresh')}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ background: '#fce7ea' }}>
                      <Flame className="h-5 w-5" style={{ color: '#CA0123' }} />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground">Bake Fresh</p>
                      <p className="text-xs text-muted-foreground">
                        Start a new bake for this order (custom flavour, special request, etc.)
                      </p>
                    </div>
                    <Badge className="text-[10px] text-white border-0 shrink-0" style={{ background: '#CA0123' }}>
                      Fresh
                    </Badge>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overdue Popup */}
        {overduePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 border-2 shadow-2xl bg-card" style={{ borderColor: '#CA0123' }}>
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full animate-bounce" style={{ background: '#fce7ea' }}>
                  <AlertTriangle className="h-8 w-8" style={{ color: '#CA0123' }} />
                </div>
                <h2 className="text-xl font-bold text-balance" style={{ color: '#CA0123' }}>Order Overdue!</h2>
                <p className="text-sm text-muted-foreground">
                  Order <span className="font-bold text-foreground">{overduePopup.id}</span> for{' '}
                  <span className="font-bold text-foreground">{overduePopup.customerName}</span>{' '}
                  exceeded its estimated time of <span className="font-bold">{overduePopup.estimatedMinutes} min</span>.
                </p>
                <Button className="w-full text-white border-0" style={{ background: '#CA0123' }} onClick={() => setOverduePopup(null)}>
                  Acknowledged
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

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
              {/* Group batch controls */}
              {bakingOrders.length >= 2 && (
                <Card className="border-0 shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4" style={{ color: '#e66386' }} />
                        <p className="text-sm font-semibold text-foreground">Group Orders</p>
                        <span className="text-xs text-muted-foreground">Batch similar orders together</span>
                      </div>
                      {!showBatchForm && (
                        <Button size="sm" variant="outline" className="bg-transparent" style={{ borderColor: '#e66386', color: '#e66386' }} onClick={() => setShowBatchForm(true)}>
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          New Group
                        </Button>
                      )}
                    </div>

                    {showBatchForm && (
                      <div className="mt-4 space-y-3 rounded-xl border p-4" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold" style={{ color: '#CA0123' }}>Create Group</p>
                          <button type="button" onClick={() => { setShowBatchForm(false); setSelectedForBatch(new Set()); setBatchName(''); setBatchNotes('') }}>
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                        <Input placeholder="Group name (e.g. Morning Bread Run)" value={batchName} onChange={e => setBatchName(e.target.value)} className="h-10" />
                        <p className="text-xs text-muted-foreground">Select orders ({selectedForBatch.size} selected):</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {bakingOrders.map(o => {
                            const inBatch = getBatchForOrder(o.id)
                            return (
                              <label
                                key={o.id}
                                className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                                  selectedForBatch.has(o.id) ? 'border-[#e66386] bg-white' : inBatch ? 'border-border bg-muted/50 opacity-50' : 'border-border bg-white hover:border-[#fbd5db]'
                                }`}
                              >
                                <input type="checkbox" checked={selectedForBatch.has(o.id)} onChange={() => toggleBatchSelect(o.id)} disabled={!!inBatch} className="accent-[#CA0123] h-4 w-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{o.id}</p>
                                  <p className="text-[11px] text-muted-foreground truncate">{o.items.map(i => i.name).join(', ')}</p>
                                </div>
                                {fulfillments[o.id] && (
                                  <Badge variant="outline" className="text-[10px] shrink-0 bg-transparent">
                                    {fulfillments[o.id].method === 'from_batch' ? 'From Batch' : 'Fresh'}
                                  </Badge>
                                )}
                                {inBatch && <Badge variant="outline" className="text-[10px] shrink-0 bg-transparent">{inBatch.name}</Badge>}
                              </label>
                            )
                          })}
                        </div>
                        <Textarea placeholder="Notes (e.g. oven #2, 180C for 25 min)" value={batchNotes} onChange={e => setBatchNotes(e.target.value)} className="min-h-[60px] text-sm" />
                        <Button className="w-full text-white border-0" style={{ background: '#CA0123' }} onClick={handleCreateBatch} disabled={selectedForBatch.size < 2 || !batchName.trim()}>
                          <Layers className="mr-2 h-4 w-4" />
                          Create Group ({selectedForBatch.size} orders)
                        </Button>
                      </div>
                    )}

                    {/* Existing groups */}
                    {batches.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {batches.map(batch => {
                          const batchOrds = bakingOrders.filter(o => batch.orderIds.includes(o.id))
                          if (batchOrds.length === 0) return null
                          return (
                            <div key={batch.id} className="rounded-xl border-2 p-4" style={{ borderColor: '#e66386', background: '#fdf2f4' }}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Layers className="h-4 w-4" style={{ color: '#CA0123' }} />
                                  <p className="text-sm font-bold text-foreground">{batch.name}</p>
                                  <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>{batchOrds.length} orders</Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-0" onClick={() => handleStartBatchTimers(batch)}>
                                    <Play className="mr-1 h-3 w-3" />Start All
                                  </Button>
                                  <Button size="sm" className="h-7 text-xs text-white border-0" style={{ background: '#CA0123' }} onClick={() => handleSendBatchToQA(batch)}>
                                    {'Done \u2192 QA'}
                                  </Button>
                                </div>
                              </div>
                              {batch.notes && <p className="text-xs text-muted-foreground mb-2">{batch.notes}</p>}
                              <div className="flex flex-wrap gap-1.5">
                                {batchOrds.map(o => (
                                  <span key={o.id} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#fce7ea', color: '#CA0123' }}>
                                    {o.id} - {o.items.map(i => i.name).join(', ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {bakingOrders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                  <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-medium text-muted-foreground">Nothing baking</p>
                  <p className="text-sm text-muted-foreground mt-1">Accept an incoming order to start</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {bakingOrders.map(order => {
                    const td = getTimerDisplay(order.id, order.estimatedMinutes)
                    const hasTimer = !!timers[order.id]
                    const batch = getBatchForOrder(order.id)
                    const ff = fulfillments[order.id]
                    return (
                      <Card key={order.id} className="border-2 shadow-sm transition-all" style={{
                        borderColor: td.overdue ? '#CA0123' : td.running ? '#e66386' : undefined,
                        background: td.overdue || td.running ? '#fdf2f4' : undefined,
                      }}>
                        <CardContent className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-lg font-bold text-foreground">{order.id}</p>
                                <Badge variant="outline" className="text-[10px] bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                                {ff && (
                                  <Badge className="text-[10px] text-white border-0" style={{ background: ff.method === 'from_batch' ? '#22c55e' : '#CA0123' }}>
                                    {ff.method === 'from_batch' ? `From: ${ff.batchItemName}` : 'Bake Fresh'}
                                  </Badge>
                                )}
                                {batch && (
                                  <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>
                                    <Layers className="mr-1 h-2.5 w-2.5" />{batch.name}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            </div>
                            {td.overdue ? (
                              <Badge className="text-white border-0 animate-pulse text-xs" style={{ background: '#CA0123' }}>OVERDUE</Badge>
                            ) : td.running ? (
                              <Badge className="text-white border-0 text-xs" style={{ background: '#e66386' }}>BAKING</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-transparent text-xs">READY</Badge>
                            )}
                          </div>

                          {/* Timer */}
                          <div className="rounded-xl p-4 text-center" style={{ background: td.overdue ? '#fce7ea' : '#fdf2f4' }}>
                            <p className="text-4xl font-mono font-bold tabular-nums" style={{ color: td.overdue ? '#CA0123' : undefined }}>
                              {String(td.min).padStart(2, '0')}:{String(td.sec).padStart(2, '0')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">of {order.estimatedMinutes} min</p>
                            <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{
                                width: `${td.pct}%`,
                                background: td.overdue ? '#CA0123' : td.pct > 75 ? '#e66386' : '#22c55e',
                              }} />
                            </div>
                          </div>

                          {!hasTimer || !td.running ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0" onClick={() => handleStartTimer(order.id)}>
                              <Play className="mr-2 h-4 w-4" />{hasTimer ? 'Resume' : 'Start Timer'}
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full bg-transparent" onClick={() => handlePauseTimer(order.id)}>
                              <Pause className="mr-2 h-4 w-4" />Pause
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
                                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#e66386' }}>
                                    <Cake className="h-3 w-3" />
                                    {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                                  </p>
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

                          <Button className="w-full text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }} onClick={() => handleSendToQA(order.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />{'Done Baking \u2192 QA Check'}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
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
                            <Textarea placeholder="What needs fixing?" value={rejectNote} onChange={e => setRejectNote(e.target.value)} className="min-h-[60px] text-sm" />
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => { setRejectingId(null); setRejectNote('') }}>Cancel</Button>
                              <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleQAFail(order.id)}>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />{'Fail \u2192 Re-bake'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 bg-transparent" style={{ borderColor: '#fbd5db', color: '#CA0123' }} onClick={() => setRejectingId(order.id)}>
                              <XCircle className="mr-1.5 h-4 w-4" />Fail QA
                            </Button>
                            <Button className="flex-1 text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }} onClick={() => handleQAPass(order.id)}>
                              <Palette className="mr-1.5 h-4 w-4" />{'Pass \u2192 Decorator'}
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
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-white shadow-lg animate-in slide-in-from-bottom-4" style={{ background: '#CA0123' }}>
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toastMsg}</span>
          </div>
        )}
      </main>
    </div>
  )
}
