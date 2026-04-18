// ---- ORDER TYPES ----

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'baker'
  | 'decorator'
  | 'quality'
  | 'packing'
  | 'ready'
  | 'dispatched'
  | 'delivered'

export type OrderType = 'menu' | 'custom'
export type DeliveryType = 'pickup' | 'delivery'
export type PaymentStatus = 'unpaid' | 'deposit' | 'paid'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'card' | 'cheque'
export type PaymentTerms = 'upfront' | 'on_delivery'

/** Nested customer object returned by the backend on every order response. */
export interface OrderCustomer {
  id: string
  name: string
  phone: string
  email?: string
  isGold: boolean
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  estimatedMinutes: number
  description?: string
  isActive?: boolean
  stockToday?: number
}

export interface CustomCakeDetails {
  flavour: string
  icingType: string
  kilogram: number
  description?: string
  noteForCustomer?: string
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
  customization?: string
  customCake?: CustomCakeDetails
  isCustom: boolean
}

export interface StatusHistoryEntry {
  fromStatus: string
  toStatus: string
  changedAt: string
}

/**
 * Order as returned by the Django API.
 * All fields are camelCase — djangorestframework-camel-case converts
 * the backend snake_case automatically.
 *
 * Customer data is a nested object (not flat fields).
 */
export interface Order {
  id: string
  trackingId: string
  customer: OrderCustomer
  orderType: OrderType
  items: OrderItem[]
  status: OrderStatus
  specialNotes?: string
  noteForCustomer?: string
  pickupDate: string
  pickupTime: string
  deliveryType: DeliveryType
  deliveryAddress?: string
  totalPrice: number
  amountPaid: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentTerms: PaymentTerms
  isAdvanceOrder: boolean
  estimatedMinutes: number
  createdAt: string
  postedToBakerAt?: string
  assignedTo?: string
  dispatchedAt?: string
  driverAccepted?: boolean
  driverDelivered?: boolean
  proofOfDelivery?: string   // URL returned by Django when a proof image is uploaded
  statusHistory?: StatusHistoryEntry[]
}

export interface OrderSummary {
  count: number
  totalRevenue: number
  totalPrice: number
  totalOutstanding: number
  byStatus: Record<OrderStatus, number>
  byPaymentMethod: Record<string, number>
}

export interface OverdueAlert {
  order: Order
  minutesOver: number
}

/** 
 * Exact shape of the public GET /api/orders/track/{tracking_id}/ response.
 * Reduced data payload for unauthenticated public access.
 */
export interface OrderTrackingResponse {
  trackingId: string
  status: OrderStatus
  pickupDate: string
  pickupTime: string
  deliveryType: DeliveryType
  customerName: string
  statusHistory: StatusHistoryEntry[]
}

/**
 * Sent to POST /api/orders/
 * Customer data is flat here — the backend's OrderService finds or creates
 * the Customer record from these fields.
 */
export interface NewOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderType: OrderType
  items: OrderItem[]
  specialNotes?: string
  pickupDate: string
  pickupTime: string
  deliveryType: DeliveryType
  deliveryAddress?: string
  totalPrice: number
  amountPaid: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentTerms: PaymentTerms
  isAdvanceOrder: boolean
  estimatedMinutes: number
}
