'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { OrderStatus, PaymentMethod } from '@/types/order'
import { mockOrders } from '@/data/mock/orders'
import { statusLabels, paymentMethodLabels } from '@/data/constants/labels'
import { CreditCard, Search, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

export function ManagerPayments() {
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')

  const orders = [...mockOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const filtered = orders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
    const matchPay = filterPayment === 'all' || o.paymentStatus === filterPayment
    const matchMethod = filterMethod === 'all' || o.paymentMethod === filterMethod
    return matchSearch && matchPay && matchMethod
  })

  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0)
  const totalPending = orders.reduce((s, o) => s + (o.totalPrice - o.amountPaid), 0)
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length
  const unpaidOrders = orders.filter(o => o.paymentStatus === 'unpaid').length

  const payStatusStyle: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-300', deposit: 'bg-amber-500/20 text-amber-300', unpaid: 'bg-red-500/20 text-red-300',
  }

  const orderStatusStyle: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300', paid: 'bg-green-500/20 text-green-300',
    baker: 'bg-orange-500/20 text-orange-300', decorator: 'bg-pink-500/20 text-pink-300',
    quality: 'bg-blue-500/20 text-blue-300', packing: 'bg-indigo-500/20 text-indigo-300',
    ready: 'bg-emerald-500/20 text-emerald-300', dispatched: 'bg-purple-500/20 text-purple-300',
    delivered: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <div className="min-h-screen bg-[#0f0709]">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-sm text-white/40">All order payments and transaction history</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10"><DollarSign className="h-4 w-4 text-green-400" /></div>
              <span className="text-xs text-white/40">Total Received</span>
            </div>
            <p className="text-xl font-bold text-white">TZS {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10"><Clock className="h-4 w-4 text-amber-400" /></div>
              <span className="text-xs text-white/40">Pending Collection</span>
            </div>
            <p className="text-xl font-bold text-amber-400">TZS {totalPending.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10"><CheckCircle2 className="h-4 w-4 text-green-400" /></div>
              <span className="text-xs text-white/40">Fully Paid</span>
            </div>
            <p className="text-xl font-bold text-green-400">{paidOrders}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10"><AlertCircle className="h-4 w-4 text-red-400" /></div>
              <span className="text-xs text-white/40">Unpaid</span>
            </div>
            <p className="text-xl font-bold text-red-400">{unpaidOrders}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or order ID..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Payment status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Payment method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {(Object.entries(paymentMethodLabels) as [PaymentMethod, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment list */}
        <div className="space-y-2">
          {filtered.map((o) => (
            <div key={o.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white truncate">{o.customerName}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${payStatusStyle[o.paymentStatus]}`}>{o.paymentStatus}</Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${orderStatusStyle[o.status]}`}>{statusLabels[o.status]}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>{o.id}</span>
                  <span>{o.items.map(i => i.name).join(', ')}</span>
                  {o.paymentMethod && <span>{paymentMethodLabels[o.paymentMethod]}</span>}
                  <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-white">TZS {o.totalPrice.toLocaleString()}</p>
                {o.amountPaid < o.totalPrice && (
                  <p className="text-[11px] text-amber-400">Paid: TZS {o.amountPaid.toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
