'use client'

import { DollarSign, TrendingDown, TrendingUp, Banknote, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'

interface OverviewTabProps {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  totalDebt: number
  sellThrough: number
  methodData: { name: string; value: number }[]
  orderTypeData: { name: string; value: number }[]
  pieColors: string[]
}

export function OverviewTab({ totalRevenue, totalExpenses, netProfit, totalDebt, sellThrough, methodData, orderTypeData, pieColors }: OverviewTabProps) {
  const kpis = [
    { label: 'Revenue', value: `TZS ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Expenses', value: `TZS ${totalExpenses.toLocaleString()}`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Net Profit', value: `TZS ${netProfit.toLocaleString()}`, icon: TrendingUp, color: netProfit >= 0 ? 'text-green-400' : 'text-red-400', bg: netProfit >= 0 ? 'bg-green-500/10' : 'bg-red-500/10' },
    { label: 'Outstanding Debts', value: `TZS ${totalDebt.toLocaleString()}`, icon: Banknote, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Sell-Through', value: `${sellThrough}%`, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${k.bg}`}><k.icon className={`h-4 w-4 ${k.color}`} /></div>
            </div>
            <p className="text-lg font-bold text-white">{k.value}</p>
            <p className="text-xs text-white/40">{k.label}</p>
          </div>
        ))}
      </div>

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
                {orderTypeData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {orderTypeData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[i] }} />
                <span className="text-xs text-white/50">{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
