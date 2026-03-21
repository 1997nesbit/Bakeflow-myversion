// ---- FINANCE TYPES ----

export type ExpenseCategory =
  | 'raw_materials'
  | 'packaging'
  | 'equipment'
  | 'storage'
  | 'delivery_logistics'
  | 'wastage'
  | 'miscellaneous'

export interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  date: string
  paidTo: string
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque'
  receiptRef?: string
  notes?: string
  recurring: boolean
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly'
  addedBy: string
}

export type BusinessExpenseCategory =
  | 'rent'
  | 'salaries'
  | 'utilities'
  | 'marketing'
  | 'licenses'
  | 'transport'
  | 'cleaning'
  | 'misc'

export interface BusinessExpense {
  id: string
  title: string
  category: BusinessExpenseCategory
  amount: number
  date: string
  paidTo: string
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
  receiptRef?: string
  notes?: string
  recurring: boolean
}

export interface DebtRecord {
  id: string
  customerName: string
  customerPhone: string
  orderId: string
  totalAmount: number
  amountPaid: number
  balance: number
  dueDate: string
  status: 'overdue' | 'pending' | 'partial'
  createdAt: string
}
