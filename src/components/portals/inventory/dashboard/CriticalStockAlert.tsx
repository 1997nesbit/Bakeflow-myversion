'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { InventoryItem } from '@/types/inventory'

interface Props {
  criticalStock: InventoryItem[]
}

export function CriticalStockAlert({ criticalStock }: Props) {
  if (criticalStock.length === 0) return null

  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <p className="font-semibold text-red-800">
          {criticalStock.length} item{criticalStock.length > 1 ? 's' : ''} critically low
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {criticalStock.map(item => (
          <Badge key={item.id} className="bg-red-100 text-red-800 border-0">
            {item.name}: {item.quantity} {item.unit} (min {item.minStock})
          </Badge>
        ))}
      </div>
      <Link href="/inventory/stock?tab=critical" className="inline-block mt-2">
        <Button size="sm" variant="link" className="text-red-700 p-0 h-auto">
          View critical stock <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </Link>
    </div>
  )
}
