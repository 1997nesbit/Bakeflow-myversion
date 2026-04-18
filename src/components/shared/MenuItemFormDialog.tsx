'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { MenuItem } from '@/types/order'

interface MenuItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Populated in edit mode; undefined in add mode */
  item?: MenuItem
  categories: string[]
  onSave: (data: Omit<MenuItem, 'id'>, id?: string) => void
  /** Tailwind classes applied to every Input/Textarea/SelectTrigger */
  inputClass?: string
  /** Tailwind classes applied to every Label */
  labelClass?: string
  /** Tailwind classes applied to the DialogContent */
  dialogBg?: string
  /** Tailwind classes for the primary action button */
  accentClass?: string
}

export function MenuItemFormDialog({
  open,
  onOpenChange,
  item,
  categories,
  onSave,
  inputClass = '',
  labelClass = '',
  dialogBg = '',
  accentClass = 'bg-primary hover:bg-primary/90 text-primary-foreground',
}: MenuItemFormDialogProps) {
  const [fName, setFName] = useState('')
  const [fCategory, setFCategory] = useState('')
  const [fNewCat, setFNewCat] = useState('')
  const [fPrice, setFPrice] = useState('')
  const [fMinutes, setFMinutes] = useState('')
  const [fDesc, setFDesc] = useState('')

  useEffect(() => {
    if (open) {
      setFName(item?.name ?? '')
      setFCategory(item?.category ?? categories[0] ?? '')
      setFPrice(item ? String(item.price) : '')
      setFMinutes(item ? String(item.estimatedMinutes) : '')
      setFDesc(item?.description ?? '')
      setFNewCat('')
    }
  }, [open, item, categories])

  function handleSave() {
    const category = fNewCat.trim() ? fNewCat.trim().toLowerCase() : fCategory
    if (!fName.trim() || !category || !fPrice || !fMinutes) {
      toast.warning('Please fill in all required fields.')
      return
    }
    const price = Number(fPrice)
    const minutes = Number(fMinutes)
    if (isNaN(price) || price <= 0 || isNaN(minutes) || minutes <= 0) {
      toast.warning('Price and estimated minutes must be positive numbers.')
      return
    }
    onSave(
      { name: fName.trim(), category, price, estimatedMinutes: minutes, description: fDesc.trim() || undefined },
      item?.id,
    )
  }

  const muLabel = labelClass || 'text-muted-foreground'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${dialogBg}`}>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className={labelClass}>Name *</Label>
            <Input value={fName} onChange={e => setFName(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="e.g. Chocolate Cake" />
          </div>
          <div>
            <Label className={labelClass}>Category *</Label>
            <Select value={fCategory} onValueChange={setFCategory}>
              <SelectTrigger className={`mt-1 ${inputClass}`}><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={`text-[11px] mt-1.5 ${muLabel}`}>Or create a new category below:</p>
            <Input value={fNewCat} onChange={e => setFNewCat(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="New category name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Price (TZS) *</Label>
              <Input type="number" min={1} value={fPrice} onChange={e => setFPrice(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="45000" />
            </div>
            <div>
              <Label className={labelClass}>Est. Minutes *</Label>
              <Input type="number" min={1} value={fMinutes} onChange={e => setFMinutes(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="90" />
            </div>
          </div>
          <div>
            <Label className={labelClass}>Description</Label>
            <Textarea value={fDesc} onChange={e => setFDesc(e.target.value)} className={`mt-1 min-h-[60px] ${inputClass}`} />
          </div>
          <Button onClick={handleSave} className={`w-full ${accentClass}`}>
            {item ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
