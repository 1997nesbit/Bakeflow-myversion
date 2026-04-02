'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import type { PaymentMethod } from '@/types/order'
import { mockOrders } from '@/data/mock/orders'
import { mockExpenses, mockBusinessExpenses, mockDebts } from '@/data/mock/finance'
import { mockStaff } from '@/data/mock/staff'
import { mockCustomers } from '@/data/mock/customers'
import { mockDailyBatches } from '@/data/mock/production'
import { statusLabels, paymentMethodLabels } from '@/data/constants/labels'
import { OverviewTab } from './OverviewTab'
import { OrdersTab } from './OrdersTab'
import { ExpensesTab } from './ExpensesTab'
import { StaffTab } from './StaffTab'

// Recharts requires literal hex values — these match --manager-accent and --primary respectively
const PIE_COLORS = ['#CA0123', '#e06080', '#f89bad', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

export function ManagerReports() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'expenses' | 'staff'>('overview')

  const totalRevenue = mockOrders.reduce((s, o) => s + o.amountPaid, 0)
  const bizTotal = mockBusinessExpenses.reduce((s, e) => s + e.amount, 0)
  const stockTotal = mockExpenses.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = bizTotal + stockTotal
  const netProfit = totalRevenue - totalExpenses
  const totalDebt = mockDebts.reduce((s, d) => s + d.balance, 0)

  const statusDistribution = Object.entries(
    mockOrders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: statusLabels[name as keyof typeof statusLabels] || name, value }))

  const methodData = Object.entries(
    mockOrders.filter(o => o.paymentMethod).reduce((acc, o) => {
      const m = o.paymentMethod as PaymentMethod
      acc[m] = (acc[m] || 0) + o.amountPaid
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: paymentMethodLabels[name as PaymentMethod] || name, value }))

  const orderTypeData = [
    { name: 'Menu', value: mockOrders.filter(o => o.orderType === 'menu').length },
    { name: 'Custom', value: mockOrders.filter(o => o.orderType === 'custom').length },
  ]

  const bizExpenseData = Object.entries(
    mockBusinessExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a, b) => b.value - a.value)

  const stockExpenseData = Object.entries(
    mockExpenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })).sort((a, b) => b.value - a.value)

  const staffByRole = Object.entries(
    mockStaff.filter(s => s.status === 'active').reduce((acc, s) => { acc[s.role] = (acc[s.role] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value }))

  const totalBaked = mockDailyBatches.reduce((s, b) => s + b.quantityBaked, 0)
  const totalRemaining = mockDailyBatches.reduce((s, b) => s + b.quantityRemaining, 0)
  const sellThrough = Math.round(((totalBaked - totalRemaining) / totalBaked) * 100)

  const activeStaff = mockStaff.filter(s => s.status === 'active')

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-white/40">Business analytics and performance metrics</p>
        </div>

        <div className="flex gap-1 rounded-lg border border-white/10 p-0.5 w-fit mb-6">
          {(['overview', 'orders', 'expenses', 'staff'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <OverviewTab
            totalRevenue={totalRevenue}
            totalExpenses={totalExpenses}
            netProfit={netProfit}
            totalDebt={totalDebt}
            sellThrough={sellThrough}
            methodData={methodData}
            orderTypeData={orderTypeData}
            pieColors={PIE_COLORS}
          />
        )}
        {tab === 'orders' && (
          <OrdersTab statusDistribution={statusDistribution} />
        )}
        {tab === 'expenses' && (
          <ExpensesTab
            bizExpenseData={bizExpenseData}
            stockExpenseData={stockExpenseData}
            bizTotal={bizTotal}
            stockTotal={stockTotal}
            totalExpenses={totalExpenses}
            pieColors={PIE_COLORS}
          />
        )}
        {tab === 'staff' && (
          <StaffTab
            staffByRole={staffByRole}
            activeStaffCount={activeStaff.length}
            monthlyPayroll={activeStaff.reduce((s, m) => s + m.salary, 0)}
            totalCustomers={mockCustomers.length}
            goldCustomers={mockCustomers.filter(c => c.isGold).length}
            totalBaked={totalBaked}
            totalRemaining={totalRemaining}
            sellThrough={sellThrough}
          />
        )}
      </main>
    </div>
  )
}
