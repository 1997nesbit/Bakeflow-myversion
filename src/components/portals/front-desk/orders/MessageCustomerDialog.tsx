'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Link2, Copy } from 'lucide-react'
import type { Order } from '@/types/order'

interface Props {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: () => void
  getTrackingUrl: (trackingId: string) => string
  onCopyLink: (trackingId: string) => void
}

export function MessageCustomerDialog({
  order,
  open,
  onOpenChange,
  onSend,
  getTrackingUrl,
  onCopyLink,
}: Props) {
  const [messageText, setMessageText] = useState('')

  const handleSend = () => {
    onSend()
    setMessageText('')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setMessageText('')
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Message Customer</DialogTitle>
        </DialogHeader>
        {order && (
          <div className="space-y-4">
            <div className="rounded-lg bg-accent p-3">
              <p className="font-medium text-foreground">{order.customerName}</p>
              <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="customer-message" className="text-sm font-medium text-foreground">
                Message
              </label>
              <Textarea
                id="customer-message"
                placeholder="Type message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="min-h-[180px] text-sm leading-relaxed resize-y"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2.5">
              <Link2 className="h-4 w-4 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-600 font-mono flex-1 break-all">
                {getTrackingUrl(order.trackingId)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-blue-700 hover:bg-blue-100 shrink-0"
                onClick={() => onCopyLink(order.trackingId)}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Tracking link is auto-appended to every message sent.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent justify-start"
                onClick={() =>
                  setMessageText(
                    `Hi ${order.customerName}, your order ${order.id} is ready for pickup! Track here: ${getTrackingUrl(order.trackingId)}`
                  )
                }
              >
                Ready for Pickup
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent justify-start"
                onClick={() =>
                  setMessageText(
                    `Hi ${order.customerName}, your order ${order.id} is out for delivery! Track live: ${getTrackingUrl(order.trackingId)}`
                  )
                }
              >
                Out for Delivery
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent justify-start"
                onClick={() =>
                  setMessageText(
                    `Hi ${order.customerName}, we are waiting for your payment of TZS ${order.totalPrice.toLocaleString()} for order ${order.id}. Please confirm. Track: ${getTrackingUrl(order.trackingId)}`
                  )
                }
              >
                Payment Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-transparent justify-start"
                onClick={() =>
                  setMessageText(
                    `Hi ${order.customerName}, your order has a balance of TZS ${(order.totalPrice - order.amountPaid).toLocaleString()}. Track: ${getTrackingUrl(order.trackingId)}`
                  )
                }
              >
                Balance Reminder
              </Button>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="mr-2 h-4 w-4" /> Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
