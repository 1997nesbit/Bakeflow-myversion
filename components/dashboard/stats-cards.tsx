'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface StatsCardsProps {
  totalOrders: number
  pendingOrders: number
  readyOrders: number
  lowStockItems: number
}

export function StatsCards({ totalOrders, pendingOrders, readyOrders, lowStockItems }: StatsCardsProps) {
  const stats = [
    {
      name: "Today's Orders",
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-primary/10 text-primary',
    },
    {
      name: 'In Progress',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      name: 'Ready for Pickup',
      value: readyOrders,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
    },
    {
      name: 'Low Stock Alerts',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-700',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
