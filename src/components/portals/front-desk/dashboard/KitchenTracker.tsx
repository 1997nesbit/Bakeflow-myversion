'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Timer, AlertTriangle, ChefHat } from 'lucide-react'
import type { Order } from '@/types/order'
import { statusLabels, statusColors } from '@/data/constants/labels'
import { minutesSincePosted } from '@/lib/utils/date'

interface KitchenTrackerProps {
  inKitchen: Order[]
  overdueOrders: Order[]
  mounted: boolean
}

export function KitchenTracker({ inKitchen, overdueOrders, mounted }: KitchenTrackerProps) {
  return (
    <Card className="border-0 shadow-sm lg:col-span-2">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Timer className="h-4 w-4 text-orange-500" />
          Kitchen Tracker
          {overdueOrders.length > 0 && (
            <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0 border-0">{overdueOrders.length} overdue</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="space-y-3">
          {inKitchen.length > 0 ? inKitchen.map(order => {
            const elapsed = mounted && order.postedToBakerAt ? minutesSincePosted(order.postedToBakerAt) : 0
            const isOverdue = elapsed > order.estimatedMinutes
            const progress = Math.min((elapsed / order.estimatedMinutes) * 100, 100)
            const kitchenCardClass = isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted/50 border border-border'
            const progressBarColor = progress > 75 ? 'bg-amber-500' : 'bg-emerald-500'
            return (
              <div key={order.id} className={`rounded-lg p-3 ${kitchenCardClass}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{order.id}</span>
                      <Badge className={`${statusColors[order.status]} border-0 text-[10px] px-1.5 py-0`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{order.customerName}</p>
                  </div>
                  {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOverdue ? 'bg-red-500' : progressBarColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold shrink-0 tabular-nums ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {elapsed}m/{order.estimatedMinutes}m
                  </span>
                </div>
                {isOverdue && (
                  <p className="mt-1.5 text-[10px] font-semibold text-red-600">
                    Overdue by {elapsed - order.estimatedMinutes}min - check kitchen
                  </p>
                )}
              </div>
            )
          }) : (
            <div className="rounded-xl border-2 border-dashed border-border py-10 text-center">
              <ChefHat className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Kitchen is clear</p>
              <p className="text-xs text-muted-foreground mt-0.5">No orders in production</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
