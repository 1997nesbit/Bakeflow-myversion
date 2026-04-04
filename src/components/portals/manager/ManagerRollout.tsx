'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { DailyRollout, InventoryItem } from '@/types/inventory'
import { inventoryService } from '@/lib/api/services/inventory'
import { handleApiError } from '@/lib/utils/handle-error'
import { ScrollText, Plus, CheckCircle, ArrowDown, Clock, Package } from 'lucide-react'

export function ManagerRollout() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [rollouts, setRollouts] = useState<DailyRollout[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formItem, setFormItem] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formPurpose, setFormPurpose] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const controller = new AbortController()
    inventoryService.getAll({ signal: controller.signal })
      .then(res => setInventory(res.results))
      .catch(handleApiError)
    inventoryService.getRollouts({ date: today }, { signal: controller.signal })
      .then(res => setRollouts(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [today])

  const selectedItem = inventory.find(i => i.id === formItem)
  const todayTotalItems = rollouts.reduce((s, r) => s + r.quantity, 0)

  const handleRollout = async () => {
    if (!formItem || !formQty || !formPurpose) return
    const qty = Number.parseFloat(formQty)
    if (!selectedItem || qty > selectedItem.quantity) {
      toast.error('Not enough stock for this rollout.')
      return
    }
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setSubmitting(true)
    try {
      await inventoryService.recordRollout({
        inventoryItem: formItem,
        quantity: qty,
        purpose: formPurpose,
        date: today,
        time,
      })
      toast.success(`Rolled out ${qty} ${selectedItem.unit} of ${selectedItem.name}.`)
      setShowForm(false)
      setFormItem(''); setFormQty(''); setFormPurpose('')
      const [rolloutsRes, invRes] = await Promise.all([
        inventoryService.getRollouts({ date: today }),
        inventoryService.getAll(),
      ])
      setRollouts(rolloutsRes.results)
      setInventory(invRes.results)
    } catch (err) {
      setSubmitting(false)
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Rollout</h1>
            <p className="text-sm text-white/40">Stock issued to bakery production today</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-manager-accent hover:bg-manager-accent/85 text-white"
          >
            <Plus className="mr-1.5 h-4 w-4" />New Rollout
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 grid-cols-3 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Rollouts Today</p>
            <p className="text-2xl font-bold text-white">{rollouts.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Total Qty Out</p>
            <p className="text-2xl font-bold text-white">{todayTotalItems}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Unique Items</p>
            <p className="text-2xl font-bold text-white">{new Set(rollouts.map(r => r.inventoryItem)).size}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
          <p className="text-sm font-semibold text-white mb-4">Today&apos;s Rollout Timeline</p>
          {rollouts.length === 0 ? (
            <div className="py-12 text-center">
              <ScrollText className="h-10 w-10 text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No rollouts recorded today</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-4">
                {rollouts.map(r => {
                  const item = inventory.find(i => i.id === r.inventoryItem)
                  return (
                    <div key={r.id} className="flex gap-4 relative">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-manager-accent/20 border border-manager-accent/30 z-10">
                        <ArrowDown className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-white">{r.itemName}</p>
                            <p className="text-sm text-white/40 mt-0.5">{r.purpose}</p>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-0 shrink-0">
                            -{r.quantity} {r.itemUnit}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</span>
                          <span>By: {r.rolledOutByName}</span>
                          {item && (
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />Remaining: {item.quantity} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Record dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="bg-manager-card border-white/10 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-primary" />Record Rollout
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-white/60">Product to roll out</Label>
                <Select value={formItem} onValueChange={setFormItem}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select item" /></SelectTrigger>
                  <SelectContent>
                    {inventory.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unit} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Quantity {selectedItem ? `(${selectedItem.unit})` : ''}</Label>
                <Input
                  type="number" min="0.1" step="0.1" max={selectedItem?.quantity}
                  value={formQty} onChange={e => setFormQty(e.target.value)}
                  placeholder="Amount to give out"
                  className="bg-white/5 border-white/10 text-white"
                />
                {selectedItem && formQty && Number.parseFloat(formQty) > selectedItem.quantity && (
                  <p className="text-xs text-red-400">Exceeds available stock ({selectedItem.quantity} {selectedItem.unit})</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-white/60">Purpose</Label>
                <Input
                  value={formPurpose} onChange={e => setFormPurpose(e.target.value)}
                  placeholder="e.g. Morning bread production"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              {selectedItem && formQty && Number.parseFloat(formQty) <= selectedItem.quantity && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Current Stock</span>
                    <span className="text-white">{selectedItem.quantity} {selectedItem.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-white/40">After Rollout</span>
                    <span className="font-bold text-primary">
                      {(selectedItem.quantity - Number.parseFloat(formQty)).toFixed(1)} {selectedItem.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-white/60 hover:text-white bg-transparent">Cancel</Button>
              <Button
                onClick={handleRollout}
                disabled={submitting || !formItem || !formQty || !formPurpose || (selectedItem ? Number.parseFloat(formQty) > selectedItem.quantity : false)}
                className="bg-manager-accent hover:bg-manager-accent/85 text-white"
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />Confirm Rollout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
