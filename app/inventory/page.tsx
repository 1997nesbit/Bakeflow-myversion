'use client'

import { useState, useEffect } from 'react'
import { InventorySidebar } from '@/components/inventory/inventory-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  mockInventory,
  mockStockEntries,
  mockDailyRollouts,
  mockSuppliers,
  type InventoryItem,
} from '@/lib/mock-data'
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  PackagePlus,
  ScrollText,
  ArrowRight,
  DollarSign,
  BarChart3,
  Truck,
} from 'lucide-react'

export default function InventoryDashboard() {
  const [inventory] = useState<InventoryItem[]>(mockInventory)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const lowStock = inventory.filter(i => i.quantity <= i.minStock)
  const criticalStock = inventory.filter(i => i.quantity < i.minStock * 0.5)
  const healthyStock = inventory.filter(i => i.quantity > i.minStock)
  const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0)
  const todayRollouts = mockDailyRollouts.filter(r => r.date === '2026-02-06')
  const todayRolloutValue = todayRollouts.reduce((sum, r) => {
    const item = inventory.find(i => i.id === r.inventoryItemId)
    return sum + r.quantity * (item?.costPerUnit || 0)
  }, 0)
  const recentEntries = mockStockEntries.slice(-3).reverse()

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Inventory Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {mounted ? new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '\u00A0'}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/inventory/stock-in">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PackagePlus className="mr-1.5 h-4 w-4" />
                  Add Stock
                </Button>
              </Link>
              <Link href="/inventory/rollout">
                <Button size="sm" variant="outline" className="bg-transparent">
                  <ScrollText className="mr-1.5 h-4 w-4" />
                  Rollout
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Critical alerts */}
          {criticalStock.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="font-semibold text-red-800">
                  {criticalStock.length} item{criticalStock.length > 1 ? 's' : ''} critically low
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {criticalStock.map(item => (
                  <Badge key={item.id} className="bg-red-100 text-red-800 border-0">
                    {item.name}: {item.quantity} {item.unit} (min {item.minStock})
                  </Badge>
                ))}
              </div>
              <Link href="/inventory/alerts" className="inline-block mt-2">
                <Button size="sm" variant="link" className="text-red-700 p-0 h-auto">
                  View alerts & reorder <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthyStock.length} healthy, {lowStock.length} low
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{lowStock.length}</p>
                <p className="text-xs text-red-600 mt-1">
                  {criticalStock.length} critical
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                </div>
                <p className="text-2xl font-bold text-foreground">${totalValue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total inventory value
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Today Rollout</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{todayRollouts.length} items</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ${todayRolloutValue.toFixed(2)} value used
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Two column layout */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Stock levels - wider column */}
            <Card className="border-0 shadow-sm lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Stock Levels</CardTitle>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" /> Critical
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Low
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthy
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {inventory.map(item => {
                  const pct = Math.min((item.quantity / (item.minStock * 2)) * 100, 100)
                  const ratio = item.quantity / item.minStock
                  const color = ratio < 0.5 ? 'bg-red-500' : ratio < 1 ? 'bg-amber-500' : 'bg-emerald-500'
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <p className="w-36 text-sm font-medium text-foreground truncate">{item.name}</p>
                      <div className="flex-1">
                        <div className="h-2.5 w-full rounded-full bg-muted">
                          <div
                            className={`h-2.5 rounded-full ${color} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <p className="w-20 text-right text-xs text-muted-foreground">
                        {item.quantity} / {item.minStock * 2} {item.unit}
                      </p>
                      {ratio < 1 && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's rollout */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Today&apos;s Rollout</CardTitle>
                    <Link href="/inventory/rollout">
                      <Button size="sm" variant="ghost" className="text-xs h-7">
                        View all <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {todayRollouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No rollouts today</p>
                  ) : (
                    <div className="space-y-2.5">
                      {todayRollouts.map(r => (
                        <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-foreground">{r.itemName}</p>
                            <p className="text-xs text-muted-foreground">{r.purpose}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-secondary">{r.quantity} {r.unit}</p>
                            <p className="text-xs text-muted-foreground">{r.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent stock-in */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Stock-In</CardTitle>
                    <Link href="/inventory/stock-in">
                      <Button size="sm" variant="ghost" className="text-xs h-7">
                        View all <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {recentEntries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{entry.itemName}</p>
                          <p className="text-xs text-muted-foreground">{entry.supplierName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-600">+{entry.quantity} {entry.unit}</p>
                          <p className="text-xs text-muted-foreground">${entry.totalCost.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suppliers */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {mockSuppliers.map(s => (
                      <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.products.length} products</p>
                        </div>
                        <a href={`tel:${s.phone}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                            <Truck className="mr-1 h-3 w-3" />
                            Call
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
