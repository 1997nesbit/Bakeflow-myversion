'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { InventoryItem } from '@/types/inventory'
import { AlertTriangle, Plus } from 'lucide-react'

interface InventoryAlertsProps {
  items: InventoryItem[]
}

export function InventoryAlerts({ items }: InventoryAlertsProps) {
  const lowStockItems = items.filter((item) => item.quantity < item.minStock)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            All inventory levels are healthy
          </p>
        ) : (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg bg-red-50 p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} remaining (min: {item.minStock})
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Restock
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
