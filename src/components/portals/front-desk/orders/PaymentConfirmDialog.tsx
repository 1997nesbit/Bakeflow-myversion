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
  if (!order) return null

  // If a deposit has already been paid, the customer is completing payment —
  // show only the outstanding balance, not the full order price.
  const hasDeposit = order.paymentStatus === 'deposit'
  const outstanding = order.totalPrice - order.amountPaid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Confirm Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order summary */}
          <div className="rounded-lg bg-accent p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{order.trackingId}</p>
              <p className="text-lg font-bold text-secondary">TZS {order.totalPrice.toLocaleString()}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.customer.name} — {order.customer.phone}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
            </p>
          </div>

          {/* Deposit already paid — show breakdown */}
          {hasDeposit && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 space-y-1">
              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Deposit already collected</p>
              <div className="flex justify-between text-sm text-blue-700">
                <span>Deposit paid</span>
                <span className="font-medium">TZS {order.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-blue-900 border-t border-blue-200 pt-1 mt-1">
                <span>Outstanding balance</span>
                <span>TZS {outstanding.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Payment options */}
          <div className="space-y-3">
            {hasDeposit ? (
              /* Completing payment — only option is to collect the outstanding balance */
              <button
                type="button"
                className="w-full rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left transition-all hover:border-green-500 hover:shadow-sm"
                onClick={() => onConfirm(order.id, 'full')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-900">Complete Payment</p>
                    <p className="text-xs text-green-700">Collect remaining balance and mark order as paid</p>
                  </div>
                  <p className="text-xl font-bold text-green-800">TZS {outstanding.toLocaleString()}</p>
                </div>
              </button>
            ) : (
              /* First payment — offer full or deposit options */
              <>
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
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

