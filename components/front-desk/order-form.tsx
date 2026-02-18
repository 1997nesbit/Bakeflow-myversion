'use client'

import React from 'react'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, X, ShoppingCart, Cake, CreditCard, AlertTriangle, Save } from 'lucide-react'
import {
  OrderType,
  DeliveryType,
  OrderItem,
  bakeryMenu,
  cakeFlavours,
  icingTypes,
  MenuItem,
} from '@/lib/mock-data'

interface OrderFormProps {
  onClose: () => void
  onSubmit: (order: NewOrderData) => void
}

export interface NewOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderType: OrderType
  items: OrderItem[]
  specialNotes?: string
  pickupDate: string
  pickupTime: string
  deliveryType: DeliveryType
  deliveryAddress?: string
  totalPrice: number
  amountPaid: number
  paymentStatus: 'unpaid' | 'deposit' | 'paid'
  isAdvanceOrder: boolean
  estimatedMinutes: number
}

export function OrderForm({ onClose, onSubmit }: OrderFormProps) {
  const [step, setStep] = useState(1)
  const [menuFilter, setMenuFilter] = useState<string>('all')

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [specialNotes, setSpecialNotes] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Custom cake builder
  const [customFlavour, setCustomFlavour] = useState('')
  const [customIcing, setCustomIcing] = useState('')
  const [customKg, setCustomKg] = useState(1)
  const [customPrice, setCustomPrice] = useState(0)
  const [customDesc, setCustomDesc] = useState('')

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items]
  )

  const isAdvance = useMemo(() => {
    if (!pickupDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(pickupDate)
    due.setHours(0, 0, 0, 0)
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0
  }, [pickupDate])

  const estimatedMinutes = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((item) => {
      if (item.isCustom) return item.customCake ? item.customCake.kilogram * 60 : 120
      const menuItem = bakeryMenu.find((m) => m.name === item.name)
      return menuItem ? menuItem.estimatedMinutes : 45
    }))
  }, [items])

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
    setItems([
      ...items,
      {
        name,
        quantity: 1,
        price: customPrice,
        isCustom: true,
        customCake: {
          flavour: customFlavour,
          icingType: customIcing,
          kilogram: customKg,
          description: customDesc,
        },
      },
    ])
    setCustomFlavour('')
    setCustomIcing('')
    setCustomKg(1)
    setCustomPrice(0)
    setCustomDesc('')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemQty = (index: number, qty: number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], quantity: Math.max(1, qty) }
    setItems(updated)
  }

  const filteredMenu = menuFilter === 'all'
    ? bakeryMenu
    : bakeryMenu.filter((m) => m.category === menuFilter)

  const buildOrderData = (paymentStatus: 'unpaid' | 'deposit' | 'paid', amountPaid: number): NewOrderData => ({
    customerName,
    customerPhone,
    customerEmail: customerEmail || undefined,
    orderType: items.some((i) => i.isCustom) ? 'custom' : 'menu',
    items,
    specialNotes: specialNotes || undefined,
    pickupDate,
    pickupTime,
    deliveryType,
    deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
    totalPrice,
    amountPaid,
    paymentStatus,
    isAdvanceOrder: isAdvance,
    estimatedMinutes,
  })

  const handleSubmitPaid = () => {
    onSubmit(buildOrderData('paid', totalPrice))
  }

  const handleSubmitDeposit = () => {
    onSubmit(buildOrderData('deposit', Math.ceil(totalPrice / 2)))
  }

  const handleSaveUnpaid = () => {
    onSubmit(buildOrderData('unpaid', 0))
  }

  const canProceedStep1 = items.length > 0
  const canProceedStep2 = customerName && customerPhone && pickupDate && pickupTime && (deliveryType === 'pickup' || deliveryAddress)

  return (
    <Card className="border-0 shadow-lg bg-card max-h-[90vh] overflow-hidden flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4 shrink-0">
        <div>
          <CardTitle className="text-xl font-semibold text-foreground">New Order</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Step {step} of 3 - {step === 1 ? 'Select Items' : step === 2 ? 'Customer & Delivery' : 'Payment & Save'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      {/* Step indicator */}
      <div className="flex gap-1 px-6 pt-4 shrink-0">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      <CardContent className="pt-4 overflow-y-auto flex-1">
        {/* ===== STEP 1: ITEMS ===== */}
        {step === 1 && (
          <div className="space-y-5">
            <Tabs defaultValue="menu" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="menu" className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Menu Items
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <Cake className="h-4 w-4" />
                  Custom Cake
                </TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  {['all', 'cake', 'bread', 'pastry', 'snack'].map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      size="sm"
                      variant={menuFilter === cat ? 'default' : 'outline'}
                      onClick={() => setMenuFilter(cat)}
                      className={menuFilter !== cat ? 'bg-transparent' : ''}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="grid gap-2 max-h-[260px] overflow-y-auto pr-1">
                  {filteredMenu.map((item) => {
                    const inCart = items.find((i) => i.name === item.name && !i.isCustom)
                    return (
                      <button
                        type="button"
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                        onClick={() => addMenuItemToOrder(item)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-secondary">${item.price}</span>
                          {inCart && (
                            <Badge className="bg-primary text-primary-foreground text-xs">{inCart.quantity}</Badge>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-4">
                <div className="rounded-lg bg-accent/50 border border-border p-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Cake Flavour</Label>
                      <Select value={customFlavour} onValueChange={setCustomFlavour}>
                        <SelectTrigger><SelectValue placeholder="Select flavour" /></SelectTrigger>
                        <SelectContent>
                          {cakeFlavours.map((f) => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Icing Type</Label>
                      <Select value={customIcing} onValueChange={setCustomIcing}>
                        <SelectTrigger><SelectValue placeholder="Select icing" /></SelectTrigger>
                        <SelectContent>
                          {icingTypes.map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Kilogram (kg)</Label>
                      <Input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={customKg}
                        onChange={(e) => setCustomKg(Number.parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={customPrice || ''}
                        onChange={(e) => setCustomPrice(Number.parseFloat(e.target.value) || 0)}
                        placeholder="Enter price"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cake Description / Message</Label>
                    <Textarea
                      placeholder="e.g., Happy Birthday John, pink theme, 2 tiers..."
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addCustomCake}
                    disabled={!customFlavour || !customIcing || customPrice <= 0}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Custom Cake to Order
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* CART */}
            {items.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Cart ({items.length} items)</h3>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        {item.isCustom && item.customCake && (
                          <p className="text-xs text-muted-foreground">
                            {item.customCake.flavour} / {item.customCake.icingType} / {item.customCake.kilogram}kg
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQty(index, Number.parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center text-sm"
                        />
                        <span className="text-sm font-semibold text-secondary w-16 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-sm font-medium text-foreground">Total</span>
                  <span className="text-lg font-bold text-secondary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next: Customer Details
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: CUSTOMER & DELIVERY ===== */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Customer Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+1 555-0000" required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@example.com" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Pickup / Delivery</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input id="time" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
                </div>
              </div>

              {isAdvance && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800">
                    This is an advance order. Customer can pay 50% deposit now and the rest on pickup/delivery day.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                <Switch
                  id="delivery"
                  checked={deliveryType === 'delivery'}
                  onCheckedChange={(checked) => setDeliveryType(checked ? 'delivery' : 'pickup')}
                />
                <Label htmlFor="delivery" className="cursor-pointer">
                  Customer wants delivery
                </Label>
              </div>

              {deliveryType === 'delivery' && (
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full delivery address"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Special Notes</Label>
              <Textarea
                id="notes"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Any special requests or notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button
                type="button"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Next: Payment
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: PAYMENT ===== */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Order Summary</h3>
              <div className="rounded-lg bg-accent/50 border border-border p-4 space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Customer:</span> <span className="font-medium text-foreground">{customerName}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> <span className="font-medium text-foreground">{customerPhone}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{pickupDate} at {pickupTime}</span></p>
                <p className="text-sm"><span className="text-muted-foreground">Type:</span> <span className="font-medium text-foreground">{deliveryType === 'delivery' ? 'Delivery' : 'Customer Pickup'}</span></p>
                {deliveryType === 'delivery' && (
                  <p className="text-sm"><span className="text-muted-foreground">Address:</span> <span className="font-medium text-foreground">{deliveryAddress}</span></p>
                )}
                <p className="text-sm"><span className="text-muted-foreground">Est. time:</span> <span className="font-medium text-foreground">~{estimatedMinutes} minutes</span></p>
              </div>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.name} x{item.quantity}</span>
                    <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold border-t border-border pt-2 mt-2">
                  <span className="text-foreground">Total</span>
                  <span className="text-secondary">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </h3>

              <div className="grid gap-3">
                {/* Full Payment */}
                <button
                  type="button"
                  className="rounded-xl border-2 border-green-300 bg-green-50 p-4 text-left transition-all hover:border-green-500 hover:shadow-sm"
                  onClick={handleSubmitPaid}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-900">Full Payment</p>
                      <p className="text-xs text-green-700 mt-0.5">Customer pays now. Order goes to Post to Baker queue.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-800">${totalPrice.toFixed(2)}</p>
                      <Badge className="bg-green-600 text-white border-0 text-xs mt-1">Ready to Post</Badge>
                    </div>
                  </div>
                </button>

                {/* Deposit - only for advance orders */}
                {isAdvance && (
                  <button
                    type="button"
                    className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-left transition-all hover:border-amber-500 hover:shadow-sm"
                    onClick={handleSubmitDeposit}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-amber-900">50% Deposit</p>
                        <p className="text-xs text-amber-700 mt-0.5">Customer pays half. Balance ${(totalPrice / 2).toFixed(2)} on pickup/delivery day.</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-amber-800">${(totalPrice / 2).toFixed(2)}</p>
                        <Badge className="bg-amber-600 text-white border-0 text-xs mt-1">Advance Order</Badge>
                      </div>
                    </div>
                  </button>
                )}

                {/* Save without payment */}
                <button
                  type="button"
                  className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                  onClick={handleSaveUnpaid}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Order - Await Payment
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Customer hasn{"'"}t paid yet. Save order and come back to confirm payment later.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-muted-foreground">${totalPrice.toFixed(2)}</p>
                      <Badge variant="outline" className="text-xs mt-1 bg-transparent">Unpaid</Badge>
                    </div>
                  </div>
                </button>
              </div>

              {!isAdvance && (
                <p className="text-xs text-muted-foreground">
                  Deposit option is available for advance (future date) orders only.
                </p>
              )}
            </div>

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
