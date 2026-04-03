'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { MenuItemBrowser } from './MenuItemBrowser'
import { CartSummary } from './CartSummary'
import type { OrderItem, MenuItem, PaymentMethod } from '@/types/order'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'mobile_money', label: 'Mobile' },
  { value: 'bank_transfer', label: 'Bank' },
]

interface MenuOrderStepProps {
  menuItems: MenuItem[]
  categories: string[]
  items: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
  onNext: () => void
  onCancel: () => void
  onQuickSale: (paymentMethod: PaymentMethod) => void
}

export function MenuOrderStep({ menuItems, categories, items, onItemsChange, onNext, onCancel, onQuickSale }: MenuOrderStepProps) {
  const [menuFilter, setMenuFilter] = useState('all')
  const [isQuickSale, setIsQuickSale] = useState(false)
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<PaymentMethod>('cash')

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

          {items.length > 0 && (
            <div className="border border-border rounded-lg p-3 space-y-3">
              <button
                type="button"
                onClick={() => setIsQuickSale((v) => !v)}
                className="flex items-center justify-between w-full text-sm"
              >
                <span className="font-medium text-foreground">Quick Sale</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${isQuickSale ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {isQuickSale ? 'ON' : 'OFF'}
                </span>
              </button>

              {isQuickSale && (
                <div className="space-y-3 pt-1 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    No customer record. Paid in full now.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setQuickPaymentMethod(m.value)}
                        className={`text-xs py-1.5 rounded-md border font-medium transition-colors ${
                          quickPaymentMethod === m.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-transparent text-foreground border-border hover:bg-accent'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={() => onQuickSale(quickPaymentMethod)}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Sell Now — TZS {totalPrice.toLocaleString()}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            {!isQuickSale && (
              <Button
                type="button"
                disabled={items.length === 0}
                onClick={onNext}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next: Customer Details
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel} className="w-full bg-transparent">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
