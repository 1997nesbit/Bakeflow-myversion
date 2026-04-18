// ---- TASKS SERVICE ----
// Phase 6: Activate API calls when Django task endpoints are ready.
//
// Django endpoints:
//   GET    /api/tasks/       ?role=&status=&assigned_to=
//   POST   /api/tasks/
//   PATCH  /api/tasks/{id}/
//   POST   /api/tasks/{id}/complete/

import type { TaskItem } from '@/types/task'
import { mockTasks } from '@/data/mock/tasks'

export const tasksService = {
  /** GET /api/tasks/ */
  getAll: async (): Promise<TaskItem[]> => {
    // TODO (Phase 6): return (await apiClient.get<TaskItem[]>('/tasks/')).data
    return Promise.resolve([...mockTasks])
  },

  /** POST /api/tasks/ */
  create: async (payload: Omit<TaskItem, 'id' | 'createdAt' | 'completedAt'>): Promise<TaskItem> => {
    // TODO (Phase 6): return (await apiClient.post<TaskItem>('/tasks/', payload)).data
    void payload
    throw new Error('tasksService.create() not yet connected to backend.')
  },

  /** PATCH /api/tasks/{id}/ */
  update: async (id: string, payload: Partial<TaskItem>): Promise<TaskItem> => {
    // TODO (Phase 6): return (await apiClient.patch<TaskItem>(`/tasks/${id}/`, payload)).data
    void id; void payload
    throw new Error('tasksService.update() not yet connected to backend.')
  },

  /** POST /api/tasks/{id}/complete/ */
  complete: async (id: string): Promise<TaskItem> => {
    // TODO (Phase 6): return (await apiClient.post<TaskItem>(`/tasks/${id}/complete/`)).data
    void id
    throw new Error('tasksService.complete() not yet connected to backend.')
  },
}
