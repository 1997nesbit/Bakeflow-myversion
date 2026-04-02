'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Bell, ChefHat, DollarSign } from 'lucide-react'
import type { Order } from '@/types/order'
import type { OverdueAlert } from '@/types/order'
import { daysUntilDue } from '@/lib/utils/date'

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
  if (overdueAlerts.length === 0 && advanceReminders.length === 0) return null

  return (
    <div className="mb-5 space-y-2">
      {overdueAlerts.map(alert => (
        <div
          key={alert.order.id}
          className="flex items-center justify-between gap-4 rounded-xl border-2 border-red-300 bg-red-50 p-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-red-900">
                Kitchen Overdue: {alert.order.id} - {alert.order.customer.name}
              </p>
              <p className="text-xs text-red-700">
                Est. {alert.order.estimatedMinutes}min | {alert.minutesOver}min overdue - Check on the kitchen!
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
      ))}

      {advanceReminders.map(order => {
        const days = daysUntilDue(order.pickupDate)
        return (
          <div
            key={order.id}
            className="flex items-center justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-amber-900">
                  {days === 0
                    ? `Advance Order Due Today: ${order.id}`
                    : days === 1
                    ? `Advance Order Due Tomorrow: ${order.id}`
                    : `Advance Order Due in ${days} days: ${order.id}`}
                </p>
                <p className="text-xs text-amber-700">
                  {order.customer.name}
                  {order.paymentStatus === 'deposit'
                    ? ` | Balance: TZS ${(order.totalPrice - order.amountPaid).toLocaleString()}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {order.status === 'pending' && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  onClick={() => onConfirmPayment(order)}
                >
                  <DollarSign className="mr-1 h-4 w-4" /> Confirm Pay
                </Button>
              )}
              {order.status === 'paid' && (
                <Button
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shrink-0"
                  onClick={() => onPostToBaker(order.id)}
                >
                  <ChefHat className="mr-1 h-4 w-4" /> Post to Baker
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
