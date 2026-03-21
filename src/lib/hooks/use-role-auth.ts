'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface RoleAuthConfig {
  storageKey: string
  loginPath: string
  defaultName: string
  /** Redirect to loginPath when no auth found. Defaults to true. */
  requireAuth?: boolean
}

// TODO (Phase 1): Replace the body of this hook with JWT-based auth:
//
//   import { getAccessToken, clearAuth } from '@/lib/api/client'
//   import { jwtDecode } from 'jwt-decode'
//   import { authService } from '@/lib/api/services/auth'
//
//   interface JwtPayload { name: string; role: string; exp: number }
//
//   - Read the access token from getAccessToken() (in-memory, not localStorage).
//   - If null, call initAuth() to try a silent refresh from the HttpOnly cookie.
//     If that also fails, redirect to loginPath.
//   - Decode the token with jwtDecode<JwtPayload>() to get name and role.
//   - Validate that the decoded role matches the expected role for this portal
//     (each portal's authConfig should include an expectedRole field).
//     Redirect to loginPath if role doesn't match.
//   - The storageKey and extraFields options can be removed entirely — the JWT
//     carries all identity information.
//
//   logout():
//     await authService.logout()   // blacklists refresh token server-side,
//                                  // Django clears the HttpOnly cookie via Set-Cookie
//     clearAuth()                  // clears the in-memory access token
//     router.push(loginPath)
//
//   The RoleAuthConfig interface will simplify to:
//     { loginPath: string; expectedRole: string; defaultName?: string; requireAuth?: boolean }

export function useRoleAuth({ storageKey, loginPath, defaultName, requireAuth = true }: RoleAuthConfig) {
  const router = useRouter()
  const [userName, setUserName] = useState(defaultName)

  useEffect(() => {
    const auth = localStorage.getItem(storageKey)
    if (!auth) {
      if (requireAuth) router.push(loginPath)
      return
    }
    try { setUserName(JSON.parse(auth).name || defaultName) }
    catch { if (requireAuth) router.push(loginPath) }
  }, [router])

  const logout = () => {
    localStorage.removeItem(storageKey)
    router.push(loginPath)
  }

  return { userName, logout }
}
