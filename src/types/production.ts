// ---- PRODUCTION TYPES ----

export interface BatchIngredient {
  id: string
  rollout: string             // UUID of DailyRollout
  itemName: string
  itemUnit: string
  quantityUsed: number
}

export interface BatchIngredientPayload {
  rolloutId: string
  quantityUsed: number
}

export interface DailyBatchItem {
  id: string
  productName: string
  quantityBaked: number
  quantityRemaining: number
  bakedBy: string
  bakedAt: string
  notes?: string
  ingredients: BatchIngredient[]
}

/** Payload sent to POST /api/production/batches/ */
export interface NewBatchPayload {
  productName: string
  quantityBaked: number
  notes?: string
  ingredients: BatchIngredientPayload[]
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
