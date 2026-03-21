// ---- API CLIENT ----
// TODO (Phase 1): Install axios: `npm install axios`
// TODO (Phase 1): Populate NEXT_PUBLIC_API_URL in .env.local
//
// This module will be the single entry point for all HTTP communication with the Django backend.
// When the backend is ready, uncomment the axios implementation below and delete the mock stub.

// ─── PLACEHOLDER (active during mock phase) ──────────────────────────────────
// The mock services import directly from @/data/mock — this client is not yet used.
// ─────────────────────────────────────────────────────────────────────────────

/*
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to .env.local')
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bakeflow_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: handle 401 / token refresh ─────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('bakeflow_refresh_token')
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })
        localStorage.setItem('bakeflow_access_token', data.access)
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — redirect to login
        localStorage.clear()
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  }
)
*/

export {}
