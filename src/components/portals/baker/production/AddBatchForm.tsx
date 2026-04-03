'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Layers, Plus, X } from 'lucide-react'
import { menuService } from '@/lib/api/services/menu'
import { handleApiError } from '@/lib/utils/handle-error'
import type { MenuItem } from '@/types/order'
import type { NewBatchPayload } from '@/types/production'

interface Props {
  onAdd: (payload: NewBatchPayload) => void
  onCancel: () => void
}

export function AddBatchForm({ onAdd, onCancel }: Props) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [formQuantity, setFormQuantity] = useState('')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    menuService.getItems({ signal: controller.signal })
      .then(setMenuItems)
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const selectedItem = menuItems.find(i => i.id === selectedItemId)

  const handleAdd = () => {
    if (!selectedItemId || !formQuantity) return
    const qty = parseInt(formQuantity)
    if (isNaN(qty) || qty <= 0) return
    onAdd({
      menuItemId: selectedItemId,
      quantityBaked: qty,
      notes: formNotes.trim() || undefined,
    })
  }

  const isValid = !!selectedItemId && !!formQuantity && parseInt(formQuantity) > 0

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
          <label htmlFor="batch-menu-item" className="text-xs font-medium text-muted-foreground mb-1 block">
            Product
          </label>
          <select
            id="batch-menu-item"
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a menu item…</option>
            {menuItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {selectedItem && (
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              Category: {selectedItem.category}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="batch-quantity" className="text-xs font-medium text-muted-foreground mb-1 block">
            Quantity
          </label>
          <Input
            id="batch-quantity"
            type="number"
            min="1"
            value={formQuantity}
            onChange={e => setFormQuantity(e.target.value)}
            placeholder="50"
            className="h-10"
          />
        </div>

        <div>
          <label htmlFor="batch-notes" className="text-xs font-medium text-muted-foreground mb-1 block">
            Notes (optional)
          </label>
          <Textarea
            id="batch-notes"
            value={formNotes}
            onChange={e => setFormNotes(e.target.value)}
            placeholder="e.g. Oven #1, extra glaze, butter croissant dough…"
            className="min-h-[60px] text-sm"
          />
        </div>

        <Button
          className="w-full text-white border-0"
          style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
          onClick={handleAdd}
          disabled={!isValid}
        >
          <Layers className="mr-2 h-4 w-4" />
          Log Batch
        </Button>
      </CardContent>
    </Card>
  )
}
