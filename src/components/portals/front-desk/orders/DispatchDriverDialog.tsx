'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api/client'
import { Truck, User2, Loader2, MapPin } from 'lucide-react'
import type { Order } from '@/types/order'

interface Driver {
  id: string
  name: string
  phone?: string
  status: string
}

interface DispatchDriverDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDispatched: (updatedOrder: Order) => void
}

export function DispatchDriverDialog({ order, open, onOpenChange, onDispatched }: DispatchDriverDialogProps) {
  const [drivers, setDrivers]     = useState<Driver[]>([])
  const [loading, setLoading]     = useState(false)
  const [dispatching, setDispatching] = useState<string | null>(null)  // selected driver id

  useEffect(() => {
    if (!open) return
    setLoading(true)
    apiClient.get('/staff/', { params: { role: 'driver', status: 'active' } })
      .then(res => {
        const data = res.data as { results?: Driver[] } | Driver[]
        setDrivers(Array.isArray(data) ? data : (data.results ?? []))
      })
      .catch(() => toast.error('Failed to load drivers.'))
      .finally(() => setLoading(false))
  }, [open])

  const handleDispatch = async (driverId: string) => {
    if (!order) return
    setDispatching(driverId)
    try {
      const { ordersService } = await import('@/lib/api/services/orders')
      const updated = await ordersService.dispatch(order.id, driverId)
      const driver = drivers.find(d => d.id === driverId)
      toast.success(`Order dispatched to ${driver?.name ?? 'driver'}!`)
      onDispatched(updated)
      onOpenChange(false)
    } catch {
      toast.error('Failed to dispatch order. Please try again.')
    } finally {
      setDispatching(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Dispatch to Driver
          </DialogTitle>
          {order && (
            <DialogDescription>
              Select a driver for order <span className="font-mono font-semibold">#{order.trackingId}</span> — {order.customer.name}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Delivery address */}
        {order?.deliveryAddress && (
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}

        {/* Driver list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : drivers.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-8 text-center">
              <User2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No active drivers available.</p>
              <p className="text-xs text-muted-foreground mt-1">Add drivers from the Staff Management page.</p>
            </div>
          ) : (
            drivers.map(driver => (
              <div
                key={driver.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <User2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{driver.name}</p>
                    {driver.phone && <p className="text-xs text-muted-foreground">{driver.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">Available</Badge>
                  <Button
                    size="sm"
                    onClick={() => handleDispatch(driver.id)}
                    disabled={!!dispatching}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {dispatching === driver.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <Truck className="mr-1.5 h-3.5 w-3.5" />
                        Assign
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
