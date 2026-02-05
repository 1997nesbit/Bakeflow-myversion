'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { mockInventory, InventoryItem } from '@/lib/mock-data'
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
} from 'lucide-react'

type CategoryFilter = 'all' | 'ingredient' | 'packaging' | 'finished'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [restockAmount, setRestockAmount] = useState('')

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter((item) => item.quantity < item.minStock)
  const healthyStockItems = inventory.filter(
    (item) => item.quantity >= item.minStock
  )

  const handleRestock = () => {
    if (!selectedItem || !restockAmount) return

    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              quantity: item.quantity + parseInt(restockAmount),
              lastRestocked: new Date().toISOString().split('T')[0],
            }
          : item
      )
    )
    setShowRestockModal(false)
    setSelectedItem(null)
    setRestockAmount('')
  }

  const openRestockModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setRestockAmount('')
    setShowRestockModal(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    const ratio = item.quantity / item.minStock
    if (ratio < 0.5) return { label: 'Critical', color: 'bg-red-100 text-red-800' }
    if (ratio < 1) return { label: 'Low', color: 'bg-amber-100 text-amber-800' }
    return { label: 'Healthy', color: 'bg-green-100 text-green-800' }
  }

  const categoryLabels: Record<InventoryItem['category'], string> = {
    ingredient: 'Ingredients',
    packaging: 'Packaging',
    finished: 'Finished Products',
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">
              Track ingredients, packaging, and finished products
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-5 w-5" />
            Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">
                  {inventory.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-foreground">
                  {lowStockItems.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Healthy Stock</p>
                <p className="text-2xl font-bold text-foreground">
                  {healthyStockItems.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="ingredient">Ingredients</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
              <SelectItem value="finished">Finished Products</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-0 border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="cursor-pointer border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => openRestockModal(item)}
                  >
                    {item.name}: {item.quantity} {item.unit}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inventory Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Min Stock
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Last Restocked
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventory.map((item) => {
                    const status = getStockStatus(item)
                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-muted/50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.id}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[item.category]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.minStock} {item.unit}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`${status.color} border-0`}>
                            {status.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.lastRestocked}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRestockModal(item)}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Restock
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Restock Modal */}
        <Dialog open={showRestockModal} onOpenChange={setShowRestockModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restock {selectedItem?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold text-foreground">
                  {selectedItem?.quantity} {selectedItem?.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restockAmount">Add Quantity</Label>
                <Input
                  id="restockAmount"
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  placeholder={`Enter amount in ${selectedItem?.unit}`}
                />
              </div>
              {restockAmount && (
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-700">New Stock Level</p>
                  <p className="text-2xl font-bold text-green-800">
                    {(selectedItem?.quantity || 0) + parseInt(restockAmount || '0')}{' '}
                    {selectedItem?.unit}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRestockModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleRestock}
                disabled={!restockAmount}
              >
                Confirm Restock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
