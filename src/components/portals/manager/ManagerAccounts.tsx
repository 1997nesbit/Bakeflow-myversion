'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { FinancialTransaction, NewExpensePayload, RecurringPeriod } from '@/types/finance'
import type { PaymentMethod } from '@/types/order'
import {
  expenseCategories, businessExpenseCategories,
  type ExpenseCategory, type BusinessExpenseCategory,
} from '@/data/constants/categories'
import { financeService } from '@/lib/api/services/finance'
import { handleApiError } from '@/lib/utils/handle-error'
import { paymentMethodLabels } from '@/data/constants/labels'
import { TrendingDown, Building2, Package, Plus, Search, RefreshCw } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = [
  ...expenseCategories.map(c => ({ ...c, group: 'stock' as const })),
  ...businessExpenseCategories.map(c => ({ ...c, group: 'business' as const })),
]

const typeBadge: Record<string, string> = {
  stock_expense:    'bg-amber-500/20 text-amber-300',
  business_expense: 'bg-blue-500/20 text-blue-300',
}

const typeLabel: Record<string, string> = {
  stock_expense:    'Stock',
  business_expense: 'Business',
}

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
  { value: 'cheque', label: 'Cheque' },
]

// ─── Add Expense Dialog ───────────────────────────────────────────────────────

interface AddDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (payload: NewExpensePayload) => void
}

function AddExpenseDialog({ open, onOpenChange, onAdd }: AddDialogProps) {
  const [expenseType, setExpenseType] = useState<'stock_expense' | 'business_expense'>('business_expense')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paidTo, setPaidTo] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer')
  const [receiptRef, setReceiptRef] = useState('')
  const [notes, setNotes] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [recurringPeriod, setRecurringPeriod] = useState<RecurringPeriod | ''>('')

  const categoryOptions = expenseType === 'stock_expense' ? expenseCategories : businessExpenseCategories
  const canSubmit = !!(title && category && amount && paidTo && method)

  const reset = () => {
    setTitle(''); setCategory(''); setAmount(''); setPaidTo('')
    setReceiptRef(''); setNotes(''); setRecurring(false); setRecurringPeriod('')
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    onAdd({
      date,
      amount: Number(amount),
      type: expenseType,
      payment_method: method,
      description: title,
      category,
      paid_to: paidTo,
      receipt_ref: receiptRef || undefined,
      notes: notes || undefined,
      recurring,
      recurring_period: recurring && recurringPeriod ? recurringPeriod : undefined,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-manager-card border-white/10 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Record Expense</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {/* Expense type toggle */}
          <div className="flex rounded-lg border border-white/10 p-0.5 gap-0.5">
            {(['business_expense', 'stock_expense'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setExpenseType(t); setCategory('') }}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  expenseType === t ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t === 'business_expense' ? 'Business' : 'Stock'}
              </button>
            ))}
          </div>

          <div>
            <Label className="text-white/60">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Shop Rent - April" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/60">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60">Amount (TZS)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/60">Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" />
            </div>
            <div>
              <Label className="text-white/60">Payment Method</Label>
              <Select value={method} onValueChange={v => setMethod(v as PaymentMethod)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{paymentMethods.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-white/60">Paid To</Label>
            <Input value={paidTo} onChange={e => setPaidTo(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="Supplier or vendor name" />
          </div>
          <div>
            <Label className="text-white/60">Receipt Ref (optional)</Label>
            <Input value={receiptRef} onChange={e => setReceiptRef(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. INV-2026-0234" />
          </div>
          <div>
            <Label className="text-white/60">Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1 min-h-[56px]" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)} className="rounded border-white/20" />
            <span className="text-sm text-white/60">Recurring expense</span>
          </label>
          {recurring && (
            <Select value={recurringPeriod} onValueChange={v => setRecurringPeriod(v as RecurringPeriod)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Recurring period" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full bg-manager-accent hover:bg-manager-accent/85 text-white">
            Save Expense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ManagerAccounts() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    financeService.getTransactions({ direction: 'out', signal: controller.signal })
      .then(res => setTransactions(res.results))
      .catch(handleApiError)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (filterCat !== 'all' && t.category !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.description.toLowerCase().includes(q) && !(t.paidTo ?? '').toLowerCase().includes(q)) return false
    }
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const total          = transactions.reduce((s, t) => s + t.amount, 0)
  const bizTotal       = transactions.filter(t => t.type === 'business_expense').reduce((s, t) => s + t.amount, 0)
  const stockTotal     = transactions.filter(t => t.type === 'stock_expense').reduce((s, t) => s + t.amount, 0)
  const filteredTotal  = filtered.reduce((s, t) => s + t.amount, 0)

  const handleAdd = async (payload: NewExpensePayload) => {
    try {
      const created = await financeService.createExpense(payload)
      setTransactions(prev => [created, ...prev])
      setShowAdd(false)
      toast.success(`Expense recorded — TZS ${created.amount.toLocaleString()}`)
    } catch (err) {
      handleApiError(err)
    }
  }

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Expenses</h1>
            <p className="text-sm text-white/40">Business and stock expenses across all categories</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-manager-accent hover:bg-manager-accent/85 text-white">
            <Plus className="h-4 w-4 mr-2" /> Record Expense
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-manager-accent/10">
                <TrendingDown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-white/40">Total Expenses</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {total.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{transactions.length} records</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Building2 className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-white/40">Business Expenses</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {bizTotal.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{transactions.filter(t => t.type === 'business_expense').length} records</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <Package className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-xs text-white/40">Stock Expenses</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {stockTotal.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{transactions.filter(t => t.type === 'stock_expense').length} records</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search description or payee..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={filterType} onValueChange={v => { setFilterType(v); setFilterCat('all') }}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="business_expense">Business</SelectItem>
              <SelectItem value="stock_expense">Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(filterType === 'stock_expense'
                ? expenseCategories
                : filterType === 'business_expense'
                  ? businessExpenseCategories
                  : ALL_CATEGORIES
              ).map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-white/40">
            {filtered.length} records · TZS {filteredTotal.toLocaleString()}
          </div>
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {loading && <p className="text-white/40 text-sm py-8 text-center">Loading expenses...</p>}
          {!loading && filtered.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] py-12 text-center">
              <TrendingDown className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No expenses match your filters</p>
            </div>
          )}
          {!loading && filtered.map(t => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 shrink-0">
                {t.type === 'stock_expense'
                  ? <Package className="h-4 w-4 text-amber-400/70" />
                  : <Building2 className="h-4 w-4 text-blue-400/70" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-white truncate">{t.description}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 shrink-0 ${typeBadge[t.type] ?? 'bg-white/10 text-white/60'}`}>
                    {typeLabel[t.type] ?? t.type}
                  </Badge>
                  {t.category && (
                    <Badge className="text-[10px] px-1.5 py-0 border-0 bg-white/5 text-white/40 shrink-0">
                      {ALL_CATEGORIES.find(c => c.value === t.category)?.label ?? t.category}
                    </Badge>
                  )}
                  {t.recurring && (
                    <Badge className="text-[10px] px-1.5 py-0 border-0 bg-purple-500/20 text-purple-300 shrink-0">
                      <RefreshCw className="h-2.5 w-2.5 mr-1" />{t.recurringPeriod}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>{t.date}</span>
                  {t.paidTo && <span>Paid to: {t.paidTo}</span>}
                  {t.paymentMethod && <span>{paymentMethodLabels[t.paymentMethod as PaymentMethod] ?? t.paymentMethod}</span>}
                  {t.receiptRef && <span className="text-primary/60">Ref: {t.receiptRef}</span>}
                </div>
                {t.notes && <p className="text-xs text-white/20 mt-0.5 italic truncate">{t.notes}</p>}
              </div>
              <p className="text-sm font-bold text-primary shrink-0">TZS {t.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <AddExpenseDialog open={showAdd} onOpenChange={setShowAdd} onAdd={handleAdd} />
      </main>
    </div>
  )
}
