// ---- TASK TYPES ----

import type { StaffRole } from './staff'

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface TaskItem {
  id: string
  title: string
  description?: string
  assignedTo: string
  assignedRole: StaffRole
  priority: TaskPriority
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
  createdAt: string
  completedAt?: string
}
