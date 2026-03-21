// Central API services export — import all services from here.

export { authService } from './services/auth'
export { ordersService } from './services/orders'
export { inventoryService } from './services/inventory'
export { customersService } from './services/customers'
export { financeService } from './services/finance'
export { staffService } from './services/staff'
export { tasksService } from './services/tasks'
export { reportsService } from './services/reports'
export { messagingService } from './services/messaging'

export type { LoginCredentials, AuthTokens, AuthUser } from './services/auth'
export type { DailySummary, RevenuePoint, ExpenseBreakdown } from './services/reports'
export type { Message, BulkMessagePayload } from './services/messaging'
