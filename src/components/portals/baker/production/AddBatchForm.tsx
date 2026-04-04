'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Layers, Plus, X, AlertCircle } from 'lucide-react'
import { inventoryService } from '@/lib/api/services/inventory'
import { handleApiError } from '@/lib/utils/handle-error'
import type { DailyRollout } from '@/types/inventory'
import type { NewBatchPayload, BatchIngredientPayload } from '@/types/production'

interface IngredientRow {
  rolloutId: string
  quantityUsed: string   // string for controlled input
}

interface Props {
  onAdd: (payload: NewBatchPayload) => void
  onCancel: () => void
}

export function AddBatchForm({ onAdd, onCancel }: Props) {
  const [productName, setProductName]   = useState('')
  const [formQuantity, setFormQuantity] = useState('')
  const [formNotes, setFormNotes]       = useState('')
  const [rows, setRows]                 = useState<IngredientRow[]>([])
  const [rollouts, setRollouts]         = useState<DailyRollout[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const today = new Date().toISOString().split('T')[0]
    inventoryService.getRollouts({ date: today, signal: controller.signal })
      .then(res => setRollouts(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  // For a given rollout, compute how much is still available considering:
  //   - already-used by other batches (rollout.quantityUsed from server)
  //   - claimed by OTHER rows in this form (not the row at rowIndex)
  const available = (rolloutId: string, excludeRowIndex: number): number => {
    const rollout = rollouts.find(r => r.id === rolloutId)
    if (!rollout) return 0
    const claimedByOtherRows = rows.reduce((sum, row, idx) => {
      if (idx === excludeRowIndex || row.rolloutId !== rolloutId) return sum
      return sum + (parseFloat(row.quantityUsed) || 0)
    }, 0)
    return rollout.quantity - rollout.quantityUsed - claimedByOtherRows
  }

  const rowError = (row: IngredientRow, idx: number): string | null => {
    if (!row.rolloutId || !row.quantityUsed) return null
    const qty = parseFloat(row.quantityUsed)
    if (isNaN(qty) || qty <= 0) return 'Must be > 0'
    const avail = available(row.rolloutId, idx)
    if (qty > avail) {
      const rollout = rollouts.find(r => r.id === row.rolloutId)
      return `Only ${avail.toFixed(3)} ${rollout?.itemUnit ?? ''} available`
    }
    return null
  }

  const addRow = () => setRows(prev => [...prev, { rolloutId: '', quantityUsed: '' }])

  const updateRow = (idx: number, patch: Partial<IngredientRow>) =>
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))

  const removeRow = (idx: number) =>
    setRows(prev => prev.filter((_, i) => i !== idx))

  const ingredientsValid = rows.every((row, idx) => {
    if (!row.rolloutId || !row.quantityUsed) return false
    const qty = parseFloat(row.quantityUsed)
    return !isNaN(qty) && qty > 0 && rowError(row, idx) === null
  })

  const isValid =
    !!productName.trim() &&
    !!formQuantity &&
    parseInt(formQuantity) > 0 &&
    (rows.length === 0 || ingredientsValid)

  const handleAdd = () => {
    if (!isValid) return
    const ingredients: BatchIngredientPayload[] = rows.map(row => ({
      rolloutId:    row.rolloutId,
      quantityUsed: parseFloat(row.quantityUsed),
    }))
    onAdd({
      productName:   productName.trim(),
      quantityBaked: parseInt(formQuantity),
      notes:         formNotes.trim() || undefined,
      ingredients,
    })
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

        {/* Product name */}
        <div>
          <label htmlFor="batch-product-name" className="text-xs font-medium text-muted-foreground mb-1 block">
            Base / Product Name
          </label>
          <Input
            id="batch-product-name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            placeholder="e.g. Vanilla Sponge Base, Croissant Dough…"
            className="h-10"
          />
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="batch-quantity" className="text-xs font-medium text-muted-foreground mb-1 block">
            Quantity (pcs)
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

        {/* Ingredient rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Ingredients used (from today&apos;s rollouts)</p>
            <button
              type="button"
              onClick={addRow}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: '#CA0123' }}
            >
              <Plus className="h-3 w-3" /> Add ingredient
            </button>
          </div>

          {rows.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Optional — add if this batch consumed rolled-out stock.</p>
          )}

          {rows.map((row, idx) => {
            const err = rowError(row, idx)
            const selectedRollout = rollouts.find(r => r.id === row.rolloutId)
            const avail = row.rolloutId ? available(row.rolloutId, idx) : null

            return (
              <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={row.rolloutId}
                    onChange={e => updateRow(idx, { rolloutId: e.target.value, quantityUsed: '' })}
                    className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select rollout…</option>
                    {rollouts.map(r => {
                      const remainingForOption = r.quantity - r.quantityUsed - rows.reduce((sum, row2, idx2) => {
                        if (idx2 === idx || row2.rolloutId !== r.id) return sum
                        return sum + (parseFloat(row2.quantityUsed) || 0)
                      }, 0)
                      return (
                        <option key={r.id} value={r.id}>
                          {r.itemName} — {remainingForOption.toFixed(2)} {r.itemUnit} available
                        </option>
                      )
                    })}
                  </select>
                  <button type="button" onClick={() => removeRow(idx)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {row.rolloutId && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={row.quantityUsed}
                      onChange={e => updateRow(idx, { quantityUsed: e.target.value })}
                      placeholder={`Amount in ${selectedRollout?.itemUnit ?? 'units'}`}
                      className={`h-9 text-sm ${err ? 'border-destructive' : ''}`}
                    />
                    {avail !== null && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        / {avail.toFixed(2)} {selectedRollout?.itemUnit} left
                      </span>
                    )}
                  </div>
                )}

                {err && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {err}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="batch-notes" className="text-xs font-medium text-muted-foreground mb-1 block">
            Notes (optional)
          </label>
          <Textarea
            id="batch-notes"
            value={formNotes}
            onChange={e => setFormNotes(e.target.value)}
            placeholder="e.g. Oven #1, extra glaze, overnight proof…"
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
