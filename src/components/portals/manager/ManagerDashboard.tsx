'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { mockDebts, mockBusinessExpenses, mockExpenses } from '@/data/mock/finance'
import { mockTasks } from '@/data/mock/tasks'
import { mockStaff } from '@/data/mock/staff'
import { mockCustomers } from '@/data/mock/customers'
import { statusColorsDark, priorityColorsDark } from '@/data/constants/labels'
import {
  DollarSign, ShoppingCart, Users, AlertTriangle,
  TrendingUp, ListChecks, Banknote,
  ArrowUpRight, ArrowDownRight, ChefHat,
} from 'lucide-react'
import Link from 'next/link'

export function ManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setOrders(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0)
  const totalOrders = orders.length
  const activeOrders = orders.filter(o => !['delivered', 'pending'].includes(o.status)).length
  const totalDebt = mockDebts.reduce((s, d) => s + d.balance, 0)
  const activeStaff = mockStaff.filter(s => s.status === 'active').length
  const pendingTasks = mockTasks.filter(t => t.status !== 'completed').length
  const goldCustomers = mockCustomers.filter(c => c.isGold).length
  const totalBusinessExpenses = mockBusinessExpenses.reduce((s, e) => s + e.amount, 0)
  const totalStockExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0)

  const stats = [
    { label: 'Revenue', value: `TZS ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', change: '+12%', up: true },
    { label: 'Orders Today', value: totalOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10', change: `${activeOrders} active`, up: true },
    { label: 'Outstanding Debts', value: `TZS ${totalDebt.toLocaleString()}`, icon: Banknote, color: 'text-amber-400', bg: 'bg-amber-500/10', change: `${mockDebts.length} records`, up: false },
    { label: 'Active Staff', value: activeStaff, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', change: `${mockStaff.length} total`, up: true },
  ]

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
  const urgentTasks = mockTasks.filter(t => t.status !== 'completed').sort((a, b) => {
    const pri: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return (pri[a.priority] ?? 3) - (pri[b.priority] ?? 3)
  }).slice(0, 4)

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/40">Overview of your bakery operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${s.up ? 'text-green-400' : 'text-amber-400'}`}>
                  {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.change}
                </div>
              </div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Middle row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Quick links */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'View Debts', href: '/manager/debts', icon: Banknote, color: 'text-amber-400' },
                { label: 'Manage Staff', href: '/manager/users', icon: Users, color: 'text-purple-400' },
                { label: 'Assign Task', href: '/manager/tasks', icon: ListChecks, color: 'text-blue-400' },
                { label: 'Send Bulk Message', href: '/manager/messages', icon: ChefHat, color: 'text-pink-400' },
                { label: 'View Reports', href: '/manager/reports', icon: TrendingUp, color: 'text-green-400' },
              ].map((a) => (
                <Link key={a.label} href={a.href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  <a.icon className={`h-4 w-4 ${a.color}`} />
                  {a.label}
                  <ArrowUpRight className="h-3 w-3 ml-auto text-white/20" />
                </Link>
              ))}
            </div>
          </div>

          {/* Expense summary */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Expense Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Business Expenses</span>
                <span className="text-sm font-bold text-white">TZS {totalBusinessExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/50">Stock Expenses</span>
                <span className="text-sm font-bold text-white">TZS {totalStockExpenses.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                <span className="text-xs text-white/60 font-medium">Total Expenditure</span>
                <span className="text-sm font-bold text-primary">TZS {(totalBusinessExpenses + totalStockExpenses).toLocaleString()}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between items-center">
                <span className="text-xs text-white/60 font-medium">Revenue – Expenses</span>
                <span className={`text-sm font-bold ${totalRevenue - totalBusinessExpenses - totalStockExpenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  TZS {(totalRevenue - totalBusinessExpenses - totalStockExpenses).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs text-white/30 uppercase tracking-wider">Top categories</p>
              {[
                { label: 'Salaries', pct: 65, color: 'bg-purple-500' },
                { label: 'Rent', pct: 20, color: 'bg-blue-500' },
                { label: 'Utilities', pct: 10, color: 'bg-amber-500' },
                { label: 'Other', pct: 5, color: 'bg-gray-500' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="text-xs text-white/50 w-16">{c.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5">
                    <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                  </div>
                  <span className="text-xs text-white/40 w-8 text-right">{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Attention Needed
            </h3>
            <div className="space-y-2">
              {mockDebts.some(d => d.status === 'overdue') && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-xs font-medium text-red-300">{mockDebts.filter(d => d.status === 'overdue').length} overdue debt(s)</p>
                  <p className="text-xs text-red-400/60 mt-0.5">TZS {mockDebts.filter(d => d.status === 'overdue').reduce((s, d) => s + d.balance, 0).toLocaleString()} outstanding</p>
                </div>
              )}
              {pendingTasks > 0 && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <p className="text-xs font-medium text-amber-300">{pendingTasks} pending task(s)</p>
                  <p className="text-xs text-amber-400/60 mt-0.5">Including {mockTasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length} urgent</p>
                </div>
              )}
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                <p className="text-xs font-medium text-blue-300">{goldCustomers} gold customers</p>
                <p className="text-xs text-blue-400/60 mt-0.5">Top spenders in the system</p>
              </div>
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <p className="text-xs font-medium text-green-300">{activeOrders} orders in pipeline</p>
                <p className="text-xs text-green-400/60 mt-0.5">Being processed across portals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Recent orders */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
              <Link href="/manager/payments" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{o.customer.name}</p>
                      <Badge className={`text-xs px-1.5 py-0 border-0 ${statusColorsDark[o.status] || ''}`}>{o.status}</Badge>
                    </div>
                    <p className="text-xs text-white/40 truncate">{o.items.map(i => i.name).join(', ')}</p>
                  </div>
                  <p className="text-sm font-bold text-white shrink-0">TZS {o.totalPrice.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent tasks */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Urgent Tasks</h3>
              <Link href="/manager/tasks" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="space-y-2">
              {urgentTasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/5 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">{t.title}</p>
                      <Badge className={`text-xs px-1.5 py-0 border-0 ${priorityColorsDark[t.priority] || ''}`}>{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-white/40">Assigned to {t.assignedTo} · Due {t.dueDate}</p>
                  </div>
                  <Badge className={`text-xs px-1.5 py-0 border-0 ${t.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    {t.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
