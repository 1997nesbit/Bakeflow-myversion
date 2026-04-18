// Auth strategy: Option C — in-memory access token + HttpOnly cookie refresh token.
//
//   Access token  → stored only in the module-level `accessToken` variable.
//                   Never written to localStorage or sessionStorage.
//                   Lost on page refresh — recovered via initAuth() on app load.
//
//   Refresh token → lives exclusively in an HttpOnly SameSite=Strict cookie
//                   set by the Django backend on login and refresh responses.
//                   JS cannot read it at all. XSS cannot steal it.

import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set. Add it to .env.local')
}

// ── In-memory token store ────────────────────────────────────────────────────
// The access token lives only here. A page refresh clears it — initAuth()
// recovers it silently from the HttpOnly refresh cookie on every app load.

let accessToken: string | null = null
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }
  if (token) scheduleProactiveRefresh(token)
}

// ── Proactive refresh ────────────────────────────────────────────────────────
// Decodes the access token expiry and schedules a silent refresh 1 minute
// before it expires. Prevents the user from hitting a 401 mid-form-submission.

function scheduleProactiveRefresh(token: string): void {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    const msUntilExpiry = exp * 1000 - Date.now()
    const refreshAt = msUntilExpiry - 60_000  // 1 minute early

    if (refreshAt > 0) {
      proactiveRefreshTimer = setTimeout(() => {
        silentRefresh()
      }, refreshAt)
    }
  } catch {
    // Malformed token — let the 401 interceptor handle it reactively
  }
}

// ── Silent refresh ───────────────────────────────────────────────────────────
// Calls /auth/token/refresh/ using the HttpOnly cookie (withCredentials: true).
// Backend reads the cookie, validates it, and returns a new access token in the
// JSON body. The rotated refresh cookie is set automatically via Set-Cookie.

async function silentRefresh(): Promise<boolean> {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/token/refresh/`,
      {},
      { withCredentials: true },  // sends the HttpOnly refresh cookie
    )
    setAccessToken(data.access)
    return true
  } catch {
    setAccessToken(null)
    return false
  }
}

// ── initAuth ─────────────────────────────────────────────────────────────────
// Call once on app startup (root layout) to restore auth state.
// If the refresh cookie is present and valid, the user is silently re-authed.

export async function initAuth(): Promise<boolean> {
  return silentRefresh()
}

// ── clearAuth ────────────────────────────────────────────────────────────────
// Call after logout. The backend also blacklists the token and clears the cookie.

export function clearAuth(): void {
  setAccessToken(null)
}

// ── Axios instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
  withCredentials: true,  // required so the refresh cookie is sent on every request
})

// ── Request interceptor: attach in-memory access token ───────────────────────

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: reactive 401 fallback ──────────────────────────────
// The proactive refresh should prevent most 401s. This is the safety net for
// when the access token expires before the scheduled refresh fires.

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshed = await silentRefresh()

      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${getAccessToken()}`
        return apiClient(originalRequest)
      }

      // Refresh also failed (cookie expired or blacklisted) — force login
      clearAuth()
      window.location.href = '/'
    }

    return Promise.reject(error)
  },
)
