// ---- INVENTORY TYPES ----

export interface SupplierProduct {
  id: number
  name: string
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  products: SupplierProduct[]
}

/** Inline supplier shape returned inside InventoryItem (not the full Supplier with products). */
export interface SupplierInline {
  id: string
  name: string
  phone: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'ingredient' | 'packaging' | 'finished'
  quantity: number
  unit: string
  minStock: number
  costPerUnit: number
  lastRestocked: string | null
  supplier: SupplierInline | null
  stockHealth: number
}

export interface StockEntry {
  id: string
  inventoryItem: string       // UUID of the InventoryItem
  itemName: string
  itemUnit: string
  quantity: number
  costPerUnit: number
  totalCost: number
  supplierName: string
  invoiceRef?: string
  date: string
  addedByName: string
  createdAt: string
}

export interface StockEntryPayload {
  inventoryItem: string       // UUID
  quantity: number
  costPerUnit: number
  supplierName: string
  invoiceRef?: string
  date: string
}

export interface DailyRollout {
  id: string
  inventoryItem: string       // UUID of the InventoryItem
  itemName: string
  itemUnit: string
  quantity: number
  quantityUsed: number        // sum of BatchIngredient.quantity_used for this rollout
  purpose: string
  rolledOutByName: string
  date: string
  time: string
}

export interface DailyRolloutPayload {
  inventoryItem: string       // UUID
  quantity: number
  purpose: string
  date: string
  time: string
}

export interface InventoryItemPayload {
  name: string
  category: 'ingredient' | 'packaging' | 'finished'
  quantity?: number
  unit: string
  minStock: number
  costPerUnit: number
  supplierId?: string | null
}

export interface SupplierPayload {
  name: string
  phone: string
  email?: string
}

export type InventoryRole = 'manager' | 'inventory_clerk' | 'baker' | 'front_desk'
