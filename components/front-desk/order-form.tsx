'use client'

import React from "react"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, X } from 'lucide-react'
import { OrderType } from '@/lib/mock-data'

interface OrderFormProps {
  onClose: () => void
  onSubmit: (order: NewOrderData) => void
}

export interface NewOrderData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderType: OrderType
  items: { name: string; quantity: number; price: number; customization?: string }[]
  specialNotes?: string
  pickupDate: string
  pickupTime: string
  isDelivery: boolean
  deliveryAddress?: string
}

export function OrderForm({ onClose, onSubmit }: OrderFormProps) {
  const [formData, setFormData] = useState<NewOrderData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    orderType: 'cake',
    items: [{ name: '', quantity: 1, price: 0 }],
    specialNotes: '',
    pickupDate: '',
    pickupTime: '',
    isDelivery: false,
    deliveryAddress: '',
  })

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const totalPrice = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  )

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
        <CardTitle className="text-xl font-semibold">New Order</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Customer Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Name</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="Customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="+1 555-0000"
                  required
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customerEmail">Email (optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Order Details</h3>
            <div className="space-y-2">
              <Label>Order Type</Label>
              <Select
                value={formData.orderType}
                onValueChange={(value: OrderType) =>
                  setFormData({ ...formData, orderType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cake">Cake</SelectItem>
                  <SelectItem value="bread">Bread</SelectItem>
                  <SelectItem value="pastry">Pastry</SelectItem>
                  <SelectItem value="custom">Custom Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-4"
                >
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Item Name</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="e.g., Chocolate Cake"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, 'quantity', parseInt(e.target.value) || 1)
                      }
                      required
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, 'price', parseFloat(e.target.value) || 0)
                        }
                        required
                      />
                    </div>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup / Delivery */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Pickup/Delivery Date</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Time</Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <Switch
                id="isDelivery"
                checked={formData.isDelivery}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDelivery: checked })
                }
              />
              <Label htmlFor="isDelivery" className="cursor-pointer">
                This is a delivery order
              </Label>
            </div>

            {formData.isDelivery && (
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryAddress: e.target.value })
                  }
                  placeholder="Enter full delivery address"
                  required={formData.isDelivery}
                />
              </div>
            )}
          </div>

          {/* Special Notes */}
          <div className="space-y-2">
            <Label htmlFor="specialNotes">Special Notes</Label>
            <Textarea
              id="specialNotes"
              value={formData.specialNotes}
              onChange={(e) =>
                setFormData({ ...formData, specialNotes: e.target.value })
              }
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>

          {/* Total & Submit */}
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Create Order
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
