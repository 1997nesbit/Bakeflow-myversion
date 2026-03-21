'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import type { OrderItem } from '@/types/order'

interface CartSummaryProps {
  items: OrderItem[]
  totalPrice: number
  onRemoveItem: (index: number) => void
  onUpdateQty: (index: number, qty: number) => void
}

export function CartSummary({ items, totalPrice, onRemoveItem, onUpdateQty }: CartSummaryProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Cart ({items.length} item{items.length > 1 ? 's' : ''})</h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                {item.isCustom && <Badge variant="outline" className="text-xs bg-transparent">Custom</Badge>}
              </div>
              {item.isCustom && item.customCake && (
                <p className="text-xs text-muted-foreground">{item.customCake.flavour} / {item.customCake.icingType} / {item.customCake.kilogram}kg</p>
              )}
              {item.isCustom && item.customCake?.noteForCustomer && (
                <p className="text-xs text-pink-600 italic">{'"'}{item.customCake.noteForCustomer}{'"'}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2 shrink-0">
              <Input type="number" min="1" value={item.quantity} onChange={(e) => onUpdateQty(index, Number.parseInt(e.target.value) || 1)} className="w-16 h-8 text-center text-sm" />
              <span className="text-sm font-semibold text-secondary w-20 text-right">TZS {(item.price * item.quantity).toLocaleString()}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onRemoveItem(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2">
        <span className="text-sm font-medium text-foreground">Total</span>
        <span className="text-lg font-bold text-secondary">TZS {totalPrice.toLocaleString()}</span>
      </div>
    </div>
  )
}
