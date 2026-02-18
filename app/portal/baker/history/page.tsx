'use client'

import { useState } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { mockOrders, statusLabels, statusColors, orderTypeLabels } from '@/lib/mock-data'
import {
  History,
  Search,
  Clock,
  Calendar,
  Cake,
  CheckCircle,
  TrendingUp,
  FileText,
  Palette,
} from 'lucide-react'

export default function BakerHistoryPage() {
  const [query, setQuery] = useState('')

  const completedOrders = mockOrders.filter((o) =>
    ['decorator', 'packing', 'ready', 'dispatched', 'delivered'].includes(o.status)
  )

  const filtered = completedOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.items.some((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  )

  const totalCustom = completedOrders.filter((o) => o.orderType === 'custom').length
  const totalMenu = completedOrders.filter((o) => o.orderType === 'menu').length
  const avgTime = completedOrders.length > 0
    ? Math.round(completedOrders.reduce((s, o) => s + o.estimatedMinutes, 0) / completedOrders.length)
    : 0

  return (
    <div className="min-h-screen" style={{ background: '#fdf2f4' }}>
      <BakerSidebar />
      <main className="ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
            <History className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Baking History</h1>
            <p className="text-sm text-muted-foreground">
              {completedOrders.length} orders completed through kitchen
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#fce7ea' }}>
                <CheckCircle className="h-5 w-5" style={{ color: '#CA0123' }} />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
                <p className="text-xs text-muted-foreground">Sent to Decorator</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#fce7ea' }}>
                <Cake className="h-5 w-5" style={{ color: '#e66386' }} />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCustom} / {totalMenu}</p>
                <p className="text-xs text-muted-foreground">Custom / Menu</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#fce7ea' }}>
                <TrendingUp className="h-5 w-5" style={{ color: '#CA0123' }} />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgTime}m</p>
                <p className="text-xs text-muted-foreground">Avg Bake Time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order ID, customer, or item..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10 h-11" />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No matching orders found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((order) => (
              <Card key={order.id} className="border-0 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                      style={{ background: order.orderType === 'custom' ? '#fce7ea' : '#fdf2f4' }}
                    >
                      {order.orderType === 'custom' ? (
                        <Cake className="h-5 w-5" style={{ color: '#e66386' }} />
                      ) : (
                        <CheckCircle className="h-5 w-5" style={{ color: '#CA0123' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{order.id}</p>
                        <Badge variant="outline" className="text-[10px] bg-transparent">{orderTypeLabels[order.orderType]}</Badge>
                        <Badge className={`text-[10px] border-0 ${statusColors[order.status]}`}>{statusLabels[order.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Clock className="h-3 w-3" />
                        {order.estimatedMinutes}m est.
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Calendar className="h-3 w-3" />
                        {order.pickupDate}
                      </div>
                      <div className="flex items-center gap-1 text-xs justify-end" style={{ color: '#e66386' }}>
                        <Palette className="h-3 w-3" />
                        Sent to Decorator
                      </div>
                    </div>
                  </div>
                  {order.specialNotes && (
                    <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border">
                      <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: '#e66386' }} />
                      <p className="text-xs text-muted-foreground">{order.specialNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
