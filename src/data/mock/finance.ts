// ---- MOCK FINANCE DATA ----
// mockExpenses and mockBusinessExpenses deleted in Phase 5 — replaced by FinancialTransaction API.
// mockDebts retained until Phase X activates DebtRecord endpoints.

import type { DebtRecord } from '@/types/finance'

export const mockDebts: DebtRecord[] = [
  { id: 'DBT-001', customerName: 'James Wilson', customerPhone: '+255 782 098 700', orderId: 'ORD-006', totalAmount: 34000, amountPaid: 0, balance: 34000, dueDate: '2026-02-06', status: 'overdue', createdAt: '2026-02-06T06:45:00' },
  { id: 'DBT-002', customerName: 'Emma Williams', customerPhone: '+255 784 078 901', orderId: 'ORD-003', totalAmount: 350000, amountPaid: 175000, balance: 175000, dueDate: '2026-02-08', status: 'partial', createdAt: '2026-02-03T11:00:00' },
  { id: 'DBT-003', customerName: 'Grace Okonkwo', customerPhone: '+255 754 123 456', orderId: 'ORD-007', totalAmount: 120000, amountPaid: 60000, balance: 60000, dueDate: '2026-02-08', status: 'partial', createdAt: '2026-02-04T10:00:00' },
]
