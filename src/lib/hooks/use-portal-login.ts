'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/api/services/auth'
import { setAccessToken } from '@/lib/api/client'
import { handleApiError } from '@/lib/utils/handle-error'

export function usePortalLogin({ redirectPath }: { redirectPath: string }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)

    try {
      const data = await authService.login({ username, password })
      setAccessToken(data.access)
      router.push(redirectPath)
    } catch (err) {
      setLoading(false)
      handleApiError(err)
    }
  }

  return {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    loading,
    handleLogin,
  }
}
