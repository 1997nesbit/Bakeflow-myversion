'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getAccessToken, initAuth, clearAuth } from '@/lib/api/client'
import { authService } from '@/lib/api/services/auth'
import { handleApiError } from '@/lib/utils/handle-error'

export interface RoleAuthConfig {
  expectedRole: string
  loginPath: string
  defaultName?: string
  requireAuth?: boolean
}

interface JwtPayload {
  name: string
  role: string
  exp: number
}

export function useRoleAuth({
  expectedRole,
  loginPath,
  defaultName = 'User',
  requireAuth = true,
}: RoleAuthConfig) {
  const router = useRouter()
  const [userName, setUserName] = useState(defaultName)

  useEffect(() => {
    async function checkAuth() {
      let token = getAccessToken()

      if (!token) {
        const refreshed = await initAuth()
        if (!refreshed) {
          if (requireAuth) router.push(loginPath)
          return
        }
        token = getAccessToken()
      }

      try {
        const payload = jwtDecode<JwtPayload>(token!)
        if (payload.role !== expectedRole) {
          router.push(loginPath)
          return
        }
        setUserName(payload.name || defaultName)
      } catch {
        if (requireAuth) router.push(loginPath)
      }
    }

    checkAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      handleApiError(err)
    } finally {
      clearAuth()
      router.push(loginPath)
    }
  }

  return { userName, logout }
}
