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
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
export type PaymentTerms = 'upfront' | 'on_delivery'

export interface MenuItem {
  id: string
  name: string
  category: 'cake' | 'bread' | 'pastry' | 'snack' | 'beverage'
  price: number
  estimatedMinutes: number
  description?: string
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

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderType: OrderType
  items: OrderItem[]
  status: OrderStatus
  specialNotes?: string
  cakeDescription?: string
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
  trackingId: string
  isGoldCustomer?: boolean
}

export interface OverdueAlert {
  order: Order
  minutesOver: number
}

export interface NewOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderType: OrderType
  items: OrderItem[]
  specialNotes?: string
  cakeDescription?: string
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
  trackingId: string
  isGoldCustomer?: boolean
}
