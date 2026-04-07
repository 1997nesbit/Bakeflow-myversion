// ---- STAFF SERVICE ----
// Phase 3: Active — all calls go to the Django REST API.
//
// Django endpoints:
//   GET    /api/staff/
//   POST   /api/staff/
//   PATCH  /api/staff/{id}/
//   POST   /api/staff/{id}/deactivate/

import type { StaffMember, CreateStaffPayload } from '@/types/staff'
import type { PaginatedResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export const staffService = {
  /** GET /api/staff/ */
  getAll: async (options?: { signal?: AbortSignal }): Promise<PaginatedResponse<StaffMember>> => {
    return (await apiClient.get<PaginatedResponse<StaffMember>>('/staff/', { signal: options?.signal })).data
  },

  /** POST /api/staff/ */
  create: async (payload: CreateStaffPayload): Promise<StaffMember> => {
    return (await apiClient.post<StaffMember>('/staff/', payload)).data
  },

  /** PATCH /api/staff/{id}/ */
  update: async (id: string, payload: Partial<StaffMember> & { password?: string }): Promise<StaffMember> => {
    return (await apiClient.patch<StaffMember>(`/staff/${id}/`, payload)).data
  },

  /** POST /api/staff/{id}/deactivate/ */
  deactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/staff/${id}/deactivate/`)
  },
}
