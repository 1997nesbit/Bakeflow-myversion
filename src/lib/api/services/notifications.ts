// ---- NOTIFICATIONS SERVICE ----

import type {
  MessageTemplate,
  Campaign,
  CampaignCreatePayload,
  NotificationLog,
} from '@/types/notification'
import type { PaginatedResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

const BASE = '/notifications'

export const notificationsService = {

  // ── Templates ─────────────────────────────────────────────────────────────

  getTemplates: async (): Promise<PaginatedResponse<MessageTemplate>> => {
    return (await apiClient.get<PaginatedResponse<MessageTemplate>>(`${BASE}/templates/`)).data
  },

  createTemplate: async (payload: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    return (await apiClient.post<MessageTemplate>(`${BASE}/templates/`, payload)).data
  },

  updateTemplate: async (id: string, payload: Partial<MessageTemplate>): Promise<MessageTemplate> => {
    return (await apiClient.patch<MessageTemplate>(`${BASE}/templates/${id}/`, payload)).data
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/templates/${id}/`)
  },

  // ── Campaigns ─────────────────────────────────────────────────────────────

  getCampaigns: async (): Promise<PaginatedResponse<Campaign>> => {
    return (await apiClient.get<PaginatedResponse<Campaign>>(`${BASE}/campaigns/`)).data
  },

  sendCampaign: async (payload: CampaignCreatePayload): Promise<Campaign> => {
    return (await apiClient.post<Campaign>(`${BASE}/campaigns/send/`, payload)).data
  },

  // ── Logs ──────────────────────────────────────────────────────────────────

  getLogs: async (): Promise<PaginatedResponse<NotificationLog>> => {
    return (await apiClient.get<PaginatedResponse<NotificationLog>>(`${BASE}/logs/`)).data
  },
}
