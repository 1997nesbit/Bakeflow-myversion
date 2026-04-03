// ---- INVENTORY SERVICE ----
// Phase 4: Active — all methods connected to the Django backend.
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

import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type {
  InventoryItem,
  InventoryItemPayload,
  StockEntry,
  StockEntryPayload,
  DailyRollout,
  DailyRolloutPayload,
  Supplier,
  SupplierPayload,
} from '@/types/inventory'

export const inventoryService = {
  /** GET /api/inventory/ — paginated */
  getAll: async (options?: { signal?: AbortSignal }): Promise<PaginatedResponse<InventoryItem>> => {
    return (await apiClient.get<PaginatedResponse<InventoryItem>>('/inventory/', { signal: options?.signal })).data
  },

  /** GET /api/inventory/low_stock/ — not paginated (bounded set) */
  getLowStock: async (options?: { signal?: AbortSignal }): Promise<InventoryItem[]> => {
    return (await apiClient.get<InventoryItem[]>('/inventory/low_stock/', { signal: options?.signal })).data
  },

  /** GET /api/inventory/stock_entries/ — paginated, optional ?item=&date= */
  getStockEntries: async (
    params?: { item?: string; date?: string },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedResponse<StockEntry>> => {
    return (
      await apiClient.get<PaginatedResponse<StockEntry>>('/inventory/stock_entries/', {
        params,
        signal: options?.signal,
      })
    ).data
  },

  /** POST /api/inventory/stock_in/ */
  recordStockIn: async (payload: StockEntryPayload): Promise<StockEntry> => {
    return (await apiClient.post<StockEntry>('/inventory/stock_in/', payload)).data
  },

  /** GET /api/inventory/rollouts/ — paginated, optional ?date=&item= */
  getRollouts: async (
    params?: { date?: string; item?: string },
    options?: { signal?: AbortSignal }
  ): Promise<PaginatedResponse<DailyRollout>> => {
    return (
      await apiClient.get<PaginatedResponse<DailyRollout>>('/inventory/rollouts/', {
        params,
        signal: options?.signal,
      })
    ).data
  },

  /** POST /api/inventory/rollout/ */
  recordRollout: async (payload: DailyRolloutPayload): Promise<DailyRollout> => {
    return (await apiClient.post<DailyRollout>('/inventory/rollout/', payload)).data
  },

  /** POST /api/inventory/ */
  createItem: async (payload: InventoryItemPayload): Promise<InventoryItem> => {
    return (await apiClient.post<InventoryItem>('/inventory/', payload)).data
  },

  /** PATCH /api/inventory/{id}/ */
  updateItem: async (id: string, payload: Partial<InventoryItemPayload>): Promise<InventoryItem> => {
    return (await apiClient.patch<InventoryItem>(`/inventory/${id}/`, payload)).data
  },

  /** GET /api/suppliers/ — paginated */
  getSuppliers: async (options?: { signal?: AbortSignal }): Promise<PaginatedResponse<Supplier>> => {
    return (await apiClient.get<PaginatedResponse<Supplier>>('/suppliers/', { signal: options?.signal })).data
  },

  /** POST /api/suppliers/ */
  createSupplier: async (payload: SupplierPayload): Promise<Supplier> => {
    return (await apiClient.post<Supplier>('/suppliers/', payload)).data
  },

  /** PATCH /api/suppliers/{id}/ */
  updateSupplier: async (id: string, payload: Partial<SupplierPayload>): Promise<Supplier> => {
    return (await apiClient.patch<Supplier>(`/suppliers/${id}/`, payload)).data
  },
}
