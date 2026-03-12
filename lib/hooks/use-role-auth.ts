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
