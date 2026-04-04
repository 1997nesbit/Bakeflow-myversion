// ---- FINANCE SERVICE ----
// Phase 5: Unified FinancialTransaction ledger.
// Revenue rows (order_payment, sale) are created server-side as side effects.
// Expense rows (stock_expense, business_expense) are created via POST /api/transactions/.

import { apiClient } from '@/lib/api/client'
import type { FinancialTransaction, NewExpensePayload } from '@/types/finance'
import type { PaginatedResponse } from '@/types/api'

export interface GetTransactionsParams {
  direction?: 'in' | 'out'
  type?: string
  start?: string
  end?: string
  signal?: AbortSignal
}

export const financeService = {
  /** GET /api/transactions/ */
  getTransactions: async (params: GetTransactionsParams = {}): Promise<PaginatedResponse<FinancialTransaction>> => {
    const { signal, ...queryParams } = params
    return (await apiClient.get<PaginatedResponse<FinancialTransaction>>('/transactions/', {
      params: queryParams,
      signal,
    })).data
  },

  /** POST /api/transactions/ — expense rows only (direction='out') */
  createExpense: async (payload: NewExpensePayload): Promise<FinancialTransaction> => {
    return (await apiClient.post<FinancialTransaction>('/transactions/', payload)).data
  },
}
