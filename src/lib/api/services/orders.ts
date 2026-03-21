// ---- ORDERS SERVICE ----
// Phase 2: Activate API calls when Django order endpoints are ready.
//
// Django endpoints:
//   GET    /api/orders/
//   POST   /api/orders/
//   GET    /api/orders/{id}/
//   PATCH  /api/orders/{id}/
//   POST   /api/orders/{id}/post_to_baker/
//   POST   /api/orders/{id}/assign_baker/
//   POST   /api/orders/{id}/quality_check/
//   POST   /api/orders/{id}/mark_packing/
//   POST   /api/orders/{id}/mark_ready/
//   POST   /api/orders/{id}/dispatch/
//   POST   /api/orders/{id}/mark_delivered/
//   POST   /api/orders/{id}/record_payment/
//   GET    /api/orders/track/{trackingId}/   ← public, no auth

import type { Order, OrderStatus } from '@/types/order'
import { mockOrders } from '@/data/mock/orders'

// ─── ACTIVE (mock phase) ─────────────────────────────────────────────────────
// These functions return mock data now.
// When the backend is ready: replace each return with the commented apiClient call.
// ─────────────────────────────────────────────────────────────────────────────

export const ordersService = {
  /** GET /api/orders/ */
  getAll: async (): Promise<Order[]> => {
    // TODO (Phase 2): return (await apiClient.get<Order[]>('/orders/')).data
    return Promise.resolve([...mockOrders])
  },

  /** GET /api/orders/{id}/ */
  getById: async (id: string): Promise<Order | undefined> => {
    // TODO (Phase 2): return (await apiClient.get<Order>(`/orders/${id}/`)).data
    return Promise.resolve(mockOrders.find((o) => o.id === id))
  },

  /** GET /api/orders/track/{trackingId}/ — public */
  getByTrackingId: async (trackingId: string): Promise<Order | undefined> => {
    // TODO (Phase 2): return (await apiClient.get<Order>(`/orders/track/${trackingId}/`)).data
    return Promise.resolve(mockOrders.find((o) => o.trackingId === trackingId))
  },

  /** POST /api/orders/ */
  create: async (payload: Omit<Order, 'id' | 'trackingId' | 'createdAt'>): Promise<Order> => {
    // TODO (Phase 2): return (await apiClient.post<Order>('/orders/', payload)).data
    void payload
    throw new Error('ordersService.create() not yet connected to backend.')
  },

  /** PATCH /api/orders/{id}/ */
  update: async (id: string, payload: Partial<Order>): Promise<Order> => {
    // TODO (Phase 2): return (await apiClient.patch<Order>(`/orders/${id}/`, payload)).data
    void id; void payload
    throw new Error('ordersService.update() not yet connected to backend.')
  },

  /** POST /api/orders/{id}/post_to_baker/ */
  postToBaker: async (id: string): Promise<Order> => {
    // TODO (Phase 2): return (await apiClient.post<Order>(`/orders/${id}/post_to_baker/`)).data
    void id
    throw new Error('ordersService.postToBaker() not yet connected to backend.')
  },

  /** POST /api/orders/{id}/record_payment/ */
  recordPayment: async (id: string, amount: number, method: string): Promise<Order> => {
    // TODO (Phase 2): return (await apiClient.post<Order>(`/orders/${id}/record_payment/`, { amount, method })).data
    void id; void amount; void method
    throw new Error('ordersService.recordPayment() not yet connected to backend.')
  },

  /** POST /api/orders/{id}/dispatch/ */
  dispatch: async (id: string, driverId: string): Promise<Order> => {
    // TODO (Phase 2): return (await apiClient.post<Order>(`/orders/${id}/dispatch/`, { driver_id: driverId })).data
    void id; void driverId
    throw new Error('ordersService.dispatch() not yet connected to backend.')
  },

  /** Generic status advance: quality_check, mark_packing, mark_ready, mark_delivered */
  advanceStatus: async (id: string, toStatus: OrderStatus): Promise<Order> => {
    // TODO (Phase 2): return (await apiClient.post<Order>(`/orders/${id}/${toStatus}/`)).data
    void id; void toStatus
    throw new Error('ordersService.advanceStatus() not yet connected to backend.')
  },
}
