'use client'

import { useRef, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Star, Search } from 'lucide-react'
import type { CustomerRecord } from '@/types/customer'

interface CustomerDetailsFormProps {
  customerName: string
  customerPhone: string
  customerEmail: string
  isGoldCustomer: boolean
  customers: CustomerRecord[]
  onNameChange: (v: string) => void
  onPhoneChange: (v: string) => void
  onEmailChange: (v: string) => void
  onGoldChange: (v: boolean) => void
  onCustomerSelect: (customer: CustomerRecord) => void
}

export function CustomerDetailsForm({
  customerName, customerPhone, customerEmail, isGoldCustomer,
  customers,
  onNameChange, onPhoneChange, onEmailChange, onGoldChange, onCustomerSelect,
}: CustomerDetailsFormProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = customerName.trim().length > 0
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(customerName.toLowerCase())
      ).slice(0, 8)
    : []

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleNameChange(v: string) {
    onNameChange(v)
    setShowDropdown(true)
  }

  function handleSelect(customer: CustomerRecord) {
    onCustomerSelect(customer)
    setShowDropdown(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Customer Details</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 relative" ref={wrapperRef}>
          <Label htmlFor="name">Name *</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              id="name"
              value={customerName}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => { if (customerName.trim().length > 0) setShowDropdown(true) }}
              placeholder="Search or enter customer name"
              required
              className="pl-8"
            />
          </div>
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-y-auto">
              {filtered.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-center justify-between gap-2"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(customer)}
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{customer.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{customer.phone}</span>
                  </div>
                  {customer.isGold && (
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
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
