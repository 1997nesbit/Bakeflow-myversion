// ---- STAFF SERVICE ----
// Phase 6: Activate API calls when Django staff endpoints are ready.
//
// Django endpoints:
//   GET    /api/staff/
//   POST   /api/staff/
//   PATCH  /api/staff/{id}/
//   POST   /api/staff/{id}/deactivate/

import type { StaffMember } from '@/types/staff'
import { mockStaff } from '@/data/mock/staff'

export const staffService = {
  /** GET /api/staff/ */
  getAll: async (): Promise<StaffMember[]> => {
    // TODO (Phase 6): return (await apiClient.get<StaffMember[]>('/staff/')).data
    return Promise.resolve([...mockStaff])
  },

  /** POST /api/staff/ */
  create: async (payload: Omit<StaffMember, 'id'>): Promise<StaffMember> => {
    // TODO (Phase 6): return (await apiClient.post<StaffMember>('/staff/', payload)).data
    void payload
    throw new Error('staffService.create() not yet connected to backend.')
  },

  /** PATCH /api/staff/{id}/ */
  update: async (id: string, payload: Partial<StaffMember>): Promise<StaffMember> => {
    // TODO (Phase 6): return (await apiClient.patch<StaffMember>(`/staff/${id}/`, payload)).data
    void id; void payload
    throw new Error('staffService.update() not yet connected to backend.')
  },

  /** POST /api/staff/{id}/deactivate/ */
  deactivate: async (id: string): Promise<void> => {
    // TODO (Phase 6): await apiClient.post(`/staff/${id}/deactivate/`)
    void id
    throw new Error('staffService.deactivate() not yet connected to backend.')
  },
}
