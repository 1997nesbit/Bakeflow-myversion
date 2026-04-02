// Central mock data export — import all mock arrays from here.
// Each export here will be replaced by an API service call as backend phases are completed.
//
// Phase mapping:
//   Phase 2 → orders, production — RETIRED (real API active)
//   Phase 3 → customers (mockCustomers)
//   Phase 4 → inventory (mockInventory, mockSuppliers, mockStockEntries, mockDailyRollouts)
//   Phase 5 → finance (mockDebts, mockExpenses, mockBusinessExpenses)
//   Phase 6 → staff, tasks (mockStaff, mockTasks)

export * from './inventory'
export * from './staff'
export * from './customers'
export * from './finance'
export * from './tasks'
