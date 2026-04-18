'use client'

import { useEffect } from 'react'
import { initAuth } from '@/lib/api/client'

/**
 * Mounts invisibly in the root layout and calls initAuth() once on app load.
 * This silently restores the access token from the HttpOnly refresh cookie,
 * so users don't need to log in again after a page refresh.
 */
export function AuthBootstrap() {
  useEffect(() => {
    initAuth()
  }, [])

  return null
}
