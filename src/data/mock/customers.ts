// ---- MOCK CUSTOMER DATA ----
// TODO (Phase 3): Replace with customersService.getAll() from @/lib/api/services/customers

import type { CustomerRecord } from '@/types/customer'

export const mockCustomers: CustomerRecord[] = [
  { id: 'CUS-001', name: 'Sarah Johnson', phone: '+255 755 012 345', email: 'sarah@email.com', isGold: true, totalOrders: 12, totalSpent: 890000, lastOrderDate: '2026-02-06', notes: 'Loyal customer, prefers chocolate' },
  { id: 'CUS-002', name: 'Mike Chen', phone: '+255 712 045 678', isGold: false, totalOrders: 3, totalSpent: 82000, lastOrderDate: '2026-02-06' },
  { id: 'CUS-003', name: 'Emma Williams', phone: '+255 784 078 901', isGold: true, totalOrders: 8, totalSpent: 1250000, lastOrderDate: '2026-02-03', notes: 'Event planner, bulk orders' },
  { id: 'CUS-004', name: 'David Brown', phone: '+255 755 032 100', isGold: true, totalOrders: 15, totalSpent: 560000, lastOrderDate: '2026-02-06', notes: 'Cafe owner, weekly bulk' },
  { id: 'CUS-005', name: 'Lisa Anderson', phone: '+255 713 065 400', isGold: false, totalOrders: 5, totalSpent: 310000, lastOrderDate: '2026-02-06' },
  { id: 'CUS-006', name: 'Grace Okonkwo', phone: '+255 754 123 456', isGold: false, totalOrders: 2, totalSpent: 195000, lastOrderDate: '2026-02-04' },
  { id: 'CUS-007', name: 'Peter Kamau', phone: '+255 756 135 700', isGold: true, totalOrders: 9, totalSpent: 720000, lastOrderDate: '2026-02-06' },
  { id: 'CUS-008', name: 'Angela Mbeki', phone: '+255 787 246 800', isGold: false, totalOrders: 1, totalSpent: 44000, lastOrderDate: '2026-02-06' },
  { id: 'CUS-009', name: 'Fatima Osei', phone: '+255 715 369 000', isGold: false, totalOrders: 4, totalSpent: 198000, lastOrderDate: '2026-02-06' },
  { id: 'CUS-010', name: 'Tom Richards', phone: '+255 716 567 890', isGold: false, totalOrders: 6, totalSpent: 340000, lastOrderDate: '2026-02-06' },
]
