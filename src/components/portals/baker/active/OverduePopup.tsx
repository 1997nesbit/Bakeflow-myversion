'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import type { Order } from '@/types/order'

interface Props {
  order: Order | null
  onClose: () => void
}

export function OverduePopup({ order, onClose }: Props) {
  if (!order) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 border-2 shadow-2xl bg-card" style={{ borderColor: '#CA0123' }}>
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full animate-bounce" style={{ background: '#fce7ea' }}>
            <AlertTriangle className="h-8 w-8" style={{ color: '#CA0123' }} />
          </div>
          <h2 className="text-xl font-bold text-balance" style={{ color: '#CA0123' }}>Order Overdue!</h2>
          <p className="text-sm text-muted-foreground">
            Order <span className="font-bold text-foreground">{order.id}</span> for{' '}
            <span className="font-bold text-foreground">{order.customer.name}</span>{' '}
            exceeded its estimated time of <span className="font-bold">{order.estimatedMinutes} min</span>.
          </p>
          <Button className="w-full text-white border-0" style={{ background: '#CA0123' }} onClick={onClose}>
            Acknowledged
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
