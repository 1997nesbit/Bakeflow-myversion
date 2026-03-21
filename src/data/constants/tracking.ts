// ---- PUBLIC ORDER TRACKING STAGES ----
// Defines the customer-facing tracking step display.
// These map multiple internal statuses to a single visible stage.

import type { OrderStatus } from '@/types/order'

export const trackingStages: {
  key: string
  label: string
  statuses: OrderStatus[]
}[] = [
  { key: 'baking', label: 'Baking & QA', statuses: ['baker', 'quality'] },
  { key: 'decorating', label: 'Decorating & Packing', statuses: ['decorator', 'packing'] },
  { key: 'ready', label: 'Ready', statuses: ['ready'] },
  { key: 'delivery', label: 'Delivery', statuses: ['dispatched', 'delivered'] },
]
