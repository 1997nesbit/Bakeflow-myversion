'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InventoryItem, InventoryItemPayload, Supplier, SupplierPayload } from '@/types/inventory'
import { inventoryService } from '@/lib/api/services/inventory'
import { handleApiError } from '@/lib/utils/handle-error'
import { ItemFormDialog } from './inventory/ItemFormDialog'
import { SupplierFormDialog } from './inventory/SupplierFormDialog'
import { Search, Plus, Edit2, Phone, Mail } from 'lucide-react'

type Tab = 'items' | 'suppliers'

const TABS: { key: Tab; label: string }[] = [
  { key: 'items',     label: 'Items'     },
  { key: 'suppliers', label: 'Suppliers' },
]

const HEALTH_COLOR: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300',
  low:      'bg-amber-500/20 text-amber-300',
  healthy:  'bg-green-500/20 text-green-300',
}

function stockStatus(item: InventoryItem): 'critical' | 'low' | 'healthy' {
  if (item.stockHealth < 0.5) return 'critical'
  if (item.stockHealth < 1)   return 'low'
  return 'healthy'
}

export function ManagerInventory() {
  const [tab, setTab] = useState<Tab>('items')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [itemDialog, setItemDialog] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [supplierDialog, setSupplierDialog] = useState(false)
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      inventoryService.getAll({ signal: controller.signal }).then(r => setItems(r.results)),
      inventoryService.getSuppliers({ signal: controller.signal }).then(r => setSuppliers(r.results)),
    ])
      .catch(handleApiError)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.includes(search.toLowerCase())
  )
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  )

  const handleSaveItem = async (payload: InventoryItemPayload) => {
    try {
      if (editItem) {
        const updated = await inventoryService.updateItem(editItem.id, payload)
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
        toast.success('Item updated.')
      } else {
        const created = await inventoryService.createItem(payload)
        setItems(prev => [created, ...prev])
        toast.success('Item created.')
      }
      setItemDialog(false)
      setEditItem(null)
    } catch (err) {
      handleApiError(err)
      throw err
    }
  }

  const handleSaveSupplier = async (payload: SupplierPayload) => {
    try {
      if (editSupplier) {
        const updated = await inventoryService.updateSupplier(editSupplier.id, payload)
        setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s))
        toast.success('Supplier updated.')
      } else {
        const created = await inventoryService.createSupplier(payload)
        setSuppliers(prev => [created, ...prev])
        toast.success('Supplier added.')
      }
      setSupplierDialog(false)
      setEditSupplier(null)
    } catch (err) {
      handleApiError(err)
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Inventory Management</h1>
            <p className="text-sm text-white/40">
              {items.length} items &middot; {suppliers.length} suppliers
            </p>
          </div>
          {tab === 'items' ? (
            <Button
              onClick={() => { setEditItem(null); setItemDialog(true) }}
              className="bg-manager-accent hover:bg-manager-accent/85 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />New Item
            </Button>
          ) : (
            <Button
              onClick={() => { setEditSupplier(null); setSupplierDialog(true) }}
              className="bg-manager-accent hover:bg-manager-accent/85 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />New Supplier
            </Button>
          )}
        </div>

        {/* Tab bar + search */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1 rounded-lg border border-white/10 p-0.5 w-fit">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-white/30">
                  {t.key === 'items' ? items.length : suppliers.length}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-56 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Items table */}
        {tab === 'items' && (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {['Name', 'Category', 'Quantity', 'Min Stock', 'Cost / Unit', 'Supplier', 'Health', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-white/30">Loading…</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-white/30">No items found.</td></tr>
                ) : filteredItems.map(item => {
                  const status = stockStatus(item)
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-white">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-white/50 capitalize">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-white/70">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-sm text-white/40">{item.minStock} {item.unit}</td>
                      <td className="px-4 py-3 text-sm text-white/70">TZS {item.costPerUnit.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-white/50">{item.supplier?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${HEALTH_COLOR[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => { setEditItem(item); setItemDialog(true) }}
                          className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/70 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Suppliers table */}
        {tab === 'suppliers' && (
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  {['Name', 'Phone', 'Email', 'Products', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-sm text-white/30">Loading…</td></tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-sm text-white/30">No suppliers found.</td></tr>
                ) : filteredSuppliers.map(s => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{s.name}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${s.phone}`} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
                        <Phone className="h-3.5 w-3.5" />{s.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {s.email
                        ? <a href={`mailto:${s.email}`} className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"><Mail className="h-3.5 w-3.5" />{s.email}</a>
                        : <span className="text-sm text-white/30">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-white/40">{s.products.length}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => { setEditSupplier(s); setSupplierDialog(true) }}
                        className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/70 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ItemFormDialog
        open={itemDialog}
        item={editItem}
        suppliers={suppliers}
        onOpenChange={open => { setItemDialog(open); if (!open) setEditItem(null) }}
        onSubmit={handleSaveItem}
      />
      <SupplierFormDialog
        open={supplierDialog}
        supplier={editSupplier}
        onOpenChange={open => { setSupplierDialog(open); if (!open) setEditSupplier(null) }}
        onSubmit={handleSaveSupplier}
      />
    </div>
  )
}
