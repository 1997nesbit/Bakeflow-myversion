'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FinancialTransaction, TransactionType, TransactionSummary } from '@/types/finance'
import { financeService } from '@/lib/api/services/finance'
import { handleApiError } from '@/lib/utils/handle-error'
import { TrendingUp, ShoppingBag, CreditCard, Search, ArrowUpRight } from 'lucide-react'

const typeLabels: Partial<Record<TransactionType, string>> = {
  order_payment: 'Order Payment',
  sale:          'Walk-in Sale',
}

const typeBadge: Partial<Record<TransactionType, string>> = {
  order_payment: 'bg-blue-500/20 text-blue-300',
  sale:          'bg-emerald-500/20 text-emerald-300',
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money', card: 'Card', cheque: 'Cheque',
}

export function ManagerRevenue() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    const controller = new AbortController()
    financeService.getTransactions({ direction: 'in', signal: controller.signal })
      .then(res => setTransactions(res.results))
      .catch(handleApiError)
      .finally(() => setLoading(false))
    financeService.getSummary({ direction: 'in', signal: controller.signal })
      .then(setSummary)
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false
    if (search) {
      const q = search.toLowerCase()
      if (!t.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalRevenue  = summary?.total ?? 0
  const orderPayments = summary?.byType?.order_payment?.total ?? 0
  const walkInSales   = summary?.byType?.sale?.total ?? 0
  const filteredTotal = filtered.reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Revenue</h1>
          <p className="text-sm text-white/40">All incoming payments — order settlements and walk-in sales</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-xs text-white/40">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{transactions.length} transactions</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <CreditCard className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-xs text-white/40">Order Payments</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {orderPayments.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{transactions.filter(t => t.type === 'order_payment').length} records</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-xs text-white/40">Walk-in Sales</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {walkInSales.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{transactions.filter(t => t.type === 'sale').length} sales</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search description..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="order_payment">Order Payments</SelectItem>
              <SelectItem value="sale">Walk-in Sales</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-xs text-white/40">
            {filtered.length} records · TZS {filteredTotal.toLocaleString()}
          </div>
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {loading && (
            <p className="text-white/40 text-sm py-8 text-center">Loading revenue data...</p>
          )}
          {!loading && filtered.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] py-12 text-center">
              <ArrowUpRight className="h-8 w-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No revenue records found</p>
            </div>
          )}
          {!loading && filtered.map(t => (
            <div key={t.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
                {t.type === 'sale'
                  ? <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  : <CreditCard className="h-4 w-4 text-blue-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-white truncate">{t.description}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 shrink-0 ${typeBadge[t.type] ?? 'bg-white/10 text-white/60'}`}>
                    {typeLabels[t.type] ?? t.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>{t.date}</span>
                  {t.paymentMethod && <span>{paymentMethodLabels[t.paymentMethod] ?? t.paymentMethod}</span>}
                  <span>by {t.recordedBy}</span>
                </div>
              </div>
              <p className="text-sm font-bold text-green-400 shrink-0">+ TZS {Number(t.amount).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
