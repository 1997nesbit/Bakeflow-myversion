'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { InventoryItem, InventoryItemPayload, Supplier } from '@/types/inventory'
import { Package } from 'lucide-react'

interface Props {
  open: boolean
  item: InventoryItem | null   // null = create mode
  suppliers: Supplier[]
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: InventoryItemPayload) => Promise<void>
}

const CATEGORY_LABELS: Record<string, string> = {
  ingredient: 'Ingredient',
  packaging:  'Packaging',
  finished:   'Finished Good',
}

export function ItemFormDialog({ open, item, suppliers, onOpenChange, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'ingredient' | 'packaging' | 'finished'>('ingredient')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('')
  const [minStock, setMinStock] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [supplierId, setSupplierId] = useState<string>('none')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(item?.name ?? '')
      setCategory(item?.category ?? 'ingredient')
      setQuantity(item ? String(item.quantity) : '')
      setUnit(item?.unit ?? '')
      setMinStock(item ? String(item.minStock) : '')
      setCostPerUnit(item ? String(item.costPerUnit) : '')
      setSupplierId(item?.supplier?.id ?? 'none')
    }
  }, [open, item])

  const isValid = name.trim() && unit.trim() && minStock && costPerUnit

  const handleSubmit = async () => {
    if (!isValid) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        category,
        quantity: quantity ? Number(quantity) : undefined,
        unit: unit.trim(),
        minStock: Number(minStock),
        costPerUnit: Number(costPerUnit),
        supplierId: supplierId === 'none' ? null : supplierId,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-white/30 mt-1'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-manager-card border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Package className="h-5 w-5 text-manager-accent" />
            {item ? 'Edit Item' : 'New Inventory Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-white/60">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. All-purpose flour" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60">Category</Label>
              <Select value={category} onValueChange={v => setCategory(v as typeof category)}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60">Unit</Label>
              <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="kg, L, pcs…" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60">{item ? 'Current Quantity' : 'Initial Quantity'}</Label>
              <Input type="number" min="0" step="0.001" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <div>
              <Label className="text-white/60">Min Stock</Label>
              <Input type="number" min="0" step="0.001" value={minStock} onChange={e => setMinStock(e.target.value)} placeholder="Reorder threshold" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60">Cost Per Unit (TZS)</Label>
              <Input type="number" min="0" step="0.01" value={costPerUnit} onChange={e => setCostPerUnit(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <Label className="text-white/60">Supplier (optional)</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 text-white/60 hover:text-white bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="bg-manager-accent hover:bg-manager-accent/85 text-white"
          >
            {item ? 'Save Changes' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
