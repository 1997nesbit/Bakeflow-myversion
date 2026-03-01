'use client'

import { useState, useEffect } from 'react'
import { InventorySidebar } from '@/components/inventory/inventory-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  mockExpenses,
  expenseCategories,
  type Expense,
  type ExpenseCategory,
} from '@/lib/mock-data'
import {
  Receipt,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  CalendarDays,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Download,
  ShieldAlert,
  Lock,
  Package,
} from 'lucide-react'

const categoryColors: Record<ExpenseCategory, string> = {
  raw_materials: 'bg-amber-100 text-amber-800',
  packaging: 'bg-blue-100 text-blue-800',
  equipment: 'bg-orange-100 text-orange-800',
  storage: 'bg-teal-100 text-teal-800',
  delivery_logistics: 'bg-indigo-100 text-indigo-800',
  wastage: 'bg-red-100 text-red-800',
  miscellaneous: 'bg-gray-100 text-gray-800',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  cheque: 'Cheque',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [mounted, setMounted] = useState(false)
  const [isManager, setIsManager] = useState(false)
  const [managerPin, setManagerPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '' })

  useEffect(() => {
    setMounted(true)
    const stored = sessionStorage.getItem('bbr_manager_expenses_access')
    if (stored === 'granted') setIsManager(true)
  }, [])

  const handleManagerLogin = () => {
    if (managerPin === '1234') {
      setIsManager(true)
      setPinError(false)
      sessionStorage.setItem('bbr_manager_expenses_access', 'granted')
    } else {
      setPinError(true)
    }
  }

  const [newExpense, setNewExpense] = useState({
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
  })

  const filtered = expenses
    .filter(e => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!e.title.toLowerCase().includes(q) && !e.paidTo.toLowerCase().includes(q) && !e.id.toLowerCase().includes(q)) return false
      }
      if (filterCategory !== 'all' && e.category !== filterCategory) return false
      if (filterMonth !== 'all' && !e.date.startsWith(filterMonth)) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'date') return sortDir === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)
      return sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount
    })

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const thisMonthExpenses = expenses.filter(e => e.date.startsWith('2026-02')).reduce((s, e) => s + e.amount, 0)
  const lastMonthExpenses = expenses.filter(e => e.date.startsWith('2026-01')).reduce((s, e) => s + e.amount, 0)
  const recurringTotal = expenses.filter(e => e.recurring).reduce((s, e) => s + e.amount, 0)

  const categoryBreakdown = expenseCategories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.category === cat.value).length,
  })).filter(c => c.count > 0).sort((a, b) => b.total - a.total)

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.category || !newExpense.amount || !newExpense.date || !newExpense.paidTo || !newExpense.paymentMethod) return

    const expense: Expense = {
      id: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
      title: newExpense.title,
      category: newExpense.category as ExpenseCategory,
      amount: parseFloat(newExpense.amount),
      date: newExpense.date,
      paidTo: newExpense.paidTo,
      paymentMethod: newExpense.paymentMethod as Expense['paymentMethod'],
      receiptRef: newExpense.receiptRef || undefined,
      notes: newExpense.notes || undefined,
      recurring: newExpense.recurring,
      recurringPeriod: newExpense.recurring ? (newExpense.recurringPeriod as Expense['recurringPeriod']) : undefined,
      addedBy: 'Manager Admin',
    }

    setExpenses([expense, ...expenses])
    setShowAddDialog(false)
    setNewExpense({ title: '', category: '', amount: '', date: new Date().toISOString().split('T')[0], paidTo: '', paymentMethod: '', receiptRef: '', notes: '', recurring: false, recurringPeriod: '' })
    setToast({ show: true, message: `Expense "${expense.title}" recorded - $${expense.amount.toFixed(2)}` })
    setTimeout(() => setToast({ show: false, message: '' }), 3000)
  }

  // Manager access gate
  if (!isManager) {
    return (
      <div className="min-h-screen bg-background">
        <InventorySidebar />
        <main className="ml-64 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-5">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Manager Access Required</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Inventory expenses are restricted to managers only. Enter your PIN to continue.
              </p>
              <div className="space-y-3">
                <Input
                  type="password"
                  maxLength={4}
                  placeholder="Enter 4-digit PIN"
                  value={managerPin}
                  onChange={(e) => { setManagerPin(e.target.value); setPinError(false) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleManagerLogin()}
                  className={`text-center text-lg tracking-[0.5em] ${pinError ? 'border-red-500 ring-red-500' : ''}`}
                />
                {pinError && (
                  <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Incorrect PIN. Try again.
                  </p>
                )}
                <Button
                  onClick={handleManagerLogin}
                  disabled={managerPin.length !== 4}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Unlock Expenses
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Demo PIN: 1234
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Inventory Expenses</h1>
                <Badge className="bg-primary/10 text-primary border-0 text-xs">
                  <Package className="mr-1 h-3 w-3" />
                  Stock Only
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Track stock-related costs: ingredients, packaging, equipment, storage
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-transparent text-xs" onClick={() => { sessionStorage.removeItem('bbr_manager_expenses_access'); setIsManager(false) }}>
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Lock
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Record Expense
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                </div>
                <p className="text-2xl font-bold text-foreground">${thisMonthExpenses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">February 2026</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Last Month</p>
                </div>
                <p className="text-2xl font-bold text-foreground">${lastMonthExpenses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">January 2026</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Recurring</p>
                </div>
                <p className="text-2xl font-bold text-foreground">${recurringTotal.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.filter(e => e.recurring).length} recurring costs</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Receipt className="h-5 w-5 text-amber-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Tracked</p>
                </div>
                <p className="text-2xl font-bold text-foreground">${totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} stock expense records</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Category Breakdown */}
            <Card className="border-0 shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">By Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBreakdown.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
                    className={`w-full text-left rounded-lg p-2.5 transition-colors ${filterCategory === cat.value ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground truncate">{cat.label.split('&')[0].trim()}</p>
                      <p className="text-sm font-bold text-foreground">${cat.total.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min((cat.total / totalExpenses) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{cat.count} transaction{cat.count > 1 ? 's' : ''}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Expense List */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search & Filter Bar */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search stock expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {expenseCategories.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label.split('&')[0].trim()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterMonth} onValueChange={setFilterMonth}>
                      <SelectTrigger className="w-[160px]">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        <SelectItem value="2026-02">February 2026</SelectItem>
                        <SelectItem value="2026-01">January 2026</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="bg-transparent"
                      onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
                    >
                      <ArrowUpDown className="mr-1.5 h-4 w-4" />
                      {sortBy === 'date' ? 'Date' : 'Amount'}
                    </Button>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'amount')}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Sort by Date</SelectItem>
                        <SelectItem value="amount">Sort by Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Results Count */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  {filtered.length} expense{filtered.length !== 1 ? 's' : ''} found
                  {filtered.length > 0 && ` - Total: $${filtered.reduce((s, e) => s + e.amount, 0).toLocaleString()}`}
                </p>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                  <Download className="mr-1.5 h-3 w-3" />
                  Export
                </Button>
              </div>

              {/* Expense Rows */}
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">No expenses match your filters</p>
                    </CardContent>
                  </Card>
                ) : filtered.map(expense => (
                  <Card key={expense.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">{expense.title}</p>
                            {expense.recurring && (
                              <Badge variant="outline" className="text-xs bg-transparent shrink-0">
                                <RefreshCw className="mr-1 h-3 w-3" />
                                {expense.recurringPeriod}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>Paid to: <span className="font-medium text-foreground">{expense.paidTo}</span></span>
                            <span>{mounted ? new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : expense.date}</span>
                            <span>{paymentMethodLabels[expense.paymentMethod]}</span>
                            {expense.receiptRef && <span className="text-primary">Ref: {expense.receiptRef}</span>}
                          </div>
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{expense.notes}</p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-secondary">${expense.amount.toLocaleString()}</p>
                          <Badge className={`text-xs border-0 ${categoryColors[expense.category]}`}>
                            {expenseCategories.find(c => c.value === expense.category)?.label.split('&')[0].trim()}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Expense Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Stock Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Expense Title *</Label>
                <Input
                  placeholder="e.g. Bulk Flour Order - 50kg bags"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v as ExpenseCategory })}>
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
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Payment Method *</Label>
                  <Select value={newExpense.paymentMethod} onValueChange={(v) => setNewExpense({ ...newExpense, paymentMethod: v })}>
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
                <Input
                  placeholder="e.g. GrainCo Suppliers"
                  value={newExpense.paidTo}
                  onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                />
              </div>

              <div>
                <Label>Receipt / Invoice Reference</Label>
                <Input
                  placeholder="e.g. INV-2026-0234"
                  value={newExpense.receiptRef}
                  onChange={(e) => setNewExpense({ ...newExpense, receiptRef: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="recurring"
                  type="checkbox"
                  checked={newExpense.recurring}
                  onChange={(e) => setNewExpense({ ...newExpense, recurring: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary"
                />
                <Label htmlFor="recurring" className="mb-0">This is a recurring stock expense</Label>
              </div>

              {newExpense.recurring && (
                <div>
                  <Label>Recurring Period</Label>
                  <Select value={newExpense.recurringPeriod} onValueChange={(v) => setNewExpense({ ...newExpense, recurringPeriod: v })}>
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
                <Textarea
                  placeholder="Additional details about this stock expense..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleAddExpense}
                  disabled={!newExpense.title || !newExpense.category || !newExpense.amount || !newExpense.date || !newExpense.paidTo || !newExpense.paymentMethod}
                >
                  Save Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Toast */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-emerald-600 text-white px-5 py-3 shadow-lg animate-in slide-in-from-bottom-5">
            {toast.message}
          </div>
        )}
      </main>
    </div>
  )
}
