'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BusinessExpense, BusinessExpenseCategory } from '@/types/finance'
import type { PaymentMethod } from '@/types/order'
import { mockBusinessExpenses } from '@/data/mock/finance'
import { businessExpenseCategories } from '@/data/constants/categories'
import { paymentMethodLabels } from '@/data/constants/labels'
import { Settings, Plus, Filter, Receipt, TrendingDown, Calendar, Building2 } from 'lucide-react'

export function ManagerAccounts() {
  const [expenses, setExpenses] = useState<BusinessExpense[]>(mockBusinessExpenses)
  const [filterCat, setFilterCat] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)

  const [fTitle, setFTitle] = useState('')
  const [fCat, setFCat] = useState<BusinessExpenseCategory>('rent')
  const [fAmount, setFAmount] = useState('')
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fPaidTo, setFPaidTo] = useState('')
  const [fMethod, setFMethod] = useState<PaymentMethod>('bank_transfer')
  const [fNotes, setFNotes] = useState('')
  const [fRecurring, setFRecurring] = useState(false)

  const filtered = filterCat === 'all' ? expenses : expenses.filter(e => e.category === filterCat)
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0)
  const totalRecurring = expenses.filter(e => e.recurring).reduce((s, e) => s + e.amount, 0)

  const catColor: Record<string, string> = {
    rent: 'bg-blue-500/20 text-blue-300', salaries: 'bg-purple-500/20 text-purple-300',
    utilities: 'bg-amber-500/20 text-amber-300', marketing: 'bg-pink-500/20 text-pink-300',
    licenses: 'bg-green-500/20 text-green-300', transport: 'bg-indigo-500/20 text-indigo-300',
    cleaning: 'bg-teal-500/20 text-teal-300', misc: 'bg-gray-500/20 text-gray-400',
  }

  const handleAdd = () => {
    if (!fTitle || !fAmount) return
    const newExp: BusinessExpense = {
      id: `BEX-${String(expenses.length + 1).padStart(3, '0')}`,
      title: fTitle, category: fCat, amount: Number(fAmount), date: fDate,
      paidTo: fPaidTo, paymentMethod: fMethod, notes: fNotes || undefined, recurring: fRecurring,
    }
    setExpenses([newExp, ...expenses])
    setShowAdd(false)
    setFTitle(''); setFAmount(''); setFPaidTo(''); setFNotes('')
  }

  return (
    <div className="min-h-screen bg-[#0f0709]">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Account Management</h1>
            <p className="text-sm text-white/40">Business expenses and financial accounts</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-[#CA0123] hover:bg-[#a8011d] text-white">
            <Plus className="h-4 w-4 mr-2" /> Record Expense
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#CA0123]/10"><TrendingDown className="h-4 w-4 text-[#e66386]" /></div>
              <span className="text-xs text-white/40">Total Business Expenses</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {totalAll.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10"><Calendar className="h-4 w-4 text-purple-400" /></div>
              <span className="text-xs text-white/40">Recurring Monthly</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {totalRecurring.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10"><Receipt className="h-4 w-4 text-green-400" /></div>
              <span className="text-xs text-white/40">Records</span>
            </div>
            <p className="text-xl font-bold text-white">{expenses.length}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-3 mb-5">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-56 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Filter category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {businessExpenseCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Expense list */}
        <div className="space-y-2">
          {filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
            <div key={e.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shrink-0">
                <Building2 className="h-4 w-4 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{e.title}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${catColor[e.category] || 'bg-gray-500/20 text-gray-400'}`}>
                    {businessExpenseCategories.find(c => c.value === e.category)?.label || e.category}
                  </Badge>
                  {e.recurring && <Badge className="text-[10px] px-1.5 py-0 border-0 bg-blue-500/20 text-blue-300">Recurring</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30 mt-0.5">
                  <span>{e.date}</span>
                  <span>Paid to: {e.paidTo}</span>
                  <span>{paymentMethodLabels[e.paymentMethod]}</span>
                  {e.receiptRef && <span>Ref: {e.receiptRef}</span>}
                </div>
              </div>
              <p className="text-sm font-bold text-[#e66386] shrink-0">TZS {e.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Add Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="bg-[#1a0a0e] border-white/10 text-white sm:max-w-md">
            <DialogHeader><DialogTitle>Record Business Expense</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-white/60">Title</Label><Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Shop Rent - March" /></div>
              <div>
                <Label className="text-white/60">Category</Label>
                <Select value={fCat} onValueChange={(v) => setFCat(v as BusinessExpenseCategory)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{businessExpenseCategories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60">Amount (TZS)</Label><Input type="number" value={fAmount} onChange={(e) => setFAmount(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div><Label className="text-white/60">Date</Label><Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div><Label className="text-white/60">Paid To</Label><Input value={fPaidTo} onChange={(e) => setFPaidTo(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div>
                <Label className="text-white/60">Payment Method</Label>
                <Select value={fMethod} onValueChange={(v) => setFMethod(v as PaymentMethod)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.entries(paymentMethodLabels) as [PaymentMethod, string][]).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60">Notes (optional)</Label><Textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1 min-h-[60px]" /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fRecurring} onChange={(e) => setFRecurring(e.target.checked)} className="rounded border-white/20" />
                <span className="text-sm text-white/60">Recurring expense</span>
              </label>
              <Button onClick={handleAdd} className="w-full bg-[#CA0123] hover:bg-[#a8011d] text-white">Save Expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
