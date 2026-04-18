// ---- REPORTS SERVICE ----
// Phase 7: Activate API calls when Django report endpoints are ready.
// All report data is currently computed client-side from mock arrays in manager/reports/page.tsx.
//
// Django endpoints:
//   GET    /api/reports/daily/              ?date=YYYY-MM-DD
//   GET    /api/reports/revenue/            ?start=&end=
//   GET    /api/reports/expenses/           ?start=&end=
//   GET    /api/reports/debt_summary/
//   GET    /api/reports/staff_performance/

export interface DailySummary {
  date: string
  totalRevenue: number
  totalOrders: number
  ordersDelivered: number
  ordersInProgress: number
  totalExpenses: number
}

export interface RevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface ExpenseBreakdown {
  category: string
  total: number
  count: number
}

export const reportsService = {
  /** GET /api/reports/daily/?date=YYYY-MM-DD */
  getDailySummary: async (_date: string): Promise<DailySummary> => {
    // TODO (Phase 7): return (await apiClient.get<DailySummary>('/reports/daily/', { params: { date: _date } })).data
    throw new Error('reportsService.getDailySummary() not yet connected to backend.')
  },

  /** GET /api/reports/revenue/?start=&end= */
  getRevenue: async (_start: string, _end: string): Promise<RevenuePoint[]> => {
    // TODO (Phase 7): return (await apiClient.get<RevenuePoint[]>('/reports/revenue/', { params: { start: _start, end: _end } })).data
    throw new Error('reportsService.getRevenue() not yet connected to backend.')
  },

  /** GET /api/reports/expenses/?start=&end= */
  getExpenseBreakdown: async (_start: string, _end: string): Promise<ExpenseBreakdown[]> => {
    // TODO (Phase 7): return (await apiClient.get<ExpenseBreakdown[]>('/reports/expenses/', { params: { start: _start, end: _end } })).data
    throw new Error('reportsService.getExpenseBreakdown() not yet connected to backend.')
  },

  /** GET /api/reports/debt_summary/ */
  getDebtSummary: async (): Promise<{ totalOutstanding: number; overdueCount: number }> => {
    // TODO (Phase 7): return (await apiClient.get('/reports/debt_summary/')).data
    throw new Error('reportsService.getDebtSummary() not yet connected to backend.')
  },
}
