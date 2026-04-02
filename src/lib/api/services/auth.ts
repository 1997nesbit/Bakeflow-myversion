import { apiClient } from '@/lib/api/client'
import type { StaffRole } from '@/types/staff'

export interface LoginCredentials {
  username: string   // email or phone
  password: string
}

export interface AuthTokens {
  access: string
}

export interface AuthUser {
  id: string
  name: string
  role: StaffRole
  email: string
  phone: string
  avatar_url: string | null
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const { data } = await apiClient.post<AuthTokens>('/auth/token/', credentials)
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout/')
  },

  getMe: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<AuthUser>('/auth/me/')
    return data
  },
}
