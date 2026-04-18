'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { DeliveryType } from '@/types/order'

interface DeliverySectionProps {
  deliveryType: DeliveryType
  deliveryAddress: string
  onDeliveryTypeChange: (v: DeliveryType) => void
  onAddressChange: (v: string) => void
}

export function DeliverySection({ deliveryType, deliveryAddress, onDeliveryTypeChange, onAddressChange }: DeliverySectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Delivery</h3>
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
        <Switch
          id="delivery"
          checked={deliveryType === 'delivery'}
          onCheckedChange={(checked) => onDeliveryTypeChange(checked ? 'delivery' : 'pickup')}
        />
        <Label htmlFor="delivery" className="cursor-pointer">Customer wants delivery</Label>
      </div>
      {deliveryType === 'delivery' && (
        <div className="space-y-2">
          <Label htmlFor="address">Delivery Address *</Label>
          <Textarea id="address" value={deliveryAddress} onChange={(e) => onAddressChange(e.target.value)} placeholder="Enter full delivery address" required />
        </div>
      )}
    </div>
  )
}
