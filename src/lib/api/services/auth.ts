// ---- AUTH SERVICE ----
// Phase 1: Activate this service when the Django auth endpoints are ready.
//
// Django endpoints:
//   POST /api/auth/token/          → login
//   POST /api/auth/token/refresh/  → refresh access token
//   POST /api/auth/logout/         → blacklist refresh token

import type { StaffRole } from '@/types/staff'

export interface LoginCredentials {
  username: string   // email or phone
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthUser {
  id: string
  name: string
  role: StaffRole
  email: string
  phone: string
}

// ─── PLACEHOLDER ─────────────────────────────────────────────────────────────
// Currently each portal validates credentials locally against hardcoded arrays
// and writes a name string to localStorage.
//
// TODO (Phase 1): Replace portal login pages with calls to authService.login()
// The returned JWT should be stored via an AuthContext, not localStorage directly.
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * TODO (Phase 1): Replace body with:
   *   const { data } = await apiClient.post<AuthTokens>('/auth/token/', credentials)
   *   localStorage.setItem('bakeflow_access_token', data.access)
   *   localStorage.setItem('bakeflow_refresh_token', data.refresh)
   *   return data
   */
  login: async (_credentials: LoginCredentials): Promise<AuthTokens> => {
    throw new Error('authService.login() not yet connected to backend.')
  },

  /**
   * TODO (Phase 1): Replace body with:
   *   await apiClient.post('/auth/logout/', { refresh: localStorage.getItem('bakeflow_refresh_token') })
   *   localStorage.clear()
   */
  logout: async (): Promise<void> => {
    throw new Error('authService.logout() not yet connected to backend.')
  },

  /**
   * TODO (Phase 1): Replace body with:
   *   const { data } = await apiClient.get<AuthUser>('/auth/me/')
   *   return data
   */
  getMe: async (): Promise<AuthUser> => {
    throw new Error('authService.getMe() not yet connected to backend.')
  },
}
