// ---- FINANCE TYPES ----

export type TransactionDirection = 'in' | 'out'

export type TransactionType =
  | 'order_payment'
  | 'sale'
  | 'stock_expense'
  | 'business_expense'

export type RecurringPeriod = 'weekly' | 'monthly' | 'yearly'

export interface FinancialTransaction {
  id: string
  date: string
  amount: number
  direction: TransactionDirection
  type: TransactionType
  paymentMethod: string | null
  description: string
  recordedBy: string         // serializer returns recorded_by.name flat string
  orderId?: string | null
  saleId?: string | null
  // Expense-only fields — absent on revenue rows
  category?: string
  paidTo?: string
  receiptRef?: string
  notes?: string
  recurring: boolean
  recurringPeriod?: RecurringPeriod | null
  createdAt: string
}

export interface NewExpensePayload {
  date: string
  amount: number
  type: 'stock_expense' | 'business_expense'
  payment_method: string
  description: string
  category: string
  paid_to: string
  receipt_ref?: string
  notes?: string
  recurring: boolean
  recurring_period?: RecurringPeriod
}

export interface TransactionTypeSummary {
  total: number
  count: number
}

export interface TransactionSummary {
  total: number
  count: number
  byType: {
    order_payment: TransactionTypeSummary
    sale:          TransactionTypeSummary
    stock_expense: TransactionTypeSummary
    business_expense: TransactionTypeSummary
  }
}

// DebtRecord stays on mock until debts are activated
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
