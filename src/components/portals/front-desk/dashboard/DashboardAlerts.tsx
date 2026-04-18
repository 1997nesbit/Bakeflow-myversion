'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, CalendarClock, ArrowRight, ChefHat } from 'lucide-react'
import type { Order } from '@/types/order'
import { minutesSincePosted, daysUntilDue } from '@/lib/utils/date'

interface DashboardAlertsProps {
  overdueOrders: Order[]
  advanceDueSoon: Order[]
  mounted: boolean
}

export function DashboardAlerts({ overdueOrders, advanceDueSoon, mounted }: DashboardAlertsProps) {
  if (overdueOrders.length === 0 && advanceDueSoon.length === 0) return null

  return (
    <div className="space-y-2">
      {overdueOrders.map(order => (
        <div key={order.id} className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500 animate-pulse">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900">Kitchen Overdue: {order.id}</p>
              <p className="text-xs text-red-600">
                {order.customer.name} - Est. {order.estimatedMinutes}min, now {mounted ? minutesSincePosted(order.postedToBakerAt!) : 0}min. Check kitchen.
              </p>
            </div>
          </div>
          <Link href="/front-desk/orders">
            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent text-xs">
              View <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      ))}
      {advanceDueSoon.map(order => {
        const days = daysUntilDue(order.pickupDate)
        const dueLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`
        return (
          <div key={order.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
                <CalendarClock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">Advance Due {dueLabel}: {order.id}</p>
                <p className="text-xs text-amber-700">
                  {order.customer.name} - {order.items?.map(i => i.name).join(', ')}
                  {order.paymentStatus === 'deposit' && ` | Balance due: TZS ${(order.totalPrice - order.amountPaid).toLocaleString()}`}
                </p>
              </div>
            </div>
            <Link href="/front-desk/orders">
              <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs">
                <ChefHat className="mr-1 h-3 w-3" /> Go to Orders
              </Button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}
