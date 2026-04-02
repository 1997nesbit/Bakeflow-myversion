// ---- ORDERS SERVICE ----
// Phase 2: Active — all calls go to the Django REST API.
//
// Django endpoints:
//   GET    /api/orders/
//   POST   /api/orders/
//   GET    /api/orders/{id}/
//   PATCH  /api/orders/{id}/
//   POST   /api/orders/{id}/post_to_baker/
//   POST   /api/orders/{id}/accept/
//   POST   /api/orders/{id}/quality_check/
//   POST   /api/orders/{id}/mark_packing/
//   POST   /api/orders/{id}/mark_ready/
//   POST   /api/orders/{id}/dispatch/
//   POST   /api/orders/{id}/mark_delivered/
//   POST   /api/orders/{id}/record_payment/
//   GET    /api/orders/track/{trackingId}/   ← public, no auth
//   GET    /api/production/batches/
//   POST   /api/production/batches/

import type { Order, OrderStatus, NewOrderData } from '@/types/order'
import type { DailyBatchItem } from '@/types/production'
import type { PaginatedResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export const ordersService = {
  /** GET /api/orders/ — returns paginated list filtered by role on the server */
  getAll: async (options?: { signal?: AbortSignal }): Promise<PaginatedResponse<Order>> => {
    return (await apiClient.get<PaginatedResponse<Order>>('/orders/', { signal: options?.signal })).data
  },

  /** GET /api/orders/?status=X */
  getByStatus: async (status: OrderStatus, options?: { signal?: AbortSignal }): Promise<PaginatedResponse<Order>> => {
    return (await apiClient.get<PaginatedResponse<Order>>('/orders/', {
      params: { status },
      signal: options?.signal,
    })).data
  },

  /** GET /api/orders/{id}/ */
  getById: async (id: string): Promise<Order> => {
    return (await apiClient.get<Order>(`/orders/${id}/`)).data
  },

  /** GET /api/orders/track/{trackingId}/ — public endpoint, no auth */
  getByTrackingId: async (trackingId: string): Promise<Order> => {
    return (await apiClient.get<Order>(`/orders/track/${trackingId}/`)).data
  },

  /** POST /api/orders/ */
  create: async (payload: NewOrderData): Promise<Order> => {
    return (await apiClient.post<Order>('/orders/', payload)).data
  },

  /** PATCH /api/orders/{id}/ */
  update: async (id: string, payload: Partial<Order>): Promise<Order> => {
    return (await apiClient.patch<Order>(`/orders/${id}/`, payload)).data
  },

  /** POST /api/orders/{id}/post_to_baker/ */
  postToBaker: async (id: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/post_to_baker/`)).data
  },

  /** POST /api/orders/{id}/accept/ — baker self-assigns */
  accept: async (id: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/accept/`)).data
  },

  /** POST /api/orders/{id}/quality_check/ */
  qualityCheck: async (id: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/quality_check/`)).data
  },

  /** POST /api/orders/{id}/mark_packing/ */
  markPacking: async (id: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/mark_packing/`)).data
  },

  /** POST /api/orders/{id}/mark_ready/ */
  markReady: async (id: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/mark_ready/`)).data
  },

  /** POST /api/orders/{id}/mark_delivered/ */
  markDelivered: async (id: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/mark_delivered/`)).data
  },

  /** POST /api/orders/{id}/record_payment/ */
  recordPayment: async (id: string, amount: number, method: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/record_payment/`, { amount, method })).data
  },

  /** POST /api/orders/{id}/dispatch/ */
  dispatch: async (id: string, driverId: string): Promise<Order> => {
    return (await apiClient.post<Order>(`/orders/${id}/dispatch/`, { driver_id: driverId })).data
  },

  /** Generic status advance helper — maps frontend status names to endpoint paths */
  advanceStatus: async (id: string, toStatus: OrderStatus): Promise<Order> => {
    const endpointMap: Partial<Record<OrderStatus, string>> = {
      quality:    'quality_check',
      packing:    'mark_packing',
      ready:      'mark_ready',
      delivered:  'mark_delivered',
    }
    const endpoint = endpointMap[toStatus] ?? toStatus
    return (await apiClient.post<Order>(`/orders/${id}/${endpoint}/`)).data
  },
}

export const productionService = {
  /** GET /api/production/batches/ — today's batches */
  getBatches: async (options?: { signal?: AbortSignal }): Promise<PaginatedResponse<DailyBatchItem>> => {
    return (await apiClient.get<PaginatedResponse<DailyBatchItem>>('/production/batches/', { signal: options?.signal })).data
  },

  /** POST /api/production/batches/ */
  createBatch: async (payload: Omit<DailyBatchItem, 'id' | 'bakedBy'>): Promise<DailyBatchItem> => {
    return (await apiClient.post<DailyBatchItem>('/production/batches/', payload)).data
  },
}
