// ---- MOCK TASK DATA ----
// TODO (Phase 6): Replace with tasksService.getAll() from @/lib/api/services/tasks

import type { TaskItem } from '@/types/task'

export const mockTasks: TaskItem[] = [
  { id: 'TSK-001', title: 'Deep clean oven #2', description: 'Full disassembly and clean after element replacement', assignedTo: 'Baker John', assignedRole: 'baker', priority: 'high', status: 'in_progress', dueDate: '2026-02-07', createdAt: '2026-02-05T09:00:00' },
  { id: 'TSK-002', title: 'Restock cake box inventory', description: 'Small boxes below minimum. Contact PackRight for urgent delivery.', assignedTo: 'Mary Kendi', assignedRole: 'inventory_clerk', priority: 'urgent', status: 'pending', dueDate: '2026-02-06', createdAt: '2026-02-06T07:00:00' },
  { id: 'TSK-003', title: 'Update menu board photos', assignedTo: 'Sarah Mwangi', assignedRole: 'front_desk', priority: 'low', status: 'pending', dueDate: '2026-02-10', createdAt: '2026-02-05T14:00:00' },
  { id: 'TSK-004', title: 'Prepare Valentine special pricing', description: 'Create pricing for Valentine heart cakes and cupcake sets', assignedTo: 'Admin Manager', assignedRole: 'manager', priority: 'high', status: 'in_progress', dueDate: '2026-02-12', createdAt: '2026-02-04T10:00:00' },
  { id: 'TSK-005', title: 'Deliver wedding cake to Hyatt', description: 'ORD-003 delivery on Feb 8, coordinate with Emma', assignedTo: 'Tom Martinez', assignedRole: 'driver', priority: 'high', status: 'pending', dueDate: '2026-02-08', createdAt: '2026-02-06T08:00:00' },
  { id: 'TSK-006', title: 'Practice new fondant flower technique', assignedTo: 'Rose Otieno', assignedRole: 'decorator', priority: 'medium', status: 'completed', dueDate: '2026-02-05', createdAt: '2026-02-03T09:00:00', completedAt: '2026-02-05T16:00:00' },
  { id: 'TSK-007', title: 'Verify supplier invoices for Jan', description: 'Cross-check all January supplier invoices with stock entries', assignedTo: 'Mary Kendi', assignedRole: 'inventory_clerk', priority: 'medium', status: 'completed', dueDate: '2026-02-05', createdAt: '2026-02-01T09:00:00', completedAt: '2026-02-04T17:00:00' },
]
