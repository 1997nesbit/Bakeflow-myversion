'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import type { MenuItem, OrderItem } from '@/types/order'

interface MenuItemBrowserProps {
  filteredMenu: MenuItem[]
  menuFilter: string
  items: OrderItem[]
  onFilterChange: (filter: string) => void
  onAddItem: (item: MenuItem) => void
}

export function MenuItemBrowser({ filteredMenu, menuFilter, items, onFilterChange, onAddItem }: MenuItemBrowserProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <ShoppingCart className="h-4 w-4" />
        Menu Items
      </h3>
      <div className="flex flex-wrap gap-2">
        {['all', 'cake', 'bread', 'pastry', 'snack'].map((cat) => (
          <Button
            key={cat}
            type="button"
            size="sm"
            variant={menuFilter === cat ? 'default' : 'outline'}
            onClick={() => onFilterChange(cat)}
            className={menuFilter !== cat ? 'bg-transparent' : ''}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>
      <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
        {filteredMenu.map((item) => {
          const inCart = items.find((i) => i.name === item.name && !i.isCustom)
          return (
            <button
              type="button"
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
              onClick={() => onAddItem(item)}
            >
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-secondary">TZS {item.price.toLocaleString()}</span>
                {inCart && <Badge className="bg-primary text-primary-foreground text-xs">{inCart.quantity}</Badge>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
