'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Layers, Plus, X } from 'lucide-react'
import type { DailyBatchItem } from '@/types/production'
import { bakeryMenu } from '@/data/constants/menus'

interface Props {
  batchCount: number
  onAdd: (batch: DailyBatchItem) => void
  onCancel: () => void
}

const menuSuggestions = bakeryMenu.filter(m => m.category !== 'beverage' && m.category !== 'cake')

export function AddBatchForm({ batchCount, onAdd, onCancel }: Props) {
  const [formProduct, setFormProduct] = useState('')
  const [formCategory, setFormCategory] = useState<DailyBatchItem['category']>('bread')
  const [formQuantity, setFormQuantity] = useState('')
  const [formUnit, setFormUnit] = useState('pcs')
  const [formOvenTemp, setFormOvenTemp] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const handleAdd = () => {
    if (!formProduct.trim() || !formQuantity) return
    const qty = parseInt(formQuantity)
    if (isNaN(qty) || qty <= 0) return

    let bakerName = 'Baker'
    try {
      const auth = localStorage.getItem('baker_auth')
      if (auth) bakerName = JSON.parse(auth).name || 'Baker'
    } catch { /* ignore */ }

    const newBatch: DailyBatchItem = {
      id: `BATCH-${String(batchCount + 1).padStart(3, '0')}`,
      productName: formProduct.trim(),
      category: formCategory,
      quantityBaked: qty,
      quantityRemaining: qty,
      unit: formUnit,
      bakedBy: bakerName,
      bakedAt: new Date().toISOString(),
      ovenTemp: formOvenTemp.trim() || undefined,
      notes: formNotes.trim() || undefined,
    }
    onAdd(newBatch)
  }

  return (
    <Card className="border-2 shadow-sm" style={{ borderColor: '#e66386' }}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5" style={{ color: '#CA0123' }} />
            <h3 className="text-base font-semibold text-foreground">Log New Batch</h3>
          </div>
          <button type="button" onClick={onCancel}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick select from menu:</p>
          <div className="flex flex-wrap gap-1.5">
            {menuSuggestions.map(item => (
              <button
                key={item.id}
                type="button"
                className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  borderColor: formProduct === item.name ? '#CA0123' : '#fbd5db',
                  background: formProduct === item.name ? '#fce7ea' : 'transparent',
                  color: formProduct === item.name ? '#CA0123' : undefined,
                }}
                onClick={() => {
                  setFormProduct(item.name)
                  setFormCategory(item.category as DailyBatchItem['category'])
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="batch-product-name" className="text-xs font-medium text-muted-foreground mb-1 block">Product Name</label>
            <Input id="batch-product-name" value={formProduct} onChange={e => setFormProduct(e.target.value)} placeholder="e.g. Sourdough Loaf" className="h-10" />
          </div>
          <div>
            <label htmlFor="batch-category" className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
            <select
              id="batch-category"
              value={formCategory}
              onChange={e => setFormCategory(e.target.value as DailyBatchItem['category'])}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="bread">Bread</option>
              <option value="pastry">Pastry</option>
              <option value="snack">Snack</option>
              <option value="cake">Cake</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="batch-quantity" className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
            <Input id="batch-quantity" type="number" min="1" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} placeholder="50" className="h-10" />
          </div>
          <div>
            <label htmlFor="batch-unit" className="text-xs font-medium text-muted-foreground mb-1 block">Unit</label>
            <select
              id="batch-unit"
              value={formUnit}
              onChange={e => setFormUnit(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="pcs">Pieces</option>
              <option value="loaves">Loaves</option>
              <option value="trays">Trays</option>
              <option value="boxes">Boxes</option>
            </select>
          </div>
          <div>
            <label htmlFor="batch-oven-temp" className="text-xs font-medium text-muted-foreground mb-1 block">Oven Temp</label>
            <Input id="batch-oven-temp" value={formOvenTemp} onChange={e => setFormOvenTemp(e.target.value)} placeholder="e.g. 220C" className="h-10" />
          </div>
        </div>

        <div>
          <label htmlFor="batch-notes" className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
          <Textarea id="batch-notes" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="e.g. Oven #1, extra glaze, butter croissant dough..." className="min-h-[60px] text-sm" />
        </div>

        <Button
          className="w-full text-white border-0"
          style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
          onClick={handleAdd}
          disabled={!formProduct.trim() || !formQuantity}
        >
          <Layers className="mr-2 h-4 w-4" />
          Log Batch
        </Button>
      </CardContent>
    </Card>
  )
}
