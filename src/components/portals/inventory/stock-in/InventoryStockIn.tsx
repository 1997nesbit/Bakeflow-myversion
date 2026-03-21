'use client'

import { useState } from 'react'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, Search, Plus } from 'lucide-react'
import type { StockEntry, InventoryItem } from '@/types/inventory'
import { mockInventory, mockStockEntries, mockSuppliers } from '@/data/mock/inventory'
import { StockEntriesTable } from './StockEntriesTable'
import { AddStockDialog } from './AddStockDialog'

export function InventoryStockIn() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [entries, setEntries] = useState<StockEntry[]>(mockStockEntries)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const handleAddStock = (itemId: string, supplierId: string, qty: number, cost: number, invoiceRef?: string) => {
    const item = inventory.find(i => i.id === itemId)
    if (!item) return
    const supplier = mockSuppliers.find(s => s.id === supplierId)

    const newEntry: StockEntry = {
      id: `SE-${String(entries.length + 1).padStart(3, '0')}`,
      inventoryItemId: item.id,
      itemName: item.name,
      quantity: qty,
      unit: item.unit,
      supplierName: supplier?.name || 'Unknown',
      costPerUnit: cost,
      totalCost: qty * cost,
      invoiceRef,
      date: new Date().toISOString().split('T')[0],
      addedBy: 'Admin',
    }

    setEntries([newEntry, ...entries])
    setInventory(inventory.map(i =>
      i.id === item.id ? { ...i, quantity: i.quantity + qty, lastRestocked: newEntry.date, costPerUnit: cost } : i
    ))
    setShowForm(false)
    setToastMsg(`Added ${qty} ${item.unit} of ${item.name} to stock`)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const filteredEntries = entries.filter(e =>
    e.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.invoiceRef?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const todayEntries = entries.filter(e => e.date === new Date().toISOString().split('T')[0])
  const todayTotal = todayEntries.reduce((s, e) => s + e.totalCost, 0)

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Stock In</h1>
              <p className="text-xs text-muted-foreground">Record incoming stock deliveries</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-1.5 h-4 w-4" />Add Stock Entry
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Today&apos;s Entries</p>
                <p className="text-2xl font-bold text-foreground mt-1">{todayEntries.length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Today&apos;s Spend</p>
                <p className="text-2xl font-bold text-foreground mt-1">TZS {todayTotal.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-foreground mt-1">{entries.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by item, supplier, or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <StockEntriesTable filteredEntries={filteredEntries} />
        </div>

        <AddStockDialog
          open={showForm}
          inventory={inventory}
          onOpenChange={setShowForm}
          onSubmit={handleAddStock}
        />

        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{toastMsg}</span>
          </div>
        )}
      </main>
    </div>
  )
}
