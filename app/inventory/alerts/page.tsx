'use client'

import { useState } from 'react'
import { InventorySidebar } from '@/components/portal-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  mockInventory,
  mockSuppliers,
  type InventoryItem,
} from '@/lib/mock-data'
import {
  AlertTriangle,
  AlertOctagon,
  Phone,
  Mail,
  PackagePlus,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react'

export default function AlertsPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [toast, setToast] = useState('')
  const [reorderSent, setReorderSent] = useState<Set<string>>(new Set())

  const criticalItems = inventory.filter(i => i.quantity < i.minStock * 0.5)
  const lowItems = inventory.filter(i => i.quantity >= i.minStock * 0.5 && i.quantity <= i.minStock)
  const healthyItems = inventory.filter(i => i.quantity > i.minStock)

  const getSupplierForItem = (item: InventoryItem) => {
    if (!item.supplierId) return null
    return mockSuppliers.find(s => s.id === item.supplierId) || null
  }

  const handleReorder = (item: InventoryItem) => {
    const supplier = getSupplierForItem(item)
    setReorderSent(prev => new Set(prev).add(item.id))
    setToast(`Reorder request sent to ${supplier?.name || 'supplier'} for ${item.name}`)
    setTimeout(() => setToast(''), 3000)
  }

  const handleQuickRestock = (itemId: string, amount: number) => {
    setInventory(inventory.map(i =>
      i.id === itemId
        ? { ...i, quantity: i.quantity + amount, lastRestocked: new Date().toISOString().split('T')[0] }
        : i
    ))
    const item = inventory.find(i => i.id === itemId)
    setToast(`Added ${amount} ${item?.unit} to ${item?.name}`)
    setTimeout(() => setToast(''), 3000)
  }

  function AlertCard({ item, severity }: { item: InventoryItem; severity: 'critical' | 'low' }) {
    const supplier = getSupplierForItem(item)
    const ratio = item.quantity / item.minStock
    const suggestedReorder = Math.ceil(item.minStock * 2 - item.quantity)
    const isSent = reorderSent.has(item.id)

    return (
      <Card className={`border-0 shadow-sm border-l-4 ${severity === 'critical' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {severity === 'critical'
                ? <AlertOctagon className="h-4.5 w-4.5 text-red-600" />
                : <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
              }
              <div>
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
            </div>
            <Badge className={`border-0 ${severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
              {severity === 'critical' ? 'Critical' : 'Low'}
            </Badge>
          </div>

          {/* Stock bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Current: {item.quantity} {item.unit}</span>
              <span>Min: {item.minStock} {item.unit}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted">
              <div
                className={`h-2.5 rounded-full transition-all ${severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(ratio * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-2.5 mb-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suggested reorder</span>
              <span className="font-semibold text-foreground">{suggestedReorder} {item.unit}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Est. cost</span>
              <span className="font-semibold text-foreground">TZS {(suggestedReorder * item.costPerUnit).toLocaleString()}</span>
            </div>
          </div>

          {supplier && (
            <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
              <span>Supplier: <span className="font-medium text-foreground">{supplier.name}</span></span>
              <a href={`tel:${supplier.phone}`} className="text-primary hover:underline flex items-center gap-0.5">
                <Phone className="h-3 w-3" /> Call
              </a>
              {supplier.email && (
                <a href={`mailto:${supplier.email}?subject=Reorder: ${item.name}&body=Please supply ${suggestedReorder} ${item.unit} of ${item.name}.`} className="text-primary hover:underline flex items-center gap-0.5">
                  <Mail className="h-3 w-3" /> Email
                </a>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {isSent ? (
              <Button size="sm" disabled className="flex-1 bg-emerald-100 text-emerald-800 border-0">
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                Reorder Sent
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleReorder(item)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Mail className="mr-1 h-3.5 w-3.5" />
                Send Reorder
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="bg-transparent"
              onClick={() => handleQuickRestock(item.id, suggestedReorder)}
            >
              <PackagePlus className="mr-1 h-3.5 w-3.5" />
              Quick Add
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Alerts & Reorder</h1>
              <p className="text-xs text-muted-foreground">Low stock warnings and supplier reorder</p>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-red-100 text-red-800 border-0 text-sm px-3 py-1">
                <AlertOctagon className="mr-1 h-3.5 w-3.5" />
                {criticalItems.length} Critical
              </Badge>
              <Badge className="bg-amber-100 text-amber-800 border-0 text-sm px-3 py-1">
                <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                {lowItems.length} Low
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Critical items */}
          {criticalItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h2 className="font-semibold text-foreground">Critical - Immediate Action Required</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {criticalItems.map(item => (
                  <AlertCard key={item.id} item={item} severity="critical" />
                ))}
              </div>
            </div>
          )}

          {/* Low items */}
          {lowItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h2 className="font-semibold text-foreground">Low Stock - Plan Reorder</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {lowItems.map(item => (
                  <AlertCard key={item.id} item={item} severity="low" />
                ))}
              </div>
            </div>
          )}

          {criticalItems.length === 0 && lowItems.length === 0 && (
            <div className="py-16 text-center">
              <TrendingUp className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-foreground">All stock levels are healthy</h2>
              <p className="text-sm text-muted-foreground mt-1">No items need attention right now</p>
            </div>
          )}

          {/* Healthy overview */}
          {healthyItems.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                  Healthy Stock ({healthyItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {healthyItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">
                        {item.quantity} {item.unit}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}
      </main>
    </div>
  )
}
