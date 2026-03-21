'use client'

import { CreditCard } from 'lucide-react'
import type { PaymentMethod } from '@/types/order'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Card' },
]

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod
  onChange: (v: PaymentMethod) => void
}

export function PaymentMethodSelector({ paymentMethod, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Payment Method
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
              paymentMethod === m.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
