'use client'

import { ChefHat, Eye, EyeOff } from 'lucide-react'
import { usePortalLogin } from '@/lib/hooks/use-portal-login'

export function ManagerLogin() {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    loading,
    handleLogin,
  } = usePortalLogin({ redirectPath: '/manager' })

  return (
    <div className="min-h-screen flex items-center justify-center bg-manager-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ChefHat className="h-7 w-7 text-white" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-white">Manager Portal</h1>
          <p className="text-sm text-white/40 mt-1">Bbr Bakeflow Administration</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
          <div>
            <label htmlFor="username" className="text-xs font-medium text-white/60 mb-1 block">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs font-medium text-white/60 mb-1 block">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none pr-10"
                placeholder="Enter password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleLogin()}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-white/25">
          Contact your manager for access
        </p>
      </div>
    </div>
  )
}
