'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'

interface ExpensesTabProps {
  bizExpenseData: { name: string; value: number }[]
  stockExpenseData: { name: string; value: number }[]
  bizTotal: number
  stockTotal: number
  totalExpenses: number
  pieColors: string[]
}

export function ExpensesTab({ bizExpenseData, stockExpenseData, bizTotal, stockTotal, totalExpenses, pieColors }: ExpensesTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Business Expenses</p>
          <p className="text-xl font-bold text-white">TZS {bizTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Stock Expenses</p>
          <p className="text-xl font-bold text-white">TZS {stockTotal.toLocaleString()}</p>
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
                {stockExpenseData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a0a0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
            {stockExpenseData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }} />
                <span className="text-[10px] text-white/40">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
