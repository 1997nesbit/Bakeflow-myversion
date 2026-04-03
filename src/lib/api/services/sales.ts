// ---- SALES SERVICE ----
// Walk-in / point-of-sale transactions. No customer record, no production pipeline.
//
// Django endpoints:
//   POST /api/sales/
//   GET  /api/sales/

import type { Sale, NewSaleData } from '@/types/sale'
import { apiClient } from '@/lib/api/client'

export const salesService = {
  /** POST /api/sales/ — record a completed walk-in sale */
  create: async (payload: NewSaleData): Promise<Sale> => {
    return (await apiClient.post<Sale>('/sales/', payload)).data
  },
}
