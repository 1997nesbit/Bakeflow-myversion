'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { MenuOrderStep } from './MenuOrderStep'
import { CustomCakeStep } from './CustomCakeStep'
import { CustomerDetailsForm } from './CustomerDetailsForm'
import { DateTimeSection } from './DateTimeSection'
import { DeliverySection } from './DeliverySection'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { PaymentActionButtons } from './PaymentActionButtons'
import type { OrderItem, MenuItem, DeliveryType, PaymentMethod, PaymentTerms, NewOrderData } from '@/types/order'
import { bakeryMenu } from '@/data/constants/menus'
import { menuService } from '@/lib/api/services/menu'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'

interface NewOrderPageProps {
  mode: 'menu' | 'custom'
}

export function NewOrderPage({ mode }: NewOrderPageProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [items, setItems] = useState<OrderItem[]>([])

  const [menuItems, setMenuItems] = useState<MenuItem[]>(bakeryMenu)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController()
    menuService.getItems({ signal: controller.signal })
      .then(setMenuItems)
      .catch(handleApiError)
    menuService.getCategories({ signal: controller.signal })
      .then(setCategories)
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  // Customer
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isGoldCustomer, setIsGoldCustomer] = useState(false)

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

  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items])
  const hasCakeItems = mode === 'custom'

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
      const menuItem = menuItems.find((m) => m.name === item.name)
      return menuItem ? menuItem.estimatedMinutes : 45
    }))
  }, [items, menuItems])

  const canProceedStep2 = !!(customerName && customerPhone && pickupDate && pickupTime && (deliveryType === 'pickup' || deliveryAddress))

  const buildOrderData = (paymentStatus: 'unpaid' | 'deposit' | 'paid', amountPaid: number): NewOrderData => ({
    customerName, customerPhone, customerEmail: customerEmail || undefined,
    orderType: hasCakeItems ? 'custom' : 'menu',
    items, specialNotes: specialNotes || undefined,
    cakeDescription: hasCakeItems ? cakeDescription || undefined : undefined,
    noteForCustomer: hasCakeItems ? noteForCustomer || undefined : undefined,
    pickupDate, pickupTime, deliveryType,
    deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
    totalPrice, amountPaid, paymentStatus, paymentMethod, paymentTerms,
    isAdvanceOrder: isAdvance, estimatedMinutes,
  })

  const handleSubmit = async (paymentStatus: 'unpaid' | 'deposit' | 'paid', amountPaid: number) => {
    try {
      await ordersService.create(buildOrderData(paymentStatus, amountPaid))
      if (paymentStatus === 'unpaid') {
        toast.warning(`Order created. Awaiting payment of TZS ${totalPrice.toLocaleString()}`)
      } else {
        toast.success(`Order created! Payment: TZS ${amountPaid.toLocaleString()}`)
      }
      router.push('/front-desk/orders')
    } catch (err) {
      handleApiError(err)
    }
  }

  const stepLabel = step === 1
    ? (mode === 'menu' ? 'Select Items' : 'Build Custom Cake')
    : step === 2 ? 'Customer & Delivery' : 'Payment & Confirm'

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6 max-w-5xl">
        <div className="mb-6">
          <Link href="/front-desk/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'menu' ? 'New Order' : 'New Custom Cake Order'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step} of 3 — {stepLabel}</p>
        </div>

        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        {step === 1 && mode === 'menu' && (
          <MenuOrderStep
            menuItems={menuItems}
            categories={categories}
            items={items}
            onItemsChange={setItems}
            onNext={() => setStep(2)}
            onCancel={() => router.push('/front-desk/orders')}
          />
        )}

        {step === 1 && mode === 'custom' && (
          <CustomCakeStep
            items={items}
            onItemsChange={setItems}
            onNext={() => setStep(2)}
            onCancel={() => router.push('/front-desk/orders')}
          />
        )}

        {step === 2 && (
          <div className="space-y-6">
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

        {step === 3 && (
          <div className="space-y-6">
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
              onSubmitPaid={() => handleSubmit('paid', totalPrice)}
              onSubmitDeposit={() => handleSubmit('deposit', Math.ceil(totalPrice / 2))}
              onSaveUnpaid={() => handleSubmit('unpaid', 0)}
            />
            <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-full bg-transparent">
              Back to Customer Details
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
