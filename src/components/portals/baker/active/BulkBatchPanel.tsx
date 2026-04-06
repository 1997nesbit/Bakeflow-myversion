'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Layers, Plus, X, Play } from 'lucide-react'
import type { Order } from '@/types/order'
import type { BulkBatch, FulfillmentChoice } from '@/types/production'

interface Props {
  bakingOrders: Order[]
  batches: BulkBatch[]
  fulfillments: Record<string, FulfillmentChoice>
  getBatchForOrder: (orderId: string) => BulkBatch | undefined
  onCreateBatch: (batch: BulkBatch) => void
  onStartBatchTimers: (batch: BulkBatch) => void
  onSendBatchToQA: (batch: BulkBatch) => void
}

export function BulkBatchPanel({
  bakingOrders,
  batches,
  fulfillments,
  getBatchForOrder,
  onCreateBatch,
  onStartBatchTimers,
  onSendBatchToQA,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [batchNotes, setBatchNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggle = (orderId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const handleCreate = () => {
    if (selectedIds.size < 2 || !batchName.trim()) return
    const batch: BulkBatch = {
      id: `GRP-${String(batches.length + 1).padStart(3, '0')}`,
      name: batchName.trim(),
      orderIds: Array.from(selectedIds),
      notes: batchNotes.trim(),
      createdAt: new Date().toISOString(),
    }
    onCreateBatch(batch)
    setSelectedIds(new Set())
    setBatchName('')
    setBatchNotes('')
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
    setSelectedIds(new Set())
    setBatchName('')
    setBatchNotes('')
  }

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" style={{ color: '#e66386' }} />
            <p className="text-sm font-semibold text-foreground">Group Orders</p>
            <span className="text-xs text-muted-foreground">Batch similar orders together</span>
          </div>
          {!showForm && (
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent"
              style={{ borderColor: '#e66386', color: '#e66386' }}
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Group
            </Button>
          )}
        </div>

        {showForm && (
          <div className="mt-4 space-y-3 rounded-xl border p-4" style={{ borderColor: '#fbd5db', background: '#fdf2f4' }}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold" style={{ color: '#CA0123' }}>Create Group</p>
              <button type="button" onClick={handleCancel}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <Input
              placeholder="Group name (e.g. Morning Bread Run)"
              value={batchName}
              onChange={e => setBatchName(e.target.value)}
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">Select orders ({selectedIds.size} selected):</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {bakingOrders.map(o => {
                const inBatch = getBatchForOrder(o.id)
                return (
                  <label
                    key={o.id}
                    className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-colors ${
                      selectedIds.has(o.id)
                        ? 'border-[#e66386] bg-white'
                        : inBatch
                        ? 'border-border bg-muted/50 opacity-50'
                        : 'border-border bg-white hover:border-[#fbd5db]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(o.id)}
                      onChange={() => toggle(o.id)}
                      disabled={!!inBatch}
                      className="accent-[#CA0123] h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {(o.items ?? []).map(i => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(', ') || o.id}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{o.customer.name}</p>
                    </div>
                    {fulfillments[o.id] && (
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-transparent">
                        {fulfillments[o.id].method === 'from_batch' ? 'From Batch' : 'Fresh'}
                      </Badge>
                    )}
                    {inBatch && (
                      <Badge variant="outline" className="text-[10px] shrink-0 bg-transparent">
                        {inBatch.name}
                      </Badge>
                    )}
                  </label>
                )
              })}
            </div>
            <Textarea
              placeholder="Notes (e.g. oven #2, 180C for 25 min)"
              value={batchNotes}
              onChange={e => setBatchNotes(e.target.value)}
              className="min-h-[60px] text-sm"
            />
            <Button
              className="w-full text-white border-0"
              style={{ background: '#CA0123' }}
              onClick={handleCreate}
              disabled={selectedIds.size < 2 || !batchName.trim()}
            >
              <Layers className="mr-2 h-4 w-4" />
              Create Group ({selectedIds.size} orders)
            </Button>
          </div>
        )}

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
                      <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>
                        {batchOrds.length} orders
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white border-0"
                        onClick={() => onStartBatchTimers(batch)}
                      >
                        <Play className="mr-1 h-3 w-3" />Start All
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs text-white border-0"
                        style={{ background: '#CA0123' }}
                        onClick={() => onSendBatchToQA(batch)}
                      >
                        {'Done → QA'}
                      </Button>
                    </div>
                  </div>
                  {batch.notes && <p className="text-xs text-muted-foreground mb-2">{batch.notes}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {batchOrds.map(o => (
                      <span
                        key={o.id}
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#fce7ea', color: '#CA0123' }}
                      >
                        {(o.items ?? []).map(i => i.name).join(', ') || o.id} — {o.customer.name}
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
  )
}
