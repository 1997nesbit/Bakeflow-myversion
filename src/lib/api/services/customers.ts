// ---- CUSTOMERS SERVICE ----
// Phase 3: Activate API calls when Django customer endpoints are ready.
//
// Django endpoints:
//   GET    /api/customers/
//   POST   /api/customers/
//   GET    /api/customers/{id}/
//   PATCH  /api/customers/{id}/

import type { CustomerRecord } from '@/types/customer'
import { mockCustomers } from '@/data/mock/customers'

export const customersService = {
  /** GET /api/customers/ */
  getAll: async (): Promise<CustomerRecord[]> => {
    // TODO (Phase 3): return (await apiClient.get<CustomerRecord[]>('/customers/')).data
    return Promise.resolve([...mockCustomers])
  },

  /** GET /api/customers/{id}/ */
  getById: async (id: string): Promise<CustomerRecord | undefined> => {
    // TODO (Phase 3): return (await apiClient.get<CustomerRecord>(`/customers/${id}/`)).data
    return Promise.resolve(mockCustomers.find((c) => c.id === id))
  },

  /** POST /api/customers/ */
  create: async (payload: Omit<CustomerRecord, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>): Promise<CustomerRecord> => {
    // TODO (Phase 3): return (await apiClient.post<CustomerRecord>('/customers/', payload)).data
    void payload
    throw new Error('customersService.create() not yet connected to backend.')
  },

  /** PATCH /api/customers/{id}/ */
  update: async (id: string, payload: Partial<CustomerRecord>): Promise<CustomerRecord> => {
    // TODO (Phase 3): return (await apiClient.patch<CustomerRecord>(`/customers/${id}/`, payload)).data
    void id; void payload
    throw new Error('customersService.update() not yet connected to backend.')
  },
}
