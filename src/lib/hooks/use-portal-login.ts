'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'
import { authService } from '@/lib/api/services/auth'
import { setAccessToken } from '@/lib/api/client'
import { handleApiError } from '@/lib/utils/handle-error'
import type { StaffRole } from '@/types/staff'

interface JwtPayload {
  role: string
}

export function usePortalLogin({ redirectPath, expectedRole }: { redirectPath: string; expectedRole?: StaffRole }) {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e?: { preventDefault(): void }) => {
    e?.preventDefault()
    setLoading(true)

    try {
      const data = await authService.login({ username, password })
      if (expectedRole) {
        const payload = jwtDecode<JwtPayload>(data.access)
        if (payload.role !== expectedRole) {
          setLoading(false)
          toast.error("This account doesn't have access to this portal.")
          return
        }
      }
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
