'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'
import { usePortalLogin } from '@/lib/hooks/use-portal-login'
import type { StaffRole } from '@/types/staff'

interface PortalLoginFormProps {
  /** Page title, e.g. "Front Desk" */
  title: string
  /** Subtitle below the title */
  subtitle: string
  /** Icon rendered inside the gradient circle */
  icon: ReactNode
  /** CSS gradient string for the icon circle and submit button */
  gradient: string
  /** Path to redirect to on successful login */
  redirectPath: string
  /** Role that must be present in the JWT for login to succeed */
  expectedRole?: StaffRole
}

export function PortalLoginForm({
  title,
  subtitle,
  icon,
  gradient,
  redirectPath,
  expectedRole,
}: PortalLoginFormProps) {
  const {
    username, setUsername,
    password, setPassword,
    showPassword, setShowPassword,
    loading,
    handleLogin,
  } = usePortalLogin({ redirectPath, expectedRole })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf2f4] via-white to-[#fce7ea]">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #e66386 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />

      <Card className="relative w-full max-w-md mx-4 shadow-2xl border-0 bg-card">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: gradient }}
            >
              {icon}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base text-white border-0"
              style={{ background: gradient }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Contact your manager if you need access
          </p>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
