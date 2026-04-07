// ---- UI LABEL & COLOR CONSTANTS ----
// These stay in the frontend permanently — they are display/presentation concerns.

import type { OrderStatus, OrderType, PaymentMethod } from '@/types/order'
import type { StaffRole } from '@/types/staff'

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending Payment',
  paid: 'Paid - Ready to Post',
  baker: 'With Baker',
  decorator: 'Decorating',
  quality: 'Quality Check',
  packing: 'Packing',
  ready: 'Ready',
  dispatched: 'With Driver',
  delivered: 'Delivered / Picked Up',
}

export const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  baker: 'bg-orange-100 text-orange-800',
  decorator: 'bg-pink-100 text-pink-800',
  quality: 'bg-blue-100 text-blue-800',
  packing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-green-100 text-green-800',
  dispatched: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
}

/** For use on dark (manager portal) backgrounds */
export const statusColorsDark: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-300',
  paid: 'bg-green-500/20 text-green-300',
  baker: 'bg-orange-500/20 text-orange-300',
  decorator: 'bg-pink-500/20 text-pink-300',
  quality: 'bg-blue-500/20 text-blue-300',
  packing: 'bg-indigo-500/20 text-indigo-300',
  ready: 'bg-emerald-500/20 text-emerald-300',
  dispatched: 'bg-purple-500/20 text-purple-300',
  delivered: 'bg-gray-500/20 text-gray-400',
}

export const priorityColorsDark: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-blue-500/20 text-blue-300',
  low: 'bg-gray-500/20 text-gray-400',
}

export const orderTypeLabels: Record<OrderType, string> = {
  menu: 'Menu Order',
  custom: 'Custom Order',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  card: 'Card',
  cheque: 'Cheque',
}

export const staffRoleLabels: Record<StaffRole, string> = {
  manager: 'Manager',
  front_desk: 'Front Desk',
  baker: 'Baker',
  decorator: 'Decorator',
  driver: 'Driver',
  inventory_clerk: 'Inventory Clerk',
}
