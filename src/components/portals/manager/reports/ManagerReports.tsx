'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import type { Order, OrderSummary, PaymentMethod } from '@/types/order'
import type { DailyBatchItem } from '@/types/production'
import type { FinancialTransaction, TransactionSummary } from '@/types/finance'
import { mockDebts } from '@/data/mock/finance'
import type { StaffMember } from '@/types/staff'
import { ordersService, productionService } from '@/lib/api/services/orders'
import { staffService } from '@/lib/api/services/staff'
import { customersService } from '@/lib/api/services/customers'
import { financeService } from '@/lib/api/services/finance'
import { handleApiError } from '@/lib/utils/handle-error'
import { statusLabels, paymentMethodLabels } from '@/data/constants/labels'
import { OverviewTab } from './OverviewTab'
import { OrdersTab } from './OrdersTab'
import { ExpensesTab } from './ExpensesTab'
import { StaffTab } from './StaffTab'

// Recharts requires literal hex values — these match --manager-accent and --primary respectively
const PIE_COLORS = ['#CA0123', '#e06080', '#f89bad', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#ec4899']

export function ManagerReports() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'expenses' | 'staff'>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null)
  const [expenseSummary, setExpenseSummary] = useState<TransactionSummary | null>(null)
  const [bizExpenses, setBizExpenses] = useState<FinancialTransaction[]>([])
  const [stockExpenses, setStockExpenses] = useState<FinancialTransaction[]>([])
  const [batches, setBatches] = useState<DailyBatchItem[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [customerCount, setCustomerCount] = useState(0)
  const [goldCustomerCount, setGoldCustomerCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setOrders(res.results))
      .catch(handleApiError)
    ordersService.getSummary({ signal: controller.signal })
      .then(setOrderSummary)
      .catch(handleApiError)
    productionService.getBatches({ signal: controller.signal })
      .then(res => setBatches(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    staffService.getAll({ signal: controller.signal })
      .then(res => setStaff(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    customersService.getAll({ signal: controller.signal })
      .then(res => {
        setCustomerCount(res.results.length)
        setGoldCustomerCount(res.results.filter(c => c.isGold).length)
      })
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    financeService.getSummary({ direction: 'out', signal: controller.signal })
      .then(setExpenseSummary)
      .catch(handleApiError)
    // Transactions still needed for category-level chart breakdown
    financeService.getTransactions({ type: 'business_expense', signal: controller.signal })
      .then(res => setBizExpenses(res.results))
      .catch(handleApiError)
    financeService.getTransactions({ type: 'stock_expense', signal: controller.signal })
      .then(res => setStockExpenses(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const totalRevenue  = orderSummary?.totalRevenue ?? 0
  const bizTotal      = expenseSummary?.byType?.business_expense?.total ?? 0
  const stockTotal    = expenseSummary?.byType?.stock_expense?.total ?? 0
  const totalExpenses = bizTotal + stockTotal
  const netProfit     = totalRevenue - totalExpenses
  const totalDebt     = mockDebts.reduce((s, d) => s + d.balance, 0)

  const statusDistribution = Object.entries(orderSummary?.byStatus ?? {})
    .map(([name, value]) => ({ name: statusLabels[name as keyof typeof statusLabels] || name, value }))

  const methodData = Object.entries(orderSummary?.byPaymentMethod ?? {})
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name: paymentMethodLabels[name as PaymentMethod] || name, value }))

  const orderTypeData = [
    { name: 'Menu', value: orders.filter(o => o.orderType === 'menu').length },
    { name: 'Custom', value: orders.filter(o => o.orderType === 'custom').length },
  ]

  const bizExpenseData = Object.entries(
    bizExpenses.reduce((acc, e) => { if (e.category) acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).sort((a, b) => b.value - a.value)

  const stockExpenseData = Object.entries(
    stockExpenses.reduce((acc, e) => { if (e.category) acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value })).sort((a, b) => b.value - a.value)

  const activeStaff = staff.filter(s => s.status === 'active')

  const staffByRole = Object.entries(
    activeStaff.reduce((acc, s) => { acc[s.role] = (acc[s.role] || 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value }))

  const totalBaked = batches.reduce((s, b) => s + b.quantityBaked, 0)
  const totalRemaining = batches.reduce((s, b) => s + b.quantityRemaining, 0)
  const sellThrough = totalBaked > 0 ? Math.round(((totalBaked - totalRemaining) / totalBaked) * 100) : 0

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
          <OrdersTab statusDistribution={statusDistribution} orders={orders} />
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
            totalCustomers={customerCount}
            goldCustomers={goldCustomerCount}
            totalBaked={totalBaked}
            totalRemaining={totalRemaining}
            sellThrough={sellThrough}
            batches={batches}
          />
        )}
      </main>
    </div>
  )
}
