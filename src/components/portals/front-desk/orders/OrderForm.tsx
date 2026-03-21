'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Star, Link2 } from 'lucide-react'
import type { DeliveryType, PaymentMethod, PaymentTerms, OrderItem, MenuItem, NewOrderData } from '@/types/order'
import { bakeryMenu } from '@/data/constants/menus'
import { generateTrackingId } from '@/data/mock/helpers'
import { MenuItemBrowser } from './MenuItemBrowser'
import { CustomCakeBuilder } from './CustomCakeBuilder'
import { CartSummary } from './CartSummary'
import { CustomerDetailsForm } from './CustomerDetailsForm'
import { DateTimeSection } from './DateTimeSection'
import { DeliverySection } from './DeliverySection'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { PaymentActionButtons } from './PaymentActionButtons'

interface OrderFormProps {
  onClose: () => void
  onSubmit: (order: NewOrderData) => void
}

export function OrderForm({ onClose, onSubmit }: OrderFormProps) {
  const [step, setStep] = useState(1)
  const [menuFilter, setMenuFilter] = useState<string>('all')

  // Customer
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isGoldCustomer, setIsGoldCustomer] = useState(false)

  // Items
  const [items, setItems] = useState<OrderItem[]>([])

  // Details
  const [specialNotes, setSpecialNotes] = useState('')
  const [cakeDescription, setCakeDescription] = useState('')
  const [noteForCustomer, setNoteForCustomer] = useState('')

  // Date/Time
  const today = new Date().toISOString().split('T')[0]
  const [pickupDate, setPickupDate] = useState(today)
  const [pickupTime, setPickupTime] = useState('')
  const [editingDate, setEditingDate] = useState(false)

  // Delivery
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('upfront')

  // Custom cake builder
  const [customFlavour, setCustomFlavour] = useState('')
  const [customIcing, setCustomIcing] = useState('')
  const [customKg, setCustomKg] = useState(1)
  const [customPrice, setCustomPrice] = useState(0)
  const [customDesc, setCustomDesc] = useState('')
  const [customNote, setCustomNote] = useState('')

  const [trackingId] = useState(() => generateTrackingId())

  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.price, 0), [items])
  const hasCakeItems = useMemo(() => items.some(i => i.isCustom), [items])
  const isAdvance = useMemo(() => {
    if (!pickupDate) return false
    const t = new Date(); t.setHours(0, 0, 0, 0)
    const due = new Date(pickupDate); due.setHours(0, 0, 0, 0)
    return Math.ceil((due.getTime() - t.getTime()) / (1000 * 60 * 60 * 24)) > 0
  }, [pickupDate])
  const estimatedMinutes = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((item) => {
      if (item.isCustom) return item.customCake ? item.customCake.kilogram * 60 : 120
      const menuItem = bakeryMenu.find((m) => m.name === item.name)
      return menuItem ? menuItem.estimatedMinutes : 45
    }))
  }, [items])

  const filteredMenu = menuFilter === 'all' ? bakeryMenu : bakeryMenu.filter((m) => m.category === menuFilter)

  const addMenuItemToOrder = (menuItem: MenuItem) => {
    const existing = items.findIndex((i) => i.name === menuItem.name && !i.isCustom)
    if (existing >= 0) {
      const updated = [...items]
      updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + 1 }
      setItems(updated)
    } else {
      setItems([...items, { name: menuItem.name, quantity: 1, price: menuItem.price, isCustom: false }])
    }
  }

  const addCustomCake = () => {
    if (!customFlavour || !customIcing || customKg <= 0 || customPrice <= 0) return
    const name = `Custom Cake - ${customFlavour}/${customIcing} ${customKg}kg`
    setItems([...items, {
      name, quantity: 1, price: customPrice, isCustom: true,
      customCake: { flavour: customFlavour, icingType: customIcing, kilogram: customKg, description: customDesc, noteForCustomer: customNote },
    }])
    setCustomFlavour(''); setCustomIcing(''); setCustomKg(1); setCustomPrice(0); setCustomDesc(''); setCustomNote('')
  }

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItemQty = (index: number, qty: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], quantity: Math.max(1, qty) }
    setItems(updated)
  }

  const buildOrderData = (paymentStatus: 'unpaid' | 'deposit' | 'paid', amountPaid: number): NewOrderData => ({
    customerName, customerPhone, customerEmail: customerEmail || undefined,
    orderType: items.some((i) => i.isCustom) ? 'custom' : 'menu',
    items, specialNotes: specialNotes || undefined, cakeDescription: cakeDescription || undefined,
    noteForCustomer: noteForCustomer || undefined, pickupDate, pickupTime, deliveryType,
    deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
    totalPrice, amountPaid, paymentStatus, paymentMethod, paymentTerms,
    isAdvanceOrder: isAdvance, estimatedMinutes, trackingId, isGoldCustomer,
  })

  const handleSubmitPaid = () => onSubmit(buildOrderData('paid', totalPrice))
  const handleSubmitDeposit = () => onSubmit(buildOrderData('deposit', Math.ceil(totalPrice / 2)))
  const handleSaveUnpaid = () => onSubmit(buildOrderData('unpaid', 0))

  const canProceedStep1 = items.length > 0
  const canProceedStep2 = customerName && customerPhone && pickupDate && pickupTime && (deliveryType === 'pickup' || deliveryAddress)

  return (
    <Card className="border-0 shadow-lg bg-card max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4 shrink-0">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground">New Order</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step} of 3 - {step === 1 ? 'Select Items' : step === 2 ? 'Customer & Delivery' : 'Payment & Confirm'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
      </CardHeader>

      <div className="flex gap-1 px-6 pt-4 shrink-0">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-border'}`} />
        ))}
      </div>

      <CardContent className="pt-4 overflow-y-auto flex-1">
        {/* STEP 1: ITEMS */}
        {step === 1 && (
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">Add items from the menu and/or build custom cakes. You can mix both in a single order.</p>
            <MenuItemBrowser
              filteredMenu={filteredMenu} menuFilter={menuFilter} items={items}
              onFilterChange={setMenuFilter} onAddItem={addMenuItemToOrder}
            />
            <CustomCakeBuilder
              customFlavour={customFlavour} customIcing={customIcing} customKg={customKg}
              customPrice={customPrice} customDesc={customDesc} customNote={customNote}
              onFlavourChange={setCustomFlavour} onIcingChange={setCustomIcing}
              onKgChange={setCustomKg} onPriceChange={setCustomPrice}
              onDescChange={setCustomDesc} onNoteChange={setCustomNote}
              onAdd={addCustomCake}
            />
            <CartSummary items={items} totalPrice={totalPrice} onRemoveItem={removeItem} onUpdateQty={updateItemQty} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">Cancel</Button>
              <Button type="button" disabled={!canProceedStep1} onClick={() => setStep(2)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Next: Customer Details
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CUSTOMER & DELIVERY */}
        {step === 2 && (
          <div className="space-y-5">
            <CustomerDetailsForm
              customerName={customerName} customerPhone={customerPhone}
              customerEmail={customerEmail} isGoldCustomer={isGoldCustomer}
              onNameChange={setCustomerName} onPhoneChange={setCustomerPhone}
              onEmailChange={setCustomerEmail} onGoldChange={setIsGoldCustomer}
            />
            <DateTimeSection
              pickupDate={pickupDate} pickupTime={pickupTime}
              editingDate={editingDate} isAdvance={isAdvance}
              onDateChange={setPickupDate} onTimeChange={setPickupTime}
              onEditingDateChange={setEditingDate}
            />
            <DeliverySection
              deliveryType={deliveryType} deliveryAddress={deliveryAddress}
              onDeliveryTypeChange={setDeliveryType} onAddressChange={setDeliveryAddress}
            />
            {hasCakeItems && (
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Cake Details</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="cakeDesc">Cake Description (overall design notes)</Label>
                    <Textarea id="cakeDesc" value={cakeDescription} onChange={(e) => setCakeDescription(e.target.value)} placeholder="Detailed description of how the cake should look, theme, colors, tiers..." rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noteForCust">Note for Customer (message on cake)</Label>
                    <Input id="noteForCust" value={noteForCustomer} onChange={(e) => setNoteForCustomer(e.target.value)} placeholder="e.g., Happy Birthday John!" />
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Special Notes</Label>
              <Textarea id="notes" value={specialNotes} onChange={(e) => setSpecialNotes(e.target.value)} placeholder="Any special requests, allergies, etc..." rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">Back</Button>
              <Button type="button" disabled={!canProceedStep2} onClick={() => setStep(3)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                Next: Payment
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Order Summary</h3>
              <div className="rounded-lg bg-accent/50 border border-border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm"><span className="text-muted-foreground">Customer:</span> <span className="font-medium text-foreground">{customerName}</span></p>
                  {isGoldCustomer && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                </div>
                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{customerPhone}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{pickupDate} at {pickupTime}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground">{deliveryType === 'delivery' ? 'Delivery' : 'Customer Pickup'}</span></p>
                {deliveryType === 'delivery' && (
                  <p className="text-sm"><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{deliveryAddress}</span></p>
                )}
                <p className="text-sm"><span className="text-muted-foreground">Est. time:</span> <span className="font-medium text-foreground">~{estimatedMinutes} minutes</span></p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3">
                <Link2 className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-700 font-medium">Customer Tracking Link (sent with order message)</p>
                  <p className="text-xs text-blue-600 truncate font-mono">{typeof window !== 'undefined' ? window.location.origin : ''}/track/{trackingId}</p>
                </div>
              </div>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.name} x{item.quantity}</span>
                    <span className="font-medium text-foreground">TZS {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-secondary">TZS {totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <PaymentMethodSelector paymentMethod={paymentMethod} onChange={setPaymentMethod} />
            <PaymentActionButtons
              hasCakeItems={hasCakeItems} totalPrice={totalPrice} isAdvance={isAdvance}
              paymentTerms={paymentTerms} onPaymentTermsChange={setPaymentTerms}
              onSubmitPaid={handleSubmitPaid} onSubmitDeposit={handleSubmitDeposit} onSaveUnpaid={handleSaveUnpaid}
            />
            <div className="pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full bg-transparent">
                Back to Customer Details
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
