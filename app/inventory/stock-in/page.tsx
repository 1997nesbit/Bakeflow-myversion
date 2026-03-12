'use client'

import { useState } from 'react'
import { InventorySidebar } from '@/components/app-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  mockInventory,
  mockStockEntries,
  mockSuppliers,
  type StockEntry,
  type InventoryItem,
} from '@/lib/mock-data'
import {
  PackagePlus,
  Search,
  FileText,
  CheckCircle,
  Plus,
  Calendar,
  Building2,
} from 'lucide-react'

export default function StockInPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [entries, setEntries] = useState<StockEntry[]>(mockStockEntries)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState('')

  // Form state
  const [formItem, setFormItem] = useState('')
  const [formSupplier, setFormSupplier] = useState('')
  const [formQty, setFormQty] = useState('')
  const [formCost, setFormCost] = useState('')
  const [formInvoice, setFormInvoice] = useState('')

  const selectedItem = inventory.find(i => i.id === formItem)
  const totalCost = Number.parseFloat(formQty || '0') * Number.parseFloat(formCost || '0')

  const handleAddStock = () => {
    if (!formItem || !formSupplier || !formQty || !formCost) return

    const item = inventory.find(i => i.id === formItem)
    if (!item) return

    const supplier = mockSuppliers.find(s => s.id === formSupplier)
    const qty = Number.parseFloat(formQty)
    const cost = Number.parseFloat(formCost)

    const newEntry: StockEntry = {
      id: `SE-${String(entries.length + 1).padStart(3, '0')}`,
      inventoryItemId: item.id,
      itemName: item.name,
      quantity: qty,
      unit: item.unit,
      supplierName: supplier?.name || 'Unknown',
      costPerUnit: cost,
      totalCost: qty * cost,
      invoiceRef: formInvoice || undefined,
      date: new Date().toISOString().split('T')[0],
      addedBy: 'Admin',
    }

    setEntries([newEntry, ...entries])
    setInventory(inventory.map(i =>
      i.id === item.id
        ? { ...i, quantity: i.quantity + qty, lastRestocked: newEntry.date, costPerUnit: cost }
        : i
    ))

    setShowForm(false)
    setFormItem('')
    setFormSupplier('')
    setFormQty('')
    setFormCost('')
    setFormInvoice('')
    setToast(`Added ${qty} ${item.unit} of ${item.name} to stock`)
    setTimeout(() => setToast(''), 3000)
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
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Stock In</h1>
              <p className="text-xs text-muted-foreground">Record incoming stock deliveries</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Stock Entry
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Today summary */}
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

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by item, supplier, or invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Entries table */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Unit Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Added By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{entry.date}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{entry.itemName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-foreground">{entry.supplierName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-emerald-100 text-emerald-800 border-0">
                            +{entry.quantity} {entry.unit}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          ${entry.costPerUnit.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                          ${entry.totalCost.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          {entry.invoiceRef ? (
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{entry.invoiceRef}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{entry.addedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEntries.length === 0 && (
                  <div className="py-12 text-center">
                    <PackagePlus className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No stock entries found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add stock form dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-primary" />
                Add Stock Entry
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select value={formItem} onValueChange={setFormItem}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {inventory.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.quantity} {item.unit} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={formSupplier} onValueChange={setFormSupplier}>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity {selectedItem ? `(${selectedItem.unit})` : ''}</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    placeholder="Amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost per unit ($)</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="Price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Invoice / Reference (optional)</Label>
                <Input
                  value={formInvoice}
                  onChange={(e) => setFormInvoice(e.target.value)}
                  placeholder="e.g. INV-2026-0451"
                />
              </div>

              {formQty && formCost && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost</span>
                    <span className="font-bold text-foreground">TZS {totalCost.toLocaleString()}</span>
                  </div>
                  {selectedItem && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">New Stock Level</span>
                      <span className="font-bold text-emerald-600">
                        {selectedItem.quantity + Number.parseFloat(formQty || '0')} {selectedItem.unit}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button
                onClick={handleAddStock}
                disabled={!formItem || !formSupplier || !formQty || !formCost}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                Confirm Stock In
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Toast */}
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
