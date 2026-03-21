// ---- MOCK INVENTORY DATA ----
// TODO (Phase 4): Replace each export with calls from @/lib/api/services/inventory

import type { InventoryItem, Supplier, StockEntry, DailyRollout, InventoryUser, Driver } from '@/types/inventory'

export const mockInventory: InventoryItem[] = [
  { id: 'INV-001', name: 'All-Purpose Flour', category: 'ingredient', quantity: 45, unit: 'kg', minStock: 20, costPerUnit: 1.2, lastRestocked: '2026-02-01', supplierId: 'SUP-001' },
  { id: 'INV-002', name: 'Sugar', category: 'ingredient', quantity: 8, unit: 'kg', minStock: 15, costPerUnit: 0.9, lastRestocked: '2026-01-28', supplierId: 'SUP-002' },
  { id: 'INV-003', name: 'Butter', category: 'ingredient', quantity: 12, unit: 'kg', minStock: 10, costPerUnit: 4.5, lastRestocked: '2026-02-03', supplierId: 'SUP-003' },
  { id: 'INV-004', name: 'Eggs', category: 'ingredient', quantity: 120, unit: 'pcs', minStock: 100, costPerUnit: 0.15, lastRestocked: '2026-02-04', supplierId: 'SUP-003' },
  { id: 'INV-005', name: 'Yeast', category: 'ingredient', quantity: 3, unit: 'kg', minStock: 2, costPerUnit: 8, lastRestocked: '2026-02-02', supplierId: 'SUP-004' },
  { id: 'INV-006', name: 'Chocolate Chips', category: 'ingredient', quantity: 4, unit: 'kg', minStock: 5, costPerUnit: 6, lastRestocked: '2026-01-30', supplierId: 'SUP-004' },
  { id: 'INV-007', name: 'Vanilla Extract', category: 'ingredient', quantity: 2, unit: 'L', minStock: 1, costPerUnit: 12, lastRestocked: '2026-02-01', supplierId: 'SUP-004' },
  { id: 'INV-008', name: 'Cake Boxes - Small', category: 'packaging', quantity: 25, unit: 'pcs', minStock: 50, costPerUnit: 0.5, lastRestocked: '2026-01-25', supplierId: 'SUP-005' },
  { id: 'INV-009', name: 'Cake Boxes - Large', category: 'packaging', quantity: 40, unit: 'pcs', minStock: 30, costPerUnit: 0.8, lastRestocked: '2026-01-28', supplierId: 'SUP-005' },
  { id: 'INV-010', name: 'Bread Bags', category: 'packaging', quantity: 200, unit: 'pcs', minStock: 100, costPerUnit: 0.1, lastRestocked: '2026-02-02', supplierId: 'SUP-005' },
  { id: 'INV-011', name: 'Heavy Cream', category: 'ingredient', quantity: 6, unit: 'L', minStock: 8, costPerUnit: 3.5, lastRestocked: '2026-02-03', supplierId: 'SUP-003' },
  { id: 'INV-012', name: 'Fondant - White', category: 'ingredient', quantity: 5, unit: 'kg', minStock: 3, costPerUnit: 7, lastRestocked: '2026-01-30', supplierId: 'SUP-004' },
]

export const mockSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'Metro Flour Mills', phone: '+1 555-8001', email: 'orders@metroflour.com', products: ['All-Purpose Flour', 'Whole Wheat Flour'] },
  { id: 'SUP-002', name: 'Sweet Valley Sugar Co.', phone: '+1 555-8002', email: 'supply@sweetvalley.com', products: ['Sugar', 'Icing Sugar', 'Brown Sugar'] },
  { id: 'SUP-003', name: 'Green Pastures Dairy', phone: '+1 555-8003', email: 'hello@greenpastures.com', products: ['Butter', 'Heavy Cream', 'Eggs'] },
  { id: 'SUP-004', name: "Baker's Best Supply", phone: '+1 555-8004', email: 'orders@bakersbest.com', products: ['Yeast', 'Chocolate Chips', 'Vanilla Extract', 'Fondant - White'] },
  { id: 'SUP-005', name: 'PackRight Solutions', phone: '+1 555-8005', email: 'sales@packright.com', products: ['Cake Boxes - Small', 'Cake Boxes - Large', 'Bread Bags'] },
]

export const mockStockEntries: StockEntry[] = [
  { id: 'SE-001', inventoryItemId: 'INV-001', itemName: 'All-Purpose Flour', quantity: 50, unit: 'kg', supplierName: 'Metro Flour Mills', costPerUnit: 1.2, totalCost: 60, invoiceRef: 'MF-2026-0234', date: '2026-02-01', addedBy: 'Admin' },
  { id: 'SE-002', inventoryItemId: 'INV-002', itemName: 'Sugar', quantity: 25, unit: 'kg', supplierName: 'Sweet Valley Sugar Co.', costPerUnit: 0.9, totalCost: 22.5, invoiceRef: 'SV-2026-0891', date: '2026-01-28', addedBy: 'Admin' },
  { id: 'SE-003', inventoryItemId: 'INV-003', itemName: 'Butter', quantity: 15, unit: 'kg', supplierName: 'Green Pastures Dairy', costPerUnit: 4.5, totalCost: 67.5, invoiceRef: 'GP-2026-0112', date: '2026-02-03', addedBy: 'Admin' },
  { id: 'SE-004', inventoryItemId: 'INV-004', itemName: 'Eggs', quantity: 200, unit: 'pcs', supplierName: 'Green Pastures Dairy', costPerUnit: 0.15, totalCost: 30, invoiceRef: 'GP-2026-0113', date: '2026-02-04', addedBy: 'Admin' },
  { id: 'SE-005', inventoryItemId: 'INV-008', itemName: 'Cake Boxes - Small', quantity: 100, unit: 'pcs', supplierName: 'PackRight Solutions', costPerUnit: 0.5, totalCost: 50, invoiceRef: 'PR-2026-0044', date: '2026-01-25', addedBy: 'Admin' },
  { id: 'SE-006', inventoryItemId: 'INV-006', itemName: 'Chocolate Chips', quantity: 10, unit: 'kg', supplierName: "Baker's Best Supply", costPerUnit: 6, totalCost: 60, invoiceRef: 'BB-2026-0321', date: '2026-01-30', addedBy: 'Admin' },
]

export const mockDailyRollouts: DailyRollout[] = [
  { id: 'RO-001', inventoryItemId: 'INV-001', itemName: 'All-Purpose Flour', quantity: 8, unit: 'kg', purpose: 'Morning bread production', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:00' },
  { id: 'RO-002', inventoryItemId: 'INV-002', itemName: 'Sugar', quantity: 3, unit: 'kg', purpose: 'Cake and pastry batch', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:15' },
  { id: 'RO-003', inventoryItemId: 'INV-003', itemName: 'Butter', quantity: 2, unit: 'kg', purpose: 'Croissant & pastry dough', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:15' },
  { id: 'RO-004', inventoryItemId: 'INV-004', itemName: 'Eggs', quantity: 36, unit: 'pcs', purpose: 'Cake batter & bread', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:30' },
  { id: 'RO-005', inventoryItemId: 'INV-007', itemName: 'Vanilla Extract', quantity: 0.2, unit: 'L', purpose: 'Cake flavouring', rolledOutBy: 'Baker John', date: '2026-02-06', time: '07:00' },
]

export const mockInventoryUsers: InventoryUser[] = [
  { id: 'IU-001', name: 'Manager Admin', role: 'manager', hasInventoryAccess: true },
  { id: 'IU-002', name: 'Store Clerk Mary', role: 'inventory_clerk', hasInventoryAccess: true },
  { id: 'IU-003', name: 'Baker John', role: 'baker', hasInventoryAccess: true },
  { id: 'IU-004', name: 'Front Desk Sarah', role: 'front_desk', hasInventoryAccess: false },
]

export const mockDrivers: Driver[] = [
  { id: 'DRV-001', name: 'Tom Martinez', phone: '+1 555-1111', status: 'available' },
  { id: 'DRV-002', name: 'Amy Garcia', phone: '+1 555-2222', status: 'on-delivery' },
  { id: 'DRV-003', name: 'Chris Lee', phone: '+1 555-3333', status: 'available' },
]
