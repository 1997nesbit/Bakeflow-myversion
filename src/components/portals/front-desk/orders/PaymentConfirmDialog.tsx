'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Order } from '@/types/order'

interface Props {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (orderId: string, type: 'full' | 'deposit') => void
}

export function PaymentConfirmDialog({ order, open, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Confirm Payment</DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="rounded-lg bg-accent p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">{order.id}</p>
                <p className="text-lg font-bold text-secondary">TZS {order.totalPrice.toLocaleString()}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {order.customerName} - {order.customerPhone}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left transition-all hover:border-green-500 hover:shadow-sm"
                onClick={() => onConfirm(order.id, 'full')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900">Full Payment</p>
                    <p className="text-xs text-green-700">Customer pays full amount now</p>
                  </div>
                  <p className="text-xl font-bold text-green-800">TZS {order.totalPrice.toLocaleString()}</p>
                </div>
              </button>

              {order.isAdvanceOrder && (
                <button
                  type="button"
                  className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-left transition-all hover:border-amber-500 hover:shadow-sm"
                  onClick={() => onConfirm(order.id, 'deposit')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-amber-900">50% Deposit</p>
                      <p className="text-xs text-amber-700">
                        Balance TZS {Math.ceil(order.totalPrice / 2).toLocaleString()} on pickup day
                      </p>
                    </div>
                    <p className="text-xl font-bold text-amber-800">
                      TZS {Math.ceil(order.totalPrice / 2).toLocaleString()}
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
