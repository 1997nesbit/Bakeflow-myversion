'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DemoCredential } from '@/config/demo-credentials'
import { DEMO_LOGIN_DELAY_MS } from '@/config/constants'

interface UsePortalLoginOptions {
  credentials: DemoCredential[]
  storageKey: string
  redirectPath: string
  /** Extra credential fields to persist in localStorage (e.g. 'role'). */
  extraFields?: string[]
}

/**
 * Shared login logic for all portals.
 * TODO (Phase 1): Replace the setTimeout body with authService.login() and
 * remove the credentials/storageKey/extraFields options entirely.
 */
export function usePortalLogin({
  credentials,
  storageKey,
  redirectPath,
  extraFields = [],
}: UsePortalLoginOptions) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setError('')

    // TODO (Phase 1): Replace with:
    //   const tokens = await authService.login({ username, password })
    //   store tokens, redirect
    setTimeout(() => {
      const match = credentials.find(
        (c) => c.username === username.toLowerCase() && c.password === password,
      )

      if (match) {
        const payload: Record<string, string> = {
          name: match.displayName,
          username: match.username,
          loggedInAt: new Date().toISOString(),
        }
        extraFields.forEach((field) => {
          if (match[field as keyof DemoCredential]) {
            payload[field] = match[field as keyof DemoCredential] as string
          }
        })
        localStorage.setItem(storageKey, JSON.stringify(payload))
        router.push(redirectPath)
      } else if (username && password) {
        setError('Invalid username or password')
      } else {
        setError('Please enter your credentials')
      }

      setLoading(false)
    }, DEMO_LOGIN_DELAY_MS)
  }

  return {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    error,
    loading,
    handleLogin,
  }
}
