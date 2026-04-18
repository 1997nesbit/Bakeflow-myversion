'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Order, PaymentMethod } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { Banknote, Smartphone, CreditCard, Building2, CheckCircle } from 'lucide-react'

const METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'cash',          label: 'Cash',          icon: <Banknote className="h-4 w-4" /> },
  { value: 'mobile_money',  label: 'M-Pesa / Mobile', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: <Building2 className="h-4 w-4" /> },
  { value: 'card',          label: 'Card',          icon: <CreditCard className="h-4 w-4" /> },
]

interface Props {
  order: Order
  open: boolean
  onClose: () => void
  onPaymentRecorded: (updated: Order) => void
}

export function PaymentCollectionModal({ order, open, onClose, onPaymentRecorded }: Props) {
  const outstanding = Math.max(0, order.totalPrice - order.amountPaid)
  const [amount, setAmount] = useState<string>(outstanding.toFixed(2))
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount)
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Please enter a valid amount.')
      return
    }
    setSubmitting(true)
    try {
      const updated = await ordersService.recordPayment(order.id, numericAmount, method)
      onPaymentRecorded(updated)
      toast.success(`Payment of TZS ${numericAmount.toLocaleString()} (${method.replace('_', ' ')}) recorded!`)
      onClose()
    } catch (err) {
      handleApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-green-600" />
            Collect Payment
          </DialogTitle>
        </DialogHeader>

        {/* Order mini-info */}
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm space-y-1">
          <p className="font-semibold text-foreground">{order.trackingId}</p>
          <p className="text-muted-foreground">{order.customer.name}</p>
          <div className="flex justify-between pt-1 text-xs">
            <span className="text-muted-foreground">Order Total</span>
            <span className="font-bold text-foreground">TZS {order.totalPrice.toLocaleString()}</span>
          </div>
          {order.amountPaid > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Already Paid</span>
              <span className="text-green-600 font-medium">TZS {order.amountPaid.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xs border-t border-border pt-1 mt-1">
            <span className="font-medium text-foreground">Outstanding</span>
            <span className="font-bold text-amber-600">TZS {outstanding.toLocaleString()}</span>
          </div>
        </div>

        {/* Amount input */}
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Amount Collected (TZS)</Label>
          <Input
            id="payment-amount"
            type="number"
            min={0}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-bold"
            autoFocus
          />
        </div>

        {/* Method selector */}
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all
                  ${method === m.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                  }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Recording…' : (
              <>
                <CheckCircle className="h-4 w-4" />
                Record Payment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
