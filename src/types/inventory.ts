// ---- INVENTORY TYPES ----

export interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  products: string[]
}

export interface InventoryItem {
  id: string
  name: string
  category: 'ingredient' | 'packaging' | 'finished'
  quantity: number
  unit: string
  minStock: number
  costPerUnit: number
  lastRestocked: string
  supplierId?: string
}

export interface StockEntry {
  id: string
  inventoryItemId: string
  itemName: string
  quantity: number
  unit: string
  supplierName: string
  costPerUnit: number
  totalCost: number
  invoiceRef?: string
  date: string
  addedBy: string
}

export interface DailyRollout {
  id: string
  inventoryItemId: string
  itemName: string
  quantity: number
  unit: string
  purpose: string
  rolledOutBy: string
  date: string
  time: string
}

export type InventoryRole = 'manager' | 'inventory_clerk' | 'baker' | 'front_desk'

export interface InventoryUser {
  id: string
  name: string
  role: InventoryRole
  hasInventoryAccess: boolean
}

export interface Driver {
  id: string
  name: string
  phone: string
  status: 'available' | 'on-delivery' | 'offline'
}
