'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Bell, ChefHat, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import type { Order } from '@/types/order'
import type { OverdueAlert } from '@/types/order'
import { daysUntilDue } from '@/lib/utils/date'

const COLLAPSED_LIMIT = 3

interface Props {
  overdueAlerts: OverdueAlert[]
  advanceReminders: Order[]
  onDismissAlert: (orderId: string) => void
  onConfirmPayment: (order: Order) => void
  onPostToBaker: (orderId: string) => void
}

export function OrderAlertsBar({
  overdueAlerts,
  advanceReminders,
  onDismissAlert,
  onConfirmPayment,
  onPostToBaker,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const totalAlerts = overdueAlerts.length + advanceReminders.length
  if (totalAlerts === 0) return null

  const allAlerts = [
    ...overdueAlerts.map(a => ({ type: 'overdue' as const, alert: a })),
    ...advanceReminders.map(o => ({ type: 'reminder' as const, order: o })),
  ]
  const visible = expanded ? allAlerts : allAlerts.slice(0, COLLAPSED_LIMIT)
  const hiddenCount = totalAlerts - COLLAPSED_LIMIT

  return (
    <div className="mb-5 space-y-2">
      {visible.map((item, i) => {
        if (item.type === 'overdue') {
          const { alert } = item
          return (
            <div
              key={alert.order.id}
              className="flex items-center justify-between gap-4 rounded-xl border-2 border-red-300 bg-red-50 p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-red-900 truncate">
                    Kitchen Overdue: {alert.order.trackingId} — {alert.order.customer?.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-red-700">
                    Est. {alert.order.estimatedMinutes}min | {alert.minutesOver}min overdue
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent shrink-0"
                onClick={() => onDismissAlert(alert.order.id)}
              >
                Dismiss
              </Button>
            </div>
          )
        }

        const { order } = item
        const days = daysUntilDue(order.pickupDate)
        return (
          <div
            key={order.id}
            className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-amber-900 truncate">
                  {days === 0
                    ? `Due Today: ${order.trackingId}`
                    : days === 1
                    ? `Due Tomorrow: ${order.trackingId}`
                    : `Due in ${days} days: ${order.trackingId}`}
                </p>
                <p className="text-xs text-amber-700 truncate">
                  {order.customer?.name ?? 'Unknown'}
                  {order.paymentStatus === 'deposit'
                    ? ` | Balance: TZS ${(Number(order.totalPrice) - Number(order.amountPaid)).toLocaleString()}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {order.status === 'pending' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onConfirmPayment(order)}
                >
                  <DollarSign className="mr-1 h-4 w-4" /> Confirm Pay
                </Button>
              )}
              {order.status === 'paid' && (
                <Button
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => onPostToBaker(order.id)}
                >
                  <ChefHat className="mr-1 h-4 w-4" /> Post to Baker
                </Button>
              )}
            </div>
          </div>
        )
      })}

      {/* Show more / show less toggle */}
      {totalAlerts > COLLAPSED_LIMIT && (
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Show fewer alerts</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> Show {hiddenCount} more alert{hiddenCount !== 1 ? 's' : ''}</>
          )}
        </button>
      )}
    </div>
  )
}
