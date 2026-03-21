// ---- INVENTORY SERVICE ----
// Phase 4: Activate API calls when Django inventory endpoints are ready.
//
// Django endpoints:
//   GET    /api/inventory/
//   POST   /api/inventory/
//   GET    /api/inventory/{id}/
//   PATCH  /api/inventory/{id}/
//   GET    /api/inventory/low_stock/
//   POST   /api/inventory/stock_in/
//   GET    /api/inventory/stock_entries/
//   POST   /api/inventory/rollout/
//   GET    /api/inventory/rollouts/
//   GET    /api/suppliers/
//   POST   /api/suppliers/

import type { InventoryItem, StockEntry, DailyRollout, Supplier } from '@/types/inventory'
import { mockInventory, mockStockEntries, mockDailyRollouts, mockSuppliers } from '@/data/mock/inventory'

export const inventoryService = {
  /** GET /api/inventory/ */
  getAll: async (): Promise<InventoryItem[]> => {
    // TODO (Phase 4): return (await apiClient.get<InventoryItem[]>('/inventory/')).data
    return Promise.resolve([...mockInventory])
  },

  /** GET /api/inventory/low_stock/ */
  getLowStock: async (): Promise<InventoryItem[]> => {
    // TODO (Phase 4): return (await apiClient.get<InventoryItem[]>('/inventory/low_stock/')).data
    return Promise.resolve(mockInventory.filter((i) => i.quantity <= i.minStock))
  },

  /** GET /api/inventory/stock_entries/ */
  getStockEntries: async (): Promise<StockEntry[]> => {
    // TODO (Phase 4): return (await apiClient.get<StockEntry[]>('/inventory/stock_entries/')).data
    return Promise.resolve([...mockStockEntries])
  },

  /** POST /api/inventory/stock_in/ */
  recordStockIn: async (payload: Omit<StockEntry, 'id'>): Promise<StockEntry> => {
    // TODO (Phase 4): return (await apiClient.post<StockEntry>('/inventory/stock_in/', payload)).data
    void payload
    throw new Error('inventoryService.recordStockIn() not yet connected to backend.')
  },

  /** GET /api/inventory/rollouts/ */
  getRollouts: async (date?: string): Promise<DailyRollout[]> => {
    // TODO (Phase 4): return (await apiClient.get<DailyRollout[]>('/inventory/rollouts/', { params: { date } })).data
    const all = [...mockDailyRollouts]
    return Promise.resolve(date ? all.filter((r) => r.date === date) : all)
  },

  /** POST /api/inventory/rollout/ */
  recordRollout: async (payload: Omit<DailyRollout, 'id'>): Promise<DailyRollout> => {
    // TODO (Phase 4): return (await apiClient.post<DailyRollout>('/inventory/rollout/', payload)).data
    void payload
    throw new Error('inventoryService.recordRollout() not yet connected to backend.')
  },

  /** GET /api/suppliers/ */
  getSuppliers: async (): Promise<Supplier[]> => {
    // TODO (Phase 4): return (await apiClient.get<Supplier[]>('/suppliers/')).data
    return Promise.resolve([...mockSuppliers])
  },
}
