'use client'

import { mockDailyBatches } from '@/data/mock/production'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface StaffTabProps {
  staffByRole: { name: string; value: number }[]
  activeStaffCount: number
  monthlyPayroll: number
  totalCustomers: number
  goldCustomers: number
  totalBaked: number
  totalRemaining: number
  sellThrough: number
}

export function StaffTab({ staffByRole, activeStaffCount, monthlyPayroll, totalCustomers, goldCustomers, totalBaked, totalRemaining, sellThrough }: StaffTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Active Staff</p>
          <p className="text-xl font-bold text-white">{activeStaffCount}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Monthly Payroll</p>
          <p className="text-xl font-bold text-white">TZS {monthlyPayroll.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Total Customers</p>
          <p className="text-xl font-bold text-white">{totalCustomers}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Gold Customers</p>
          <p className="text-xl font-bold text-amber-400">{goldCustomers}</p>
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
                <span className="text-sm font-bold text-primary">{sellThrough}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-2 rounded-full bg-gradient-to-r from-manager-accent to-primary" style={{ width: `${sellThrough}%` }} />
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
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${baked > 0 ? ((baked - rem) / baked * 100) : 0}%` }} />
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
  )
}
