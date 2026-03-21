'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Expense, ExpenseCategory } from '@/types/finance'
import { expenseCategories } from '@/data/constants/categories'

interface Props {
  open: boolean
  expenseCount: number
  onOpenChange: (open: boolean) => void
  onAdd: (expense: Expense) => void
}

const initialForm = {
  title: '',
  category: '' as ExpenseCategory | '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  paidTo: '',
  paymentMethod: '' as string,
  receiptRef: '',
  notes: '',
  recurring: false,
  recurringPeriod: '' as string,
}

export function AddExpenseDialog({ open, expenseCount, onOpenChange, onAdd }: Props) {
  const [form, setForm] = useState(initialForm)

  const handleAdd = () => {
    if (!form.title || !form.category || !form.amount || !form.date || !form.paidTo || !form.paymentMethod) return

    const expense: Expense = {
      id: `EXP-${String(expenseCount + 1).padStart(3, '0')}`,
      title: form.title,
      category: form.category as ExpenseCategory,
      amount: Number.parseFloat(form.amount),
      date: form.date,
      paidTo: form.paidTo,
      paymentMethod: form.paymentMethod as Expense['paymentMethod'],
      receiptRef: form.receiptRef || undefined,
      notes: form.notes || undefined,
      recurring: form.recurring,
      recurringPeriod: form.recurring ? (form.recurringPeriod as Expense['recurringPeriod']) : undefined,
      addedBy: 'Manager Admin',
    }
    onAdd(expense)
    setForm(initialForm)
  }

  const canSubmit = !!(form.title && form.category && form.amount && form.date && form.paidTo && form.paymentMethod)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Stock Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Expense Title *</Label>
            <Input placeholder="e.g. Bulk Flour Order - 50kg bags" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount ($) *</Label>
              <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <Label>Payment Method *</Label>
              <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Paid To / Supplier *</Label>
            <Input placeholder="e.g. GrainCo Suppliers" value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} />
          </div>

          <div>
            <Label>Receipt / Invoice Reference</Label>
            <Input placeholder="e.g. INV-2026-0234" value={form.receiptRef} onChange={(e) => setForm({ ...form, receiptRef: e.target.value })} />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="recurring"
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary"
            />
            <Label htmlFor="recurring" className="mb-0">This is a recurring stock expense</Label>
          </div>

          {form.recurring && (
            <div>
              <Label>Recurring Period</Label>
              <Select value={form.recurringPeriod} onValueChange={(v) => setForm({ ...form, recurringPeriod: v })}>
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea placeholder="Additional details about this stock expense..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAdd} disabled={!canSubmit}>
              Save Expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
