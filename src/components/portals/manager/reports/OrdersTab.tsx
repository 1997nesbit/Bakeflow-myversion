'use client'

import type { Order } from '@/types/order'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface OrdersTabProps {
  statusDistribution: { name: string; value: number }[]
  orders: Order[]
}

export function OrdersTab({ statusDistribution, orders }: OrdersTabProps) {
  const totalOrders = orders.length
  const customOrders = orders.filter(o => o.orderType === 'custom').length
  const deliveryOrders = orders.filter(o => o.deliveryType === 'delivery').length
  const avgValue = totalOrders > 0 ? Math.round(orders.reduce((s, o) => s + o.totalPrice, 0) / totalOrders) : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Total Orders</p>
          <p className="text-xl font-bold text-white">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Custom Orders</p>
          <p className="text-xl font-bold text-primary">{customOrders}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Delivery</p>
          <p className="text-xl font-bold text-blue-400">{deliveryOrders}</p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <p className="text-xs text-white/40 mb-1">Average Value</p>
          <p className="text-xl font-bold text-white">TZS {avgValue.toLocaleString()}</p>
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
  )
}
