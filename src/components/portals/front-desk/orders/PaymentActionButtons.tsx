'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Save } from 'lucide-react'
import type { PaymentTerms } from '@/types/order'

interface PaymentActionButtonsProps {
  hasCakeItems: boolean
  totalPrice: number
  isAdvance: boolean
  paymentTerms: PaymentTerms
  onPaymentTermsChange: (v: PaymentTerms) => void
  onSubmitPaid: () => void
  onSubmitDeposit: () => void
  onSaveUnpaid: () => void
}

export function PaymentActionButtons({
  hasCakeItems, totalPrice, isAdvance, paymentTerms,
  onPaymentTermsChange, onSubmitPaid, onSubmitDeposit, onSaveUnpaid,
}: PaymentActionButtonsProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-foreground">Confirm Order</h3>

      {/* Payment Terms selection (menu items >= 15k only) */}
      {!hasCakeItems && totalPrice >= 15000 && (
        <div className="space-y-3">
          <h3 className="font-medium text-foreground">Payment Terms</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPaymentTermsChange('upfront')}
              className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                paymentTerms === 'upfront'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-border text-muted-foreground hover:border-green-300'
              }`}
            >
              Pay Upfront
            </button>
            <button
              type="button"
              onClick={() => onPaymentTermsChange('on_delivery')}
              className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                paymentTerms === 'on_delivery'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-border text-muted-foreground hover:border-amber-300'
              }`}
            >
              Pay on Delivery
            </button>
          </div>
        </div>
      )}

      {/* Payment Terms notes */}
      {hasCakeItems && (
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary">
            Pay Upfront (required for custom cakes)
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              {totalPrice < 15000
                ? 'Custom orders below 15,000 TZS must be paid in full before processing.'
                : 'Custom cake orders require advance payment. 50% deposit available for advance orders above 15,000 TZS.'}
            </p>
          </div>
        </div>
      )}

      {!hasCakeItems && totalPrice < 15000 && (
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-green-300 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-700">
            Pay Upfront (required for orders below 15,000 TZS)
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2.5">
            <AlertTriangle className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-800">Menu orders below 15,000 TZS must be paid in full before processing.</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid gap-3">
        {/* Custom cakes */}
        {hasCakeItems && (
          <>
            <FullPaymentButton totalPrice={totalPrice} onClick={onSubmitPaid} />
            {isAdvance && totalPrice >= 15000 && (
              <DepositButton totalPrice={totalPrice} onClick={onSubmitDeposit} />
            )}
          </>
        )}

        {/* Menu items below 15k */}
        {!hasCakeItems && totalPrice < 15000 && (
          <FullPaymentButton totalPrice={totalPrice} onClick={onSubmitPaid} />
        )}

        {/* Menu items 15k+ upfront */}
        {!hasCakeItems && totalPrice >= 15000 && paymentTerms === 'upfront' && (
          <>
            <FullPaymentButton totalPrice={totalPrice} onClick={onSubmitPaid} />
            {isAdvance && <DepositButton totalPrice={totalPrice} onClick={onSubmitDeposit} />}
          </>
        )}

        {/* Menu items 15k+ pay on delivery */}
        {!hasCakeItems && totalPrice >= 15000 && paymentTerms === 'on_delivery' && (
          <button
            type="button"
            className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-left transition-all hover:border-amber-500 hover:shadow-sm"
            onClick={onSaveUnpaid}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-900">Pay on Delivery / Pickup</p>
                <p className="text-xs text-amber-700 mt-0.5">Trusted customer. Payment collected on delivery.</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-amber-800">TZS {totalPrice.toLocaleString()}</p>
                <Badge className="bg-amber-600 text-white border-0 text-xs mt-1">On Delivery</Badge>
              </div>
            </div>
          </button>
        )}

        {/* Save unpaid — only for menu items 15k+ */}
        {!hasCakeItems && totalPrice >= 15000 && (
          <button
            type="button"
            className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
            onClick={onSaveUnpaid}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground flex items-center gap-2"><Save className="h-4 w-4" /> Save Order - Await Payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">Save order and confirm payment later.</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-muted-foreground">TZS {totalPrice.toLocaleString()}</p>
                <Badge variant="outline" className="text-xs mt-1 bg-transparent">Unpaid</Badge>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

function FullPaymentButton({ totalPrice, onClick }: { totalPrice: number; onClick: () => void }) {
  return (
    <button
      type="button"
      className="rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left transition-all hover:border-green-500 hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-green-900">Full Payment</p>
          <p className="text-xs text-green-700 mt-0.5">Customer pays now. Order goes to baker queue.</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-800">TZS {totalPrice.toLocaleString()}</p>
          <Badge className="bg-green-600 text-white border-0 text-xs mt-1">Ready to Post</Badge>
        </div>
      </div>
    </button>
  )
}

function DepositButton({ totalPrice, onClick }: { totalPrice: number; onClick: () => void }) {
  return (
    <button
      type="button"
      className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-left transition-all hover:border-amber-500 hover:shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-amber-900">50% Deposit</p>
          <p className="text-xs text-amber-700 mt-0.5">Balance TZS {Math.ceil(totalPrice / 2).toLocaleString()} on pickup/delivery day.</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-amber-800">TZS {Math.ceil(totalPrice / 2).toLocaleString()}</p>
          <Badge className="bg-amber-600 text-white border-0 text-xs mt-1">Advance</Badge>
        </div>
      </div>
    </button>
  )
}
