'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PackagePlus, CheckCircle } from 'lucide-react'
import type { InventoryItem, Supplier } from '@/types/inventory'

interface Props {
  open: boolean
  inventory: InventoryItem[]
  suppliers: Supplier[]
  onOpenChange: (open: boolean) => void
  onSubmit: (itemId: string, supplierName: string, qty: number, cost: number, invoiceRef?: string) => void
}

export function AddStockDialog({ open, inventory, suppliers, onOpenChange, onSubmit }: Props) {
  const [formItem, setFormItem] = useState('')
  const [formSupplier, setFormSupplier] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formCost, setFormCost] = useState('')
  const [formInvoice, setFormInvoice] = useState('')

  const selectedItem = inventory.find(i => i.id === formItem)
  const totalCost = Number.parseFloat(formQty || '0') * Number.parseFloat(formCost || '0')

  const handleSubmit = () => {
    if (!formItem || !formSupplier || !formQty || !formCost) return
    onSubmit(formItem, formSupplier, Number.parseFloat(formQty), Number.parseFloat(formCost), formInvoice || undefined)
    setFormItem(''); setFormSupplier(''); setFormQty(''); setFormCost(''); setFormInvoice('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            Add Stock Entry
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Product</Label>
            <Select value={formItem} onValueChange={setFormItem}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {inventory.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.quantity} {item.unit} in stock)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={formSupplier} onValueChange={setFormSupplier}>
              <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity {selectedItem ? `(${selectedItem.unit})` : ''}</Label>
              <Input type="number" min="0.1" step="0.1" value={formQty} onChange={e => setFormQty(e.target.value)} placeholder="Amount" />
            </div>
            <div className="space-y-2">
              <Label>Cost per unit ($)</Label>
              <Input type="number" min="0.01" step="0.01" value={formCost} onChange={e => setFormCost(e.target.value)} placeholder="Price" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Invoice / Reference (optional)</Label>
            <Input value={formInvoice} onChange={e => setFormInvoice(e.target.value)} placeholder="e.g. INV-2026-0451" />
          </div>

          {formQty && formCost && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cost</span>
                <span className="font-bold text-foreground">TZS {totalCost.toLocaleString()}</span>
              </div>
              {selectedItem && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">New Stock Level</span>
                  <span className="font-bold text-emerald-600">
                    {selectedItem.quantity + Number.parseFloat(formQty || '0')} {selectedItem.unit}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!formItem || !formSupplier || !formQty || !formCost}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Confirm Stock In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
