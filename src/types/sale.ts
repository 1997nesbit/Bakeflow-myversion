import type { PaymentMethod } from './order'

export interface SaleItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface Sale {
  id: string
  items: SaleItem[]
  totalPrice: number
  paymentMethod: PaymentMethod
  servedBy: string
  customerName?: string
  createdAt: string
}

export interface NewSaleData {
  items: SaleItem[]
  totalPrice: number
  paymentMethod: PaymentMethod
  customerName?: string
}
