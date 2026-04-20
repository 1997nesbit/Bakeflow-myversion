'use client'

import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Send, Link2, Copy, Loader2, CheckCircle2, XCircle, TimerOff } from 'lucide-react'
import type { Order } from '@/types/order'
import { notificationsService } from '@/lib/api/services/notifications'
import type { MessageTemplate } from '@/types/notification'

// ── Status types ─────────────────────────────────────────────────────────────
type SendStatus = 'idle' | 'sending' | 'success' | 'error' | 'timeout'

function classifyError(err: unknown): 'timeout' | 'error' {
  const code = (err as { code?: string })?.code
  const msg = (err as { message?: string })?.message ?? ''
  return code === 'ECONNABORTED' || msg.includes('timeout') ? 'timeout' : 'error'
}

// ── Inline result banner ──────────────────────────────────────────────────────
function StatusBanner({ status, recipientName }: { status: SendStatus; recipientName: string }) {
  if (status === 'idle' || status === 'sending') return null

  const config = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />,
      bg: 'bg-green-50 border-green-200',
      title: 'Message sent!',
      desc: `Your message was delivered to ${recipientName}.`,
    },
    error: {
      icon: <XCircle className="h-5 w-5 shrink-0 text-red-500" />,
      bg: 'bg-red-50 border-red-200',
      title: 'Failed to send',
      desc: 'Check your notification gateway settings and try again.',
    },
    timeout: {
      icon: <TimerOff className="h-5 w-5 shrink-0 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
      title: 'Request timed out',
      desc: 'The SMS gateway took too long to respond. The message may not have been delivered.',
    },
  } as const

  const c = config[status as 'success' | 'error' | 'timeout']
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${c.bg}`}>
      {c.icon}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{c.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend: () => void
  getTrackingUrl: (trackingId: string) => string
  onCopyLink: (trackingId: string) => void
}

export function MessageCustomerDialog({
  order, open, onOpenChange, onSend, getTrackingUrl, onCopyLink,
}: Props) {
  const [messageText, setMessageText]   = useState('')
  const [templates, setTemplates]       = useState<MessageTemplate[]>([])
  const [selectedTpl, setSelectedTpl]   = useState('')
  const [sendStatus, setSendStatus]     = useState<SendStatus>('idle')
  const [loadingTpls, setLoadingTpls]   = useState(false)

  const sending = sendStatus === 'sending'

  // Load templates when dialog opens; reset status when it closes
  useEffect(() => {
    if (!open) {
      setSendStatus('idle')
      return
    }
    setLoadingTpls(true)
    notificationsService.getTemplates()
      .then(res => {
        setTemplates(res.results.filter(t => t.isActive && !t.isAutomated))
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingTpls(false))
  }, [open])

  const handleTemplateSelect = (id: string) => {
    setSelectedTpl(id)
    const tpl = templates.find(t => t.id === id)
    if (!tpl || !order) return
    const resolved = tpl.content
      .replace(/\{\{customer_name\}\}/g, order.customer.name)
      .replace(/\{\{order_no\}\}/g, `#${order.trackingId}`)
      .replace(/\{\{link\}\}/g, getTrackingUrl(order.trackingId))
      .replace(/\{\{balance\}\}/g, `TZS ${Math.max(0, order.totalPrice - order.amountPaid).toLocaleString()}`)
      .replace(/\{\{total_price\}\}/g, `TZS ${order.totalPrice.toLocaleString()}`)
    setMessageText(resolved)
  }

  const handleSend = async () => {
    if (!order || !messageText.trim()) return
    setSendStatus('sending')
    try {
      await notificationsService.sendCampaign({
        name: `Direct message to ${order.customer.name}`,
        messageContent: messageText,
        recipients: [order.customer.phone],
      })
      setSendStatus('success')
      // Close the dialog after a brief moment so the user sees the success banner
      setTimeout(() => {
        onSend()
        reset()
      }, 1800)
    } catch (err) {
      setSendStatus(classifyError(err))
    }
  }

  const reset = () => {
    setMessageText('')
    setSelectedTpl('')
    setSendStatus('idle')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset()
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
            {/* Customer info */}
            <div className="rounded-lg bg-accent p-3">
              <p className="font-medium text-foreground">{order.customer.name}</p>
              <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
            </div>

            {/* Inline status banner — replaces the compose area after send */}
            {sendStatus !== 'idle' && sendStatus !== 'sending' ? (
              <StatusBanner status={sendStatus} recipientName={order.customer.name} />
            ) : (
              <>
                {/* Template picker */}
                <div className="space-y-1">
                  <Label className="text-sm">Use a Template (optional)</Label>
                  {loadingTpls ? (
                    <div className="flex items-center gap-2 text-muted-foreground text-sm py-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading templates…
                    </div>
                  ) : (
                    <Select value={selectedTpl} onValueChange={handleTemplateSelect}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Message text */}
                <div className="space-y-1">
                  <Label htmlFor="customer-message" className="text-sm">Message</Label>
                  <Textarea
                    id="customer-message"
                    placeholder="Type a message or pick a template above..."
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    className="min-h-[160px] text-sm leading-relaxed resize-y"
                  />
                </div>

                {/* Tracking link */}
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 p-2.5">
                  <Link2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-600 font-mono flex-1 break-all">
                    {getTrackingUrl(order.trackingId)}
                  </p>
                  <Button
                    variant="ghost" size="sm"
                    className="h-7 px-2 text-blue-700 hover:bg-blue-100 shrink-0"
                    onClick={() => onCopyLink(order.trackingId)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="bg-transparent"
          >
            {sendStatus === 'success' ? 'Close' : 'Cancel'}
          </Button>

          {/* Hide Send button after success — show Retry on failure */}
          {sendStatus === 'success' ? null : (
            <Button
              onClick={sendStatus === 'error' || sendStatus === 'timeout' ? handleSend : handleSend}
              disabled={!messageText.trim() || sending}
              className={`text-primary-foreground transition-colors ${
                sendStatus === 'error' || sendStatus === 'timeout'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {sending
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : sendStatus === 'error' || sendStatus === 'timeout'
                ? <XCircle className="mr-2 h-4 w-4" />
                : <Send className="mr-2 h-4 w-4" />}
              {sending ? 'Sending…'
                : sendStatus === 'error' ? 'Retry'
                : sendStatus === 'timeout' ? 'Retry'
                : 'Send'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
