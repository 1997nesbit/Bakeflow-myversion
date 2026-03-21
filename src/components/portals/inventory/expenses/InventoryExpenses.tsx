'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Expense, ExpenseCategory } from '@/types/finance'
import { mockExpenses } from '@/data/mock/finance'
import { expenseCategories } from '@/data/constants/categories'
import { RefreshCw, Receipt, Plus, Lock, Package } from 'lucide-react'
import { ManagerPINGate } from './ManagerPINGate'
import { ExpenseSummaryCards } from './ExpenseSummaryCards'
import { CategoryBreakdown } from './CategoryBreakdown'
import { ExpenseFiltersBar } from './ExpenseFiltersBar'
import { AddExpenseDialog } from './AddExpenseDialog'

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

export function InventoryExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [mounted, setMounted] = useState(false)
  const [isManager, setIsManager] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (sessionStorage.getItem('bbr_manager_expenses_access') === 'granted') setIsManager(true)
  }, [])

  if (!isManager) return <ManagerPINGate onUnlock={() => setIsManager(true)} />

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
  const thisMonth = expenses.filter(e => e.date.startsWith('2026-02')).reduce((s, e) => s + e.amount, 0)
  const lastMonth = expenses.filter(e => e.date.startsWith('2026-01')).reduce((s, e) => s + e.amount, 0)
  const recurringTotal = expenses.filter(e => e.recurring).reduce((s, e) => s + e.amount, 0)

  const categoryBreakdown = expenseCategories.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
    count: expenses.filter(e => e.category === cat.value).length,
  })).filter(c => c.count > 0).sort((a, b) => b.total - a.total)

  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses])
    setShowAddDialog(false)
    toast.success(`Expense "${expense.title}" recorded — TZS ${expense.amount.toFixed(2)}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
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
                <Lock className="mr-1.5 h-3.5 w-3.5" />Lock
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-1.5 h-4 w-4" />Record Expense
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <ExpenseSummaryCards
            thisMonth={thisMonth}
            lastMonth={lastMonth}
            recurringTotal={recurringTotal}
            recurringCount={expenses.filter(e => e.recurring).length}
            totalExpenses={totalExpenses}
            totalCount={expenses.length}
          />

          <div className="grid gap-6 lg:grid-cols-4">
            <CategoryBreakdown
              categoryBreakdown={categoryBreakdown}
              filterCategory={filterCategory}
              totalExpenses={totalExpenses}
              onFilterChange={setFilterCategory}
            />

            <div className="lg:col-span-3 space-y-4">
              <ExpenseFiltersBar
                searchQuery={searchQuery}
                filterCategory={filterCategory}
                filterMonth={filterMonth}
                sortBy={sortBy}
                sortDir={sortDir}
                filteredCount={filtered.length}
                filteredTotal={filtered.reduce((s, e) => s + e.amount, 0)}
                onSearchChange={setSearchQuery}
                onCategoryChange={setFilterCategory}
                onMonthChange={setFilterMonth}
                onSortByChange={setSortBy}
                onSortDirToggle={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              />

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
                          {expense.notes && <p className="text-xs text-muted-foreground mt-1 italic">{expense.notes}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-secondary">TZS {expense.amount.toLocaleString()}</p>
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

        <AddExpenseDialog
          open={showAddDialog}
          expenseCount={expenses.length}
          onOpenChange={setShowAddDialog}
          onAdd={handleAddExpense}
        />
      </main>
    </div>
  )
}
