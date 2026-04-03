// ---- PRODUCTION TYPES ----

export interface DailyBatchItem {
  id: string
  menuItemId: string
  productName: string
  category: 'bread' | 'pastry' | 'snack' | 'cake'
  quantityBaked: number
  quantityRemaining: number
  bakedBy: string
  bakedAt: string
  notes?: string
}

/** Payload sent to POST /api/production/batches/ */
export interface NewBatchPayload {
  menuItemId: string
  quantityBaked: number
  notes?: string
}

export type FulfillmentMethod = 'from_batch' | 'bake_fresh'

export interface TimerState {
  startedAt: number
  elapsed: number
  running: boolean
}

export interface BulkBatch {
  id: string
  name: string
  orderIds: string[]
  notes: string
  createdAt: string
}

export interface FulfillmentChoice {
  orderId: string
  method: FulfillmentMethod
  batchItemId?: string
  batchItemName?: string
}
