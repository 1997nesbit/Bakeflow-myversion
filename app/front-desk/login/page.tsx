'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Eye, EyeOff, LogIn } from 'lucide-react'

const DEMO_USERS = [
  { username: 'sarah', password: 'frontdesk1', name: 'Sarah Mwangi' },
  { username: 'mary', password: 'frontdesk2', name: 'Mary Otieno' },
  { username: 'admin', password: 'admin123', name: 'Front Desk Admin' },
]

export default function FrontDeskLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.username === username.toLowerCase() && u.password === password)
      if (user) {
        localStorage.setItem('bbr_frontdesk_user', JSON.stringify({ name: user.name, username: user.username, loggedInAt: new Date().toISOString() }))
        router.push('/front-desk')
      } else if (username && password) {
        localStorage.setItem('bbr_frontdesk_user', JSON.stringify({ name: username, username, loggedInAt: new Date().toISOString() }))
        router.push('/front-desk')
      } else {
        setError('Please enter your username and password')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fdf2f4 0%, #fce7ea 40%, #fbd5db 100%)' }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #CA0123 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <Card className="relative w-full max-w-md mx-4 shadow-2xl border-0 bg-card">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Front Desk</h1>
            <p className="mt-1 text-sm text-muted-foreground">Bbr Bakeflow Order Management</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
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

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base text-white border-0"
              style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
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

          <div className="mt-6 rounded-lg bg-muted/50 border border-border p-4">
            <p className="text-xs font-medium text-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-mono text-foreground">sarah</span> / <span className="font-mono text-foreground">frontdesk1</span> - Sarah Mwangi</p>
              <p><span className="font-mono text-foreground">mary</span> / <span className="font-mono text-foreground">frontdesk2</span> - Mary Otieno</p>
              <p><span className="font-mono text-foreground">admin</span> / <span className="font-mono text-foreground">admin123</span> - Admin</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
