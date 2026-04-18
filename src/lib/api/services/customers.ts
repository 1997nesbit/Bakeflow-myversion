// ---- CUSTOMERS SERVICE ----
// Phase 3: Active — all calls go to the Django REST API.
//
// Django endpoints:
//   GET    /api/customers/
//   POST   /api/customers/
//   GET    /api/customers/{id}/
//   PATCH  /api/customers/{id}/

import type { CustomerRecord } from '@/types/customer'
import type { PaginatedResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export const customersService = {
  /** GET /api/customers/ */
  getAll: async (options?: { signal?: AbortSignal; pageSize?: number }): Promise<PaginatedResponse<CustomerRecord>> => {
    const params = options?.pageSize ? { page_size: options.pageSize } : undefined
    return (await apiClient.get<PaginatedResponse<CustomerRecord>>('/customers/', { signal: options?.signal, params })).data
  },

  /** GET /api/customers/?page_size=500 — fetches all customers for client-side search */
  getAllForSearch: async (options?: { signal?: AbortSignal }): Promise<CustomerRecord[]> => {
    const res = await apiClient.get<PaginatedResponse<CustomerRecord>>('/customers/', {
      signal: options?.signal,
      params: { page_size: 500 },
    })
    return res.data.results
  },

  /** GET /api/customers/{id}/ */
  getById: async (id: string): Promise<CustomerRecord> => {
    return (await apiClient.get<CustomerRecord>(`/customers/${id}/`)).data
  },

  /** POST /api/customers/ */
  create: async (payload: Omit<CustomerRecord, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>): Promise<CustomerRecord> => {
    return (await apiClient.post<CustomerRecord>('/customers/', payload)).data
  },

  /** PATCH /api/customers/{id}/ */
  update: async (id: string, payload: Partial<CustomerRecord>): Promise<CustomerRecord> => {
    return (await apiClient.patch<CustomerRecord>(`/customers/${id}/`, payload)).data
  },
}
