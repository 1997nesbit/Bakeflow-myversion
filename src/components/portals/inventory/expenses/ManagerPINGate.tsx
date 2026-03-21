'use client'

import { useState } from 'react'
import { InventorySidebar } from '@/components/layout/app-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, ShieldAlert } from 'lucide-react'

interface Props {
  onUnlock: () => void
}

export function ManagerPINGate({ onUnlock }: Props) {
  const [managerPin, setManagerPin] = useState('')
  const [pinError, setPinError] = useState(false)

  const handleLogin = () => {
    if (managerPin === '1234') {
      sessionStorage.setItem('bbr_manager_expenses_access', 'granted')
      onUnlock()
    } else {
      setPinError(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <InventorySidebar />
      <main className="ml-64 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-5">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Manager Access Required</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Inventory expenses are restricted to managers only. Enter your PIN to continue.
            </p>
            <div className="space-y-3">
              <Input
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={managerPin}
                onChange={(e) => { setManagerPin(e.target.value); setPinError(false) }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className={`text-center text-lg tracking-[0.5em] ${pinError ? 'border-red-500 ring-red-500' : ''}`}
              />
              {pinError && (
                <p className="text-xs text-red-600 flex items-center justify-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Incorrect PIN. Try again.
                </p>
              )}
              <Button
                onClick={handleLogin}
                disabled={managerPin.length !== 4}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Unlock Expenses
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Demo PIN: 1234</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
