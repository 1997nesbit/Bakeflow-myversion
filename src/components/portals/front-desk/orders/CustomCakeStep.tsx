'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { CustomCakeBuilder } from './CustomCakeBuilder'
import { CartSummary } from './CartSummary'
import type { OrderItem } from '@/types/order'

interface CustomCakeStepProps {
  items: OrderItem[]
  onItemsChange: (items: OrderItem[]) => void
  onNext: () => void
  onCancel: () => void
}

export function CustomCakeStep({ items, onItemsChange, onNext, onCancel }: CustomCakeStepProps) {
  const [customFlavour, setCustomFlavour] = useState('')
  const [customIcing, setCustomIcing] = useState('')
  const [customKg, setCustomKg] = useState(1)
  const [customPrice, setCustomPrice] = useState(0)
  const [customDesc, setCustomDesc] = useState('')
  const [customNote, setCustomNote] = useState('')

  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items])

  const addCake = () => {
    if (!customFlavour || !customIcing || customKg <= 0 || customPrice <= 0) return
    const name = `Custom Cake - ${customFlavour}/${customIcing} ${customKg}kg`
    onItemsChange([...items, {
      name, quantity: 1, price: customPrice, isCustom: true,
      customCake: { flavour: customFlavour, icingType: customIcing, kilogram: customKg, description: customDesc, noteForCustomer: customNote },
    }])
    setCustomFlavour(''); setCustomIcing(''); setCustomKg(1); setCustomPrice(0); setCustomDesc(''); setCustomNote('')
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
        Build one or more custom cakes. Each cake is configured and added to the cart separately.
      </p>
      <CustomCakeBuilder
        customFlavour={customFlavour} customIcing={customIcing} customKg={customKg}
        customPrice={customPrice} customDesc={customDesc} customNote={customNote}
        onFlavourChange={setCustomFlavour} onIcingChange={setCustomIcing}
        onKgChange={setCustomKg} onPriceChange={setCustomPrice}
        onDescChange={setCustomDesc} onNoteChange={setCustomNote}
        onAdd={addCake}
      />
      <CartSummary items={items} totalPrice={totalPrice} onRemoveItem={removeItem} onUpdateQty={updateQty} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">Cancel</Button>
        <Button
          type="button"
          disabled={items.length === 0}
          onClick={onNext}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Next: Customer Details
        </Button>
      </div>
    </div>
  )
}
