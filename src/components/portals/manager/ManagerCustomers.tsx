'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CustomerRecord } from '@/types/customer'
import { customersService } from '@/lib/api/services/customers'
import { handleApiError } from '@/lib/utils/handle-error'
import { toast } from 'sonner'
import { Search, Phone, ShoppingCart, Star, StarOff, Calendar } from 'lucide-react'

export function ManagerCustomers() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterGold, setFilterGold] = useState<'all' | 'gold' | 'regular'>('all')
  const [viewCustomer, setViewCustomer] = useState<CustomerRecord | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    customersService.getAll({ signal: controller.signal })
      .then(res => setCustomers(res.results))
      .catch(handleApiError)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    const matchGold = filterGold === 'all' || (filterGold === 'gold' ? c.isGold : !c.isGold)
    return matchSearch && matchGold
  }).sort((a, b) => b.totalSpent - a.totalSpent)

  const goldCount = customers.filter(c => c.isGold).length
  const totalSpentAll = customers.reduce((s, c) => s + c.totalSpent, 0)
  const avgOrderValue = customers.reduce((s, c) => s + (c.totalOrders > 0 ? c.totalSpent / c.totalOrders : 0), 0) / (customers.length || 1)

  const toggleGold = async (id: string) => {
    const customer = customers.find(c => c.id === id)
    if (!customer) return
    const prev = customers
    const newIsGold = !customer.isGold
    setCustomers(customers.map(c => c.id === id ? { ...c, isGold: newIsGold } : c))
    try {
      await customersService.update(id, { isGold: newIsGold })
      toast.success(newIsGold ? 'Customer marked as Gold.' : 'Gold status removed.')
    } catch (err) {
      setCustomers(prev)
      handleApiError(err)
    }
  }

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-white/40">{customers.length} customers, {goldCount} gold members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Total Customers</p>
            <p className="text-xl font-bold text-white">{customers.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Gold Members</p>
            <p className="text-xl font-bold text-amber-400">{goldCount}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-white">TZS {totalSpentAll.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Avg Order Value</p>
            <p className="text-xl font-bold text-white">TZS {Math.round(avgOrderValue).toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
            {(['all', 'gold', 'regular'] as const).map(f => {
            let label: string
            if (f === 'all') label = 'All'
            else if (f === 'gold') label = 'Gold'
            else label = 'Regular'
            return (
              <button key={f} type="button" onClick={() => setFilterGold(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${filterGold === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                {label}
              </button>
            )
          })}
          </div>
        </div>

        {/* Customer list */}
        {loading ? (
          <div className="text-center py-16 text-white/30 text-sm">Loading customers...</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-4 w-full text-left rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors"
                onClick={() => setViewCustomer(c)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setViewCustomer(c) }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 shrink-0 text-sm font-bold text-white/50">
                  {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                    {c.isGold && <Badge className="text-[10px] px-1.5 py-0 border-0 bg-amber-500/20 text-amber-300">Gold</Badge>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/30 mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>
                    <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />{c.totalOrders} orders</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Last: {c.lastOrderDate}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">TZS {c.totalSpent.toLocaleString()}</p>
                  <p className="text-[11px] text-white/30">lifetime</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); void toggleGold(c.id) }} className="p-2 rounded-lg text-white/30 hover:bg-white/5 shrink-0">
                  {c.isGold ? <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> : <StarOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
          <DialogContent className="bg-manager-card border-white/10 text-white sm:max-w-sm">
            <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
            {viewCustomer && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-lg font-bold text-white/50">
                    {viewCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{viewCustomer.name}</p>
                    {viewCustomer.isGold && <Badge className="text-[10px] px-1.5 py-0 border-0 bg-amber-500/20 text-amber-300">Gold Customer</Badge>}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/40">Phone</span><span className="text-white">{viewCustomer.phone}</span></div>
                  {viewCustomer.email && <div className="flex justify-between"><span className="text-white/40">Email</span><span className="text-white">{viewCustomer.email}</span></div>}
                  <div className="flex justify-between"><span className="text-white/40">Total Orders</span><span className="text-white font-medium">{viewCustomer.totalOrders}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Total Spent</span><span className="text-white font-bold">TZS {viewCustomer.totalSpent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Last Order</span><span className="text-white">{viewCustomer.lastOrderDate}</span></div>
                  {viewCustomer.notes && (
                    <div className="rounded-lg bg-white/5 p-3 mt-2">
                      <p className="text-xs text-white/40 mb-1">Notes</p>
                      <p className="text-sm text-white/70">{viewCustomer.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
