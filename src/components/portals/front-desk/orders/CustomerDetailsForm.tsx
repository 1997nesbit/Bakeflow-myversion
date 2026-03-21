'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Star } from 'lucide-react'

interface CustomerDetailsFormProps {
  customerName: string
  customerPhone: string
  customerEmail: string
  isGoldCustomer: boolean
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
  onGoldChange: (v: boolean) => void
}

export function CustomerDetailsForm({
  customerName, customerPhone, customerEmail, isGoldCustomer,
  onNameChange, onPhoneChange, onEmailChange, onGoldChange,
}: CustomerDetailsFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Customer Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={customerName} onChange={(e) => onNameChange(e.target.value)} placeholder="Customer name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" value={customerPhone} onChange={(e) => onPhoneChange(e.target.value)} placeholder="+1 555-0000" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" value={customerEmail} onChange={(e) => onEmailChange(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 h-[40px]">
            <Switch id="gold" checked={isGoldCustomer} onCheckedChange={onGoldChange} />
            <Label htmlFor="gold" className="cursor-pointer flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              Gold Customer
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}
