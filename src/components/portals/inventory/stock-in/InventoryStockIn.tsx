'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'
import type { StockEntry, InventoryItem, Supplier } from '@/types/inventory'
import { inventoryService } from '@/lib/api/services/inventory'
import { handleApiError } from '@/lib/utils/handle-error'
import { StockEntriesTable } from './StockEntriesTable'
import { AddStockDialog } from './AddStockDialog'

export function InventoryStockIn() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const controller = new AbortController()

    inventoryService.getAll({ signal: controller.signal })
      .then(res => setInventory(res.results))
      .catch(handleApiError)

    inventoryService.getStockEntries(undefined, { signal: controller.signal })
      .then(res => setEntries(res.results))
      .catch(handleApiError)

    inventoryService.getSuppliers({ signal: controller.signal })
      .then(res => setSuppliers(res.results))
      .catch(handleApiError)

    return () => controller.abort()
  }, [])

  const handleAddStock = async (
    itemId: string,
    supplierName: string,
    qty: number,
    cost: number,
    invoiceRef?: string,
  ) => {
    setSubmitting(true)
    try {
      await inventoryService.recordStockIn({
        inventoryItem: itemId,
        quantity: qty,
        costPerUnit: cost,
        supplierName,
        invoiceRef,
        date: today,
      })
      const item = inventory.find(i => i.id === itemId)
      toast.success(`Added ${qty} ${item?.unit ?? ''} of ${item?.name ?? 'item'} to stock.`)
      setShowForm(false)
      // Refresh both lists so totals stay accurate
      const [entriesRes, invRes] = await Promise.all([
        inventoryService.getStockEntries(),
        inventoryService.getAll(),
      ])
      setEntries(entriesRes.results)
      setInventory(invRes.results)
    } catch (err) {
      setSubmitting(false)
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredEntries = entries.filter(e =>
    e.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.invoiceRef?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const todayEntries = entries.filter(e => e.date === today)
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
          suppliers={suppliers}
          onOpenChange={setShowForm}
          onSubmit={handleAddStock}
        />
      </main>
    </div>
  )
}
