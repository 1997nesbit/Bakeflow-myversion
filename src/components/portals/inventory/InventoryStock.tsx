'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { InventoryItem } from '@/types/inventory'
import { inventoryService } from '@/lib/api/services/inventory'
import { handleApiError } from '@/lib/utils/handle-error'
import {
  Package, Search, AlertTriangle, AlertOctagon,
  PackagePlus, Phone, Mail, CheckCircle, TrendingUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'all' | 'low' | 'critical'

function getHealth(item: InventoryItem): { label: string; color: string; barColor: string; tab: Tab } {
  const ratio = item.quantity / item.minStock
  if (ratio < 0.5)  return { label: 'Critical', color: 'bg-red-100 text-red-800',     barColor: 'bg-red-500',     tab: 'critical' }
  if (ratio <= 1)   return { label: 'Low',      color: 'bg-amber-100 text-amber-800', barColor: 'bg-amber-500',   tab: 'low' }
  return               { label: 'Healthy',   color: 'bg-emerald-100 text-emerald-800', barColor: 'bg-emerald-500', tab: 'all' }
}

// ─── Item row ─────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: InventoryItem
  reorderSent: Set<string>
  onReorder: (item: InventoryItem) => void
  onQuickRestock: (item: InventoryItem) => void
}

function ItemRow({ item, reorderSent, onReorder, onQuickRestock }: ItemRowProps) {
  const health = getHealth(item)
  const pct = Math.min((item.quantity / (item.minStock * 2)) * 100, 100)
  const isAlert = health.tab !== 'all'
  const suggestedQty = Math.ceil(item.minStock * 2 - item.quantity)

  return (
    <div className={`rounded-xl border bg-white shadow-sm p-4 ${isAlert ? 'border-l-4 ' + (health.tab === 'critical' ? 'border-l-red-500 border-red-100' : 'border-l-amber-500 border-amber-100') : 'border-border'}`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${isAlert ? (health.tab === 'critical' ? 'bg-red-100' : 'bg-amber-100') : 'bg-primary/10'}`}>
          {health.tab === 'critical'
            ? <AlertOctagon className="h-5 w-5 text-red-600" />
            : health.tab === 'low'
              ? <AlertTriangle className="h-5 w-5 text-amber-600" />
              : <Package className="h-5 w-5 text-primary" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground truncate">{item.name}</p>
            <Badge className={`text-xs border-0 shrink-0 ${health.color}`}>{health.label}</Badge>
            <span className="text-xs text-muted-foreground shrink-0">{item.category}</span>
          </div>

          {/* Stock bar */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 rounded-full bg-muted">
              <div className={`h-2 rounded-full transition-all ${health.barColor}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {item.quantity} / {item.minStock * 2} {item.unit}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Min stock: <span className="font-medium text-foreground">{item.minStock} {item.unit}</span></span>
            <span>Cost/unit: <span className="font-medium text-foreground">TZS {item.costPerUnit.toLocaleString()}</span></span>
            {item.supplier && (
              <span>Supplier: <span className="font-medium text-foreground">{item.supplier.name}</span></span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-7 text-xs"
            onClick={() => onQuickRestock(item)}
          >
            <PackagePlus className="mr-1 h-3.5 w-3.5" />
            Quick Add
          </Button>

          {item.supplier && (
            <div className="flex gap-1">
              <a href={`tel:${item.supplier.phone}`}>
                <Button size="sm" variant="outline" className="bg-transparent h-7 text-xs flex-1">
                  <Phone className="h-3 w-3 mr-1" />Call
                </Button>
              </a>
              <a href={`mailto:?subject=Reorder: ${item.name}&body=Please supply ${suggestedQty} ${item.unit} of ${item.name}.`}>
                {reorderSent.has(item.id) ? (
                  <Button size="sm" disabled className="bg-emerald-100 text-emerald-800 border-0 h-7 text-xs flex-1">
                    <CheckCircle className="h-3 w-3 mr-1" />Sent
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="bg-transparent h-7 text-xs flex-1" onClick={() => onReorder(item)}>
                    <Mail className="h-3 w-3 mr-1" />Reorder
                  </Button>
                )}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InventoryStock() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [reorderSent, setReorderSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController()
    inventoryService.getAll({ signal: controller.signal })
      .then(res => setInventory(res.results))
      .catch(handleApiError)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const criticalItems  = inventory.filter(i => i.quantity < i.minStock * 0.5)
  const lowItems       = inventory.filter(i => i.quantity >= i.minStock * 0.5 && i.quantity <= i.minStock)
  const categories     = [...new Set(inventory.map(i => i.category))].sort()

  const tabFiltered = tab === 'critical'
    ? criticalItems
    : tab === 'low'
      ? lowItems
      : inventory

  const displayed = tabFiltered.filter(i => {
    if (filterCat !== 'all' && i.category !== filterCat) return false
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleReorder = (item: InventoryItem) => {
    setReorderSent(prev => new Set(prev).add(item.id))
    toast.success(`Reorder email opened for ${item.name}.`)
  }

  const handleQuickRestock = async (item: InventoryItem) => {
    const qty = Math.ceil(item.minStock * 2 - item.quantity)
    try {
      await inventoryService.recordStockIn({
        inventoryItem: item.id,
        quantity: qty,
        costPerUnit: item.costPerUnit,
        supplierName: item.supplier?.name ?? 'Unknown',
        date: new Date().toISOString().split('T')[0],
      })
      toast.success(`Added ${qty} ${item.unit} to ${item.name}.`)
      const res = await inventoryService.getAll()
      setInventory(res.results)
    } catch (err) {
      handleApiError(err)
    }
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'all',      label: 'All',      count: inventory.length },
    { key: 'low',      label: 'Low',      count: lowItems.length },
    { key: 'critical', label: 'Critical', count: criticalItems.length },
  ]

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Stock</h1>
              <p className="text-xs text-muted-foreground">Current quantities, health, and reorder status</p>
            </div>
            <div className="flex gap-2">
              {criticalItems.length > 0 && (
                <Badge className="bg-red-100 text-red-800 border-0 text-xs px-2.5 py-1">
                  <AlertOctagon className="mr-1 h-3 w-3" />
                  {criticalItems.length} Critical
                </Badge>
              )}
              {lowItems.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border-0 text-xs px-2.5 py-1">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {lowItems.length} Low
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Tab bar + filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-lg border border-border p-0.5 gap-0.5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    tab === t.key
                      ? t.key === 'critical'
                        ? 'bg-red-500 text-white'
                        : t.key === 'low'
                          ? 'bg-amber-500 text-white'
                          : 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                  {t.count !== undefined && (
                    <span className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
                      tab === t.key ? 'bg-white/20' : 'bg-muted'
                    }`}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search items..."
                className="pl-8 h-8 text-xs w-48"
              />
            </div>

            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <span className="ml-auto text-xs text-muted-foreground">{displayed.length} items</span>
          </div>

          {/* Item list */}
          {loading && (
            <p className="text-muted-foreground text-sm py-8 text-center">Loading stock...</p>
          )}

          {!loading && displayed.length === 0 && (
            <div className="py-16 text-center">
              <TrendingUp className="h-10 w-10 text-emerald-500/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {tab === 'critical' ? 'No critical items.' : tab === 'low' ? 'No low-stock items.' : 'No items match your filters.'}
              </p>
            </div>
          )}

          {!loading && (
            <div className="space-y-3">
              {displayed.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  reorderSent={reorderSent}
                  onReorder={handleReorder}
                  onQuickRestock={handleQuickRestock}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
