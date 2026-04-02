'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { MenuItemBrowser } from './MenuItemBrowser'
import { CartSummary } from './CartSummary'
import type { OrderItem, MenuItem } from '@/types/order'

interface MenuOrderStepProps {
  menuItems: MenuItem[]
  categories: string[]
  items: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
  onNext: () => void
  onCancel: () => void
}

export function MenuOrderStep({ menuItems, categories, items, onItemsChange, onNext, onCancel }: MenuOrderStepProps) {
  const [menuFilter, setMenuFilter] = useState('all')

  const filteredMenu = useMemo(
    () => menuFilter === 'all' ? menuItems : menuItems.filter((m) => m.category === menuFilter),
    [menuFilter, menuItems]
  )

  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items])

  const addItem = (menuItem: MenuItem) => {
    const existing = items.findIndex((i) => i.name === menuItem.name && !i.isCustom)
    if (existing >= 0) {
      const updated = [...items]
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
      onItemsChange(updated)
    } else {
      onItemsChange([...items, { name: menuItem.name, quantity: 1, price: menuItem.price, isCustom: false }])
    }
  }

  const removeItem = (index: number) => onItemsChange(items.filter((_, i) => i !== index))

  const updateQty = (index: number, qty: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], quantity: Math.max(1, qty) }
    onItemsChange(updated)
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        Add items from the bakery menu. For bespoke cake orders use the Custom Cake flow instead.
      </p>
      <div className="grid grid-cols-[1fr_320px] gap-5 items-start">
        <MenuItemBrowser
          filteredMenu={filteredMenu} menuFilter={menuFilter} categories={categories} items={items}
          onFilterChange={setMenuFilter} onAddItem={addItem}
        />
        <div className="sticky top-6 space-y-4">
          <CartSummary items={items} totalPrice={totalPrice} onRemoveItem={removeItem} onUpdateQty={updateQty} />
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
              Your cart is empty
            </p>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              disabled={items.length === 0}
              onClick={onNext}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next: Customer Details
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full bg-transparent">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
