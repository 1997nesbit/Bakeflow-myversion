// ---- FINANCE SERVICE ----
// Phase 5: Activate API calls when Django finance endpoints are ready.
//
// Django endpoints:
//   GET    /api/expenses/            ?type=stock|business&start=&end=
//   POST   /api/expenses/
//   GET    /api/debts/               ?status=overdue|pending|partial
//   GET    /api/debts/{id}/
//   POST   /api/debts/{id}/pay/
//   GET    /api/payments/

import type { Expense, BusinessExpense, DebtRecord } from '@/types/finance'
import { mockExpenses, mockBusinessExpenses, mockDebts } from '@/data/mock/finance'

export const financeService = {
  /** GET /api/expenses/?type=stock */
  getStockExpenses: async (): Promise<Expense[]> => {
    // TODO (Phase 5): return (await apiClient.get<Expense[]>('/expenses/', { params: { type: 'stock' } })).data
    return Promise.resolve([...mockExpenses])
  },

  /** GET /api/expenses/?type=business */
  getBusinessExpenses: async (): Promise<BusinessExpense[]> => {
    // TODO (Phase 5): return (await apiClient.get<BusinessExpense[]>('/expenses/', { params: { type: 'business' } })).data
    return Promise.resolve([...mockBusinessExpenses])
  },

  /** POST /api/expenses/ */
  createExpense: async (payload: Omit<Expense, 'id'>): Promise<Expense> => {
    // TODO (Phase 5): return (await apiClient.post<Expense>('/expenses/', payload)).data
    void payload
    throw new Error('financeService.createExpense() not yet connected to backend.')
  },

  /** POST /api/expenses/ (business type) */
  createBusinessExpense: async (payload: Omit<BusinessExpense, 'id'>): Promise<BusinessExpense> => {
    // TODO (Phase 5): return (await apiClient.post<BusinessExpense>('/expenses/', { ...payload, expense_type: 'business' })).data
    void payload
    throw new Error('financeService.createBusinessExpense() not yet connected to backend.')
  },

  /** GET /api/debts/ */
  getDebts: async (): Promise<DebtRecord[]> => {
    // TODO (Phase 5): return (await apiClient.get<DebtRecord[]>('/debts/')).data
    return Promise.resolve([...mockDebts])
  },

  /** POST /api/debts/{id}/pay/ */
  recordDebtPayment: async (debtId: string, amount: number): Promise<DebtRecord> => {
    // TODO (Phase 5): return (await apiClient.post<DebtRecord>(`/debts/${debtId}/pay/`, { amount })).data
    void debtId; void amount
    throw new Error('financeService.recordDebtPayment() not yet connected to backend.')
  },
}
