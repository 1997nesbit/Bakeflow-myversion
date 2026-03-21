// ---- CUSTOMER TYPES ----

export interface CustomerRecord {
  id: string
  name: string
  phone: string
  email?: string
  isGold: boolean
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
  notes?: string
}
