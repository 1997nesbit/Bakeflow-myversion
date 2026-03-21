// ---- PRODUCTION TYPES ----

export interface DailyBatchItem {
  id: string
  productName: string
  category: 'bread' | 'pastry' | 'snack' | 'cake'
  quantityBaked: number
  quantityRemaining: number
  unit: string
  bakedBy: string
  bakedAt: string
  ovenTemp?: string
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
