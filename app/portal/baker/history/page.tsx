'use client'

import { useState } from 'react'
import { BakerSidebar } from '@/components/baker/baker-sidebar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'

export default function BakerHistoryPage() {
  const [query, setQuery] = useState('')

  // Orders that have passed through the baker stage
  const completedOrders = mockOrders.filter((o) =>
    ['decorator', 'quality', 'packing', 'ready', 'dispatched', 'delivered'].includes(o.status)
  )

  const filtered = completedOrders.filter(
    (o) =>
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase()) ||
      o.items.some((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  )

  const todayStr = '2026-02-06'
  const todayCompleted = filtered.filter(
    (o) => o.postedToBakerAt?.startsWith(todayStr)
  )
  const olderCompleted = filtered.filter(
    (o) => !o.postedToBakerAt?.startsWith(todayStr)
  )

  const totalCustom = completedOrders.filter((o) => o.orderType === 'custom').length
  const totalMenu = completedOrders.filter((o) => o.orderType === 'menu').length
  const avgTime = completedOrders.length > 0
    ? Math.round(completedOrders.reduce((s, o) => s + o.estimatedMinutes, 0) / completedOrders.length)
    : 0

  return (
    <div className="min-h-screen bg-amber-50/40">
      <BakerSidebar />
      <main className="ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
            <History className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Baking History</h1>
            <p className="text-sm text-muted-foreground">
              {completedOrders.length} orders completed through kitchen
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
                <p className="text-xs text-muted-foreground">Total Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
                <Cake className="h-5 w-5 text-pink-600" />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCustom} / {totalMenu}</p>
                <p className="text-xs text-muted-foreground">Custom / Menu</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </span>
              <div>
                <p className="text-2xl font-bold text-foreground">{avgTime}m</p>
                <p className="text-xs text-muted-foreground">Avg Est. Time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, customer, or item..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Today */}
        {todayCompleted.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today</h2>
            <div className="space-y-2">
              {todayCompleted.map((order) => (
                <Card key={order.id} className="border-0 shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 shrink-0">
                        {order.orderType === 'custom' ? (
                          <Cake className="h-5 w-5 text-amber-700" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-amber-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <Badge variant="outline" className="text-xs bg-transparent">
                            {orderTypeLabels[order.orderType]}
                          </Badge>
                          <Badge className={`text-xs border-0 ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {item.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {order.estimatedMinutes}m est.
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {order.pickupTime}
                        </div>
                      </div>
                    </div>
                    {order.specialNotes && (
                      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border">
                        <FileText className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground">{order.specialNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Earlier */}
        {olderCompleted.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Earlier</h2>
            <div className="space-y-2">
              {olderCompleted.map((order) => (
                <Card key={order.id} className="border-0 shadow-sm bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
                        {order.orderType === 'custom' ? (
                          <Cake className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <Badge variant="outline" className="text-xs bg-transparent">
                            {orderTypeLabels[order.orderType]}
                          </Badge>
                          <Badge className={`text-xs border-0 ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              {item.name} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {order.estimatedMinutes}m est.
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {order.pickupDate}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No matching orders found</p>
          </div>
        )}
      </main>
    </div>
  )
}
