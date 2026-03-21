'use client'

import { useState, useEffect } from 'react'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { InventoryItem } from '@/types/inventory'
import { mockInventory, mockStockEntries, mockDailyRollouts, mockSuppliers } from '@/data/mock/inventory'
import { Package, TrendingDown, PackagePlus, ScrollText, ArrowRight, DollarSign, BarChart3, Truck } from 'lucide-react'
import { CriticalStockAlert } from './CriticalStockAlert'
import { StockLevelGrid } from './StockLevelGrid'

export function InventoryDashboard() {
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
                  <PackagePlus className="mr-1.5 h-4 w-4" />Add Stock
                </Button>
              </Link>
              <Link href="/inventory/rollout">
                <Button size="sm" variant="outline" className="bg-transparent">
                  <ScrollText className="mr-1.5 h-4 w-4" />Rollout
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <CriticalStockAlert criticalStock={criticalStock} />

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
                <p className="text-xs text-muted-foreground mt-1">{healthyStock.length} healthy, {lowStock.length} low</p>
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
                <p className="text-xs text-red-600 mt-1">{criticalStock.length} critical</p>
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
                <p className="text-2xl font-bold text-foreground">TZS {totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Total inventory value</p>
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
                <p className="text-xs text-muted-foreground mt-1">TZS {todayRolloutValue.toLocaleString()} value used</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <StockLevelGrid inventory={inventory} />

            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Today&apos;s Rollout</CardTitle>
                    <Link href="/inventory/rollout">
                      <Button size="sm" variant="ghost" className="text-xs h-7">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
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

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Stock-In</CardTitle>
                    <Link href="/inventory/stock-in">
                      <Button size="sm" variant="ghost" className="text-xs h-7">View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
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
                          <p className="text-xs text-muted-foreground">TZS {entry.totalCost.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                            <Truck className="mr-1 h-3 w-3" />Call
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
