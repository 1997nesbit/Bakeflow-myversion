'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/manager/manager-sidebar'
import { Badge } from '@/components/ui/badge'
import { mockOrders, mockExpenses, mockBusinessExpenses, mockStaff, mockCustomers, mockDebts, mockDailyBatches, statusLabels, paymentMethodLabels, type PaymentMethod } from '@/lib/mock-data'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, ChefHat, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'

export default function ReportsPage() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'expenses' | 'staff'>('overview')

  // Revenue
  const totalRevenue = mockOrders.reduce((s, o) => s + o.amountPaid, 0)
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0) + mockBusinessExpenses.reduce((s, e) => s + e.amount, 0)
  const netProfit = totalRevenue - totalExpenses
  const totalDebt = mockDebts.reduce((s, d) => s + d.balance, 0)

  // Order distribution by status
  const statusDistribution = Object.entries(
    mockOrders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: statusLabels[name as keyof typeof statusLabels] || name, value }))

  // Payment methods
  const methodData = Object.entries(
    mockOrders.filter(o => o.paymentMethod).reduce((acc, o) => {
      const m = o.paymentMethod as PaymentMethod
      acc[m] = (acc[m] || 0) + o.amountPaid
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: paymentMethodLabels[name as PaymentMethod] || name, value }))

  // Order type
  const orderTypeData = [
    { name: 'Menu', value: mockOrders.filter(o => o.orderType === 'menu').length },
    { name: 'Custom', value: mockOrders.filter(o => o.orderType === 'custom').length },
  ]

  // Business expense breakdown
  const bizExpenseData = Object.entries(
    mockBusinessExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a, b) => b.value - a.value)

  // Stock expense breakdown
  const stockExpenseData = Object.entries(
    mockExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })).sort((a, b) => b.value - a.value)

  // Staff by role
  const staffByRole = Object.entries(
    mockStaff.filter(s => s.status === 'active').reduce((acc, s) => { acc[s.role] = (acc[s.role] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value }))

  // Production
  const totalBaked = mockDailyBatches.reduce((s, b) => s + b.quantityBaked, 0)
  const totalRemaining = mockDailyBatches.reduce((s, b) => s + b.quantityRemaining, 0)
  const sellThrough = Math.round(((totalBaked - totalRemaining) / totalBaked) * 100)

  const PIE_COLORS = ['#CA0123', '#e66386', '#f89bad', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

  return (
    <div className="min-h-screen bg-[#0f0709]">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-white/40">Business analytics and performance metrics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-white/10 p-0.5 w-fit mb-6">
          {(['overview', 'orders', 'expenses', 'staff'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Revenue', value: `TZS ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Expenses', value: `TZS ${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'Net Profit', value: `TZS ${netProfit.toLocaleString()}`, icon: TrendingUp, color: netProfit >= 0 ? 'text-green-400' : 'text-red-400', bg: netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10' },
                { label: 'Outstanding Debts', value: `TZS ${totalDebt.toLocaleString()}`, icon: Banknote, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Sell-Through', value: `${sellThrough}%`, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.bg}`}><k.icon className={`h-4 w-4 ${k.color}`} /></div>
                  </div>
                  <p className="text-lg font-bold text-white">{k.value}</p>
                  <p className="text-xs text-white/40">{k.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Revenue by Payment Method</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={methodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="value" fill="#CA0123" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Order Type Split</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                      {orderTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {orderTypeData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-xs text-white/50">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Total Orders</p>
                <p className="text-xl font-bold text-white">{mockOrders.length}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Custom Orders</p>
                <p className="text-xl font-bold text-[#e66386]">{mockOrders.filter(o => o.orderType === 'custom').length}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Delivery</p>
                <p className="text-xl font-bold text-blue-400">{mockOrders.filter(o => o.deliveryType === 'delivery').length}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Average Value</p>
                <p className="text-xl font-bold text-white">TZS {Math.round(mockOrders.reduce((s, o) => s + o.totalPrice, 0) / mockOrders.length).toLocaleString()}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Order Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  <Bar dataKey="value" fill="#e66386" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Expenses */}
        {tab === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Business Expenses</p>
                <p className="text-xl font-bold text-white">TZS {mockBusinessExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Stock Expenses</p>
                <p className="text-xl font-bold text-white">TZS {mockExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Total Expenditure</p>
                <p className="text-xl font-bold text-[#e66386]">TZS {totalExpenses.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Business Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bizExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="value" fill="#CA0123" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Stock Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stockExpenseData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                      {stockExpenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                  {stockExpenseData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[10px] text-white/40">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff */}
        {tab === 'staff' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Active Staff</p>
                <p className="text-xl font-bold text-white">{mockStaff.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Monthly Payroll</p>
                <p className="text-xl font-bold text-white">TZS {mockStaff.filter(s => s.status === 'active').reduce((s, m) => s + m.salary, 0).toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Total Customers</p>
                <p className="text-xl font-bold text-white">{mockCustomers.length}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-white/40 mb-1">Gold Customers</p>
                <p className="text-xl font-bold text-amber-400">{mockCustomers.filter(c => c.isGold).length}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Staff by Role</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={staffByRole}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Production Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Total Baked Today</span>
                    <span className="text-sm font-bold text-white">{totalBaked} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Remaining</span>
                    <span className="text-sm font-bold text-white">{totalRemaining} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/50">Sold / Allocated</span>
                    <span className="text-sm font-bold text-green-400">{totalBaked - totalRemaining} units</span>
                  </div>
                  <div className="border-t border-white/5 pt-3">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-white/60 font-medium">Sell-Through Rate</span>
                      <span className="text-sm font-bold text-[#e66386]">{sellThrough}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#CA0123] to-[#e66386]" style={{ width: `${sellThrough}%` }} />
                    </div>
                  </div>
                  <div className="border-t border-white/5 pt-3 space-y-2">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider">By Category</p>
                    {['bread', 'pastry', 'snack'].map(cat => {
                      const items = mockDailyBatches.filter(b => b.category === cat)
                      const baked = items.reduce((s, b) => s + b.quantityBaked, 0)
                      const rem = items.reduce((s, b) => s + b.quantityRemaining, 0)
                      return (
                        <div key={cat} className="flex items-center gap-2">
                          <span className="text-xs text-white/50 w-14 capitalize">{cat}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/5">
                            <div className="h-1.5 rounded-full bg-[#e66386]" style={{ width: `${baked > 0 ? ((baked - rem) / baked * 100) : 0}%` }} />
                          </div>
                          <span className="text-[11px] text-white/40 w-16 text-right">{baked - rem}/{baked}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
