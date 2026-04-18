// ---- MESSAGING SERVICE ----
// Phase 8: Activate API calls when Django messaging endpoints are ready.
//
// Django endpoints:
//   GET    /api/messages/
//   POST   /api/messages/
//   POST   /api/messages/bulk/

export interface Message {
  id: string
  recipientName: string
  recipientPhone: string
  recipientType: 'customer' | 'staff'
  body: string
  sentAt: string
  sentBy: string
  channel: 'sms' | 'whatsapp' | 'in_app'
}

export interface BulkMessagePayload {
  recipientIds: string[]
  recipientType: 'customer' | 'staff'
  body: string
  channel: 'sms' | 'whatsapp' | 'in_app'
}

export const messagingService = {
  /** GET /api/messages/ */
  getAll: async (): Promise<Message[]> => {
    // TODO (Phase 8): return (await apiClient.get<Message[]>('/messages/')).data
    return Promise.resolve([])
  },

  /** POST /api/messages/ */
  send: async (payload: Omit<Message, 'id' | 'sentAt'>): Promise<Message> => {
    // TODO (Phase 8): return (await apiClient.post<Message>('/messages/', payload)).data
    void payload
    throw new Error('messagingService.send() not yet connected to backend.')
  },

  /** POST /api/messages/bulk/ */
  sendBulk: async (payload: BulkMessagePayload): Promise<{ sent: number; failed: number }> => {
    // TODO (Phase 8): return (await apiClient.post('/messages/bulk/', payload)).data
    void payload
    throw new Error('messagingService.sendBulk() not yet connected to backend.')
  },
}
