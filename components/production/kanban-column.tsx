'use client'

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Order, orderTypeLabels } from '@/lib/mock-data'
import { Clock, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  title: string
  orders: Order[]
  color: string
  icon: React.ReactNode
  nextStage?: string
  onMoveOrder?: (orderId: string) => void
}

export function KanbanColumn({
  title,
  orders,
  color,
  icon,
  nextStage,
  onMoveOrder,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[300px] lg:min-w-0">
      <div className={cn('mb-4 flex items-center gap-2 rounded-lg p-3', color)}>
        {icon}
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="secondary" className="ml-auto bg-background/50">
          {orders.length}
        </Badge>
      </div>

      <div className="flex-1 space-y-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="border-0 shadow-sm transition-all hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {orderTypeLabels[order.orderType]}
                </Badge>
              </div>

              <div className="mt-3 space-y-2">
                {order.items.map((item, index) => (
                  <p key={index} className="text-sm text-foreground">
                    {item.quantity}x {item.name}
                  </p>
                ))}
              </div>

              {order.specialNotes && (
                <div className="mt-3 rounded bg-amber-50 p-2">
                  <p className="text-xs text-amber-800">{order.specialNotes}</p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {order.pickupTime}
                </span>
                <span>{order.pickupDate}</span>
              </div>

              {order.assignedTo && (
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{order.assignedTo}</span>
                </div>
              )}

              {nextStage && onMoveOrder && (
                <Button
                  className="mt-3 w-full bg-primary hover:bg-primary/90"
                  size="sm"
                  onClick={() => onMoveOrder(order.id)}
                >
                  Move to {nextStage}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {orders.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-muted p-8 text-center">
            <p className="text-sm text-muted-foreground">No orders</p>
          </div>
        )}
      </div>
    </div>
  )
}
