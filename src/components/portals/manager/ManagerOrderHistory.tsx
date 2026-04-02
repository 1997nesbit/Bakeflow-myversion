'use client'

import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import type { Order } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { paymentMethodLabels } from '@/data/constants/labels'
import { History, Search, Package, Clock, Calendar, User, MapPin, CreditCard, Truck, ShoppingBag, Cake, ChefHat } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'

const statusLabels: Record<string, string> = {
  pending: 'Pending', paid: 'Paid', baker: 'In Kitchen', quality: 'Quality Check',
  decorator: 'Decorating', packing: 'Packing', ready: 'Ready', dispatched: 'Dispatched',
  delivered: 'Delivered', completed: 'Completed',
}
const statusColor: Record<string, string> = {
  pending: 'bg-gray-500/20 text-gray-400', paid: 'bg-green-500/20 text-green-300',
  baker: 'bg-orange-500/20 text-orange-300', quality: 'bg-blue-500/20 text-blue-300',
  decorator: 'bg-purple-500/20 text-purple-300', packing: 'bg-cyan-500/20 text-cyan-300',
  ready: 'bg-emerald-500/20 text-emerald-300', dispatched: 'bg-amber-500/20 text-amber-300',
  delivered: 'bg-green-500/20 text-green-300', completed: 'bg-green-500/20 text-green-300',
}
const payColor: Record<string, string> = {
  paid: 'bg-green-500/20 text-green-300', deposit: 'bg-amber-500/20 text-amber-300', unpaid: 'bg-red-500/20 text-red-300',
}

export function ManagerOrderHistory() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'menu' | 'custom'>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [allOrders, setAllOrders] = useState<Order[]>([])

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setAllOrders([...res.results].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const filtered = useMemo(() =>
    allOrders.filter(o => {
      if (typeFilter !== 'all' && o.orderType !== typeFilter) return false
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return o.id.toLowerCase().includes(q) ||
          o.trackingId.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      }
      return true
    }),
    [allOrders, search, typeFilter, statusFilter]
  )

  const totalRevenue = allOrders.reduce((s, o) => s + o.amountPaid, 0)
  const totalOutstanding = allOrders.reduce((s, o) => s + (o.totalPrice - o.amountPaid), 0)

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Order History</h1>
          <p className="text-sm text-white/40">Full timeline of all customer orders</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Total Orders</p>
            <p className="text-xl font-bold text-white">{allOrders.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Revenue Collected</p>
            <p className="text-xl font-bold text-green-400">TZS {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Outstanding</p>
            <p className="text-xl font-bold text-amber-400">TZS {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Custom Cakes</p>
            <p className="text-xl font-bold text-primary">{allOrders.filter(o => o.orderType === 'custom').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID, tracking, customer..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'menu', 'custom'] as const).map(t => (
              <button key={t} type="button" onClick={() => setTypeFilter(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === t ? 'bg-manager-accent text-white' : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
                {t === 'all' ? 'All Types' : t === 'menu' ? 'Menu' : 'Custom'}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {['all', 'pending', 'paid', 'baker', 'ready', 'dispatched'].map(s => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === s ? 'bg-manager-accent text-white' : 'bg-white/5 text-white/50 hover:text-white/80'}`}>
                {s === 'all' ? 'All Status' : statusLabels[s] || s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-white/30 mb-3">{filtered.length} order{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Order Timeline */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/20">
              <Package className="h-10 w-10 mb-3" />
              <p className="text-sm">No orders match your filters</p>
            </div>
          )}
          {filtered.map((order) => (
            <div key={order.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="mt-0.5 shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  {order.orderType === 'custom' ? <Cake className="h-4 w-4 text-primary" /> : <ShoppingBag className="h-4 w-4 text-white/40" />}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-white">{order.id}</span>
                    <span className="text-xs font-mono text-white/30">{order.trackingId}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statusColor[order.status]}`}>{statusLabels[order.status] || order.status}</Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${payColor[order.paymentStatus]}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'deposit' ? 'Deposit' : 'Unpaid'}
                    </Badge>
                    {order.orderType === 'custom' && <Badge className="text-[10px] px-1.5 py-0 border-0 bg-manager-accent/20 text-primary">Custom</Badge>}
                    {order.customer.isGold && <Badge className="text-[10px] px-1.5 py-0 border-0 bg-yellow-500/20 text-yellow-300">Gold</Badge>}
                  </div>

                  {/* Items */}
                  <p className="text-xs text-white/60 mb-1.5 truncate">
                    {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-[11px] text-white/30 flex-wrap">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.customer.name}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                    <span className="flex items-center gap-1">
                      {order.deliveryType === 'delivery' ? <Truck className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                      {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
                    </span>
                    {order.paymentMethod && (
                      <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" />{paymentMethodLabels[order.paymentMethod]}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">TZS {order.totalPrice.toLocaleString()}</p>
                  {order.amountPaid < order.totalPrice && (
                    <p className="text-[11px] text-amber-400">Paid: TZS {order.amountPaid.toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
