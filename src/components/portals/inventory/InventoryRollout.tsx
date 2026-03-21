'use client'

import { useState } from 'react'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { DailyRollout, InventoryItem } from '@/types/inventory'
import { mockInventory, mockDailyRollouts } from '@/data/mock/inventory'
import {
  ScrollText,
  Plus,
  CheckCircle,
  ArrowDown,
  Clock,
  Package,
} from 'lucide-react'

export function InventoryRollout() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [rollouts, setRollouts] = useState<DailyRollout[]>(mockDailyRollouts)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState('')

  const [formItem, setFormItem] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formPurpose, setFormPurpose] = useState('')
  const [formBy, setFormBy] = useState('')

  const selectedItem = inventory.find(i => i.id === formItem)
  const todayRollouts = rollouts.filter(r => r.date === '2026-02-06')
  const todayTotalItems = todayRollouts.reduce((s, r) => s + r.quantity, 0)

  const handleRollout = () => {
    if (!formItem || !formQty || !formPurpose || !formBy) return

    const item = inventory.find(i => i.id === formItem)
    if (!item) return

    const qty = Number.parseFloat(formQty)
    if (qty > item.quantity) {
      setToast('Not enough stock for this rollout!')
      setTimeout(() => setToast(''), 3000)
      return
    }

    const now = new Date()
    const newRollout: DailyRollout = {
      id: `RO-${String(rollouts.length + 1).padStart(3, '0')}`,
      inventoryItemId: item.id,
      itemName: item.name,
      quantity: qty,
      unit: item.unit,
      purpose: formPurpose,
      rolledOutBy: formBy,
      date: '2026-02-06',
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    }

    setRollouts([newRollout, ...rollouts])
    setInventory(inventory.map(i =>
      i.id === item.id ? { ...i, quantity: i.quantity - qty } : i
    ))

    setShowForm(false)
    setFormItem('')
    setFormQty('')
    setFormPurpose('')
    setFormBy('')
    setToast(`Rolled out ${qty} ${item.unit} of ${item.name}`)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Daily Rollout</h1>
              <p className="text-xs text-muted-foreground">Track stock given to bakery production</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Rollout
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid gap-4 grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Rollouts Today</p>
                <p className="text-2xl font-bold text-foreground mt-1">{todayRollouts.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Qty Out</p>
                <p className="text-2xl font-bold text-secondary mt-1">{todayTotalItems}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Unique Items</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {new Set(todayRollouts.map(r => r.inventoryItemId)).size}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Today&apos;s Rollout Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {todayRollouts.length === 0 ? (
                <div className="py-12 text-center">
                  <ScrollText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No rollouts recorded today</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {todayRollouts.map((r) => {
                      const item = inventory.find(i => i.id === r.inventoryItemId)
                      return (
                        <div key={r.id} className="flex gap-4 relative">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 border-2 border-secondary z-10">
                            <ArrowDown className="h-4 w-4 text-secondary" />
                          </div>
                          <div className="flex-1 rounded-lg border border-border bg-card p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground">{r.itemName}</p>
                                <p className="text-sm text-muted-foreground mt-0.5">{r.purpose}</p>
                              </div>
                              <Badge className="bg-secondary/10 text-secondary border-0 shrink-0">
                                -{r.quantity} {r.unit}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {r.time}
                              </span>
                              <span className="flex items-center gap-1">
                                By: {r.rolledOutBy}
                              </span>
                              {item && (
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  Remaining: {item.quantity} {item.unit}
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
            </CardContent>
          </Card>
        </div>

        {/* Rollout form */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-secondary" />
                Record Rollout
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Product to roll out</Label>
                <Select value={formItem} onValueChange={setFormItem}>
                  <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
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
                <Label>Quantity {selectedItem ? `(${selectedItem.unit})` : ''}</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  max={selectedItem?.quantity}
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  placeholder="Amount to give out"
                />
                {selectedItem && formQty && Number.parseFloat(formQty) > selectedItem.quantity && (
                  <p className="text-xs text-red-600">Exceeds available stock ({selectedItem.quantity} {selectedItem.unit})</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Purpose</Label>
                <Input
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Morning bread production, cake batch"
                />
              </div>

              <div className="space-y-2">
                <Label>Given to / Rolled out by</Label>
                <Input
                  value={formBy}
                  onChange={(e) => setFormBy(e.target.value)}
                  placeholder="e.g. Baker John"
                />
              </div>

              {selectedItem && formQty && Number.parseFloat(formQty) <= selectedItem.quantity && (
                <div className="rounded-lg bg-secondary/5 border border-secondary/20 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Stock</span>
                    <span className="text-foreground">{selectedItem.quantity} {selectedItem.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">After Rollout</span>
                    <span className="font-bold text-secondary">
                      {(selectedItem.quantity - Number.parseFloat(formQty)).toFixed(1)} {selectedItem.unit}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">Cancel</Button>
              <Button
                onClick={handleRollout}
                disabled={!formItem || !formQty || !formPurpose || !formBy || (selectedItem ? Number.parseFloat(formQty) > selectedItem.quantity : false)}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Confirm Rollout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 ${toast.includes('Not enough') ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}
      </main>
    </div>
  )
}
