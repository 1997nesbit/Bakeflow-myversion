'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Order } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import {
  DollarSign,
  Clock,
  Calendar,
  Truck,
  User,
  AlertTriangle,
  MessageSquare,
  Bell,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  TimerOff,
} from 'lucide-react'

// ── Per-button result state ────────────────────────────────────────────────────
type SendStatus = 'idle' | 'sending' | 'success' | 'error' | 'timeout'

interface ButtonState {
  reminder: SendStatus
  overdue: SendStatus
}

const DEFAULT_STATE: ButtonState = { reminder: 'idle', overdue: 'idle' }

// ── Inline status pill shown below each button ────────────────────────────────
function StatusPill({ status, label }: { status: SendStatus; label: string }) {
  if (status === 'idle' || status === 'sending') return null
  const variants = {
    success: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: 'bg-green-50 border border-green-200 text-green-700',
      text: `${label} sent ✓`,
    },
    error: {
      icon: <XCircle className="h-3 w-3" />,
      className: 'bg-red-50 border border-red-200 text-red-700',
      text: 'Failed to send',
    },
    timeout: {
      icon: <TimerOff className="h-3 w-3" />,
      className: 'bg-amber-50 border border-amber-200 text-amber-700',
      text: 'Timed out — retry',
    },
  } as const

  const v = variants[status as 'success' | 'error' | 'timeout']
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${v.className}`}>
      {v.icon}
      {v.text}
    </span>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function classifyError(err: unknown): 'timeout' | 'error' {
  const code = (err as { code?: string })?.code
  const msg = (err as { message?: string })?.message ?? ''
  return code === 'ECONNABORTED' || msg.includes('timeout') ? 'timeout' : 'error'
}

// ─────────────────────────────────────────────────────────────────────────────

interface AwaitingPaymentTabProps {
  pendingPayment: Order[]
  onConfirmPaymentClick: (order: Order) => void
  onOpenMessage: (order: Order) => void
}

export function AwaitingPaymentTab({
  pendingPayment,
  onConfirmPaymentClick,
  onOpenMessage,
}: AwaitingPaymentTabProps) {
  // Map from orderId → per-button status
  const [statuses, setStatuses] = useState<Record<string, ButtonState>>({})

  const getStatus = (orderId: string): ButtonState =>
    statuses[orderId] ?? DEFAULT_STATE

  const setBtn = useCallback(
    (orderId: string, action: 'reminder' | 'overdue', status: SendStatus) => {
      setStatuses(prev => ({
        ...prev,
        [orderId]: { ...((prev[orderId]) ?? DEFAULT_STATE), [action]: status },
      }))
      // Auto-reset terminal states after 4 s so the pill doesn't linger forever
      if (status === 'success' || status === 'error' || status === 'timeout') {
        setTimeout(() =>
          setStatuses(prev => ({
            ...prev,
            [orderId]: { ...((prev[orderId]) ?? DEFAULT_STATE), [action]: 'idle' },
          })), 4000)
      }
    },
    [],
  )

  const handleReminder = async (order: Order) => {
    setBtn(order.id, 'reminder', 'sending')
    try {
      await ordersService.sendPaymentReminder(order.id)
      setBtn(order.id, 'reminder', 'success')
    } catch (err) {
      setBtn(order.id, 'reminder', classifyError(err))
    }
  }

  const handleOverdue = async (order: Order) => {
    setBtn(order.id, 'overdue', 'sending')
    try {
      await ordersService.sendOverdueNotice(order.id)
      setBtn(order.id, 'overdue', 'success')
    } catch (err) {
      setBtn(order.id, 'overdue', classifyError(err))
    }
  }

  return (
    <div className="space-y-4">
      {pendingPayment.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No orders awaiting payment</p>
          <p className="text-sm text-muted-foreground/70 mt-1">All orders are paid or saved orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-1 mb-4">
          <p className="text-sm text-muted-foreground">
            {pendingPayment.length} order{pendingPayment.length === 1 ? '' : 's'} awaiting customer payment. Confirm payment to move to baker queue.
          </p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {pendingPayment.map(order => {
          const s = getStatus(order.id)
          const reminderBusy = s.reminder === 'sending'
          const overdueBusy  = s.overdue  === 'sending'
          const anyBusy      = reminderBusy || overdueBusy

          return (
            <Card key={order.id} className="border border-amber-200 bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  {/* Order ID + Customer */}
                  <div className="min-w-0 w-40 shrink-0">
                    <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                    <p className="text-xs font-mono text-primary/70 mt-0.5">{order.trackingId}</p>
                  </div>

                  {/* Items summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {order.items?.map(item => (
                        <span key={item.name} className="text-xs text-muted-foreground">
                          {item.name} <span className="font-medium text-foreground">×{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                      <span className="flex items-center gap-1">
                        {order.deliveryType === 'delivery'
                          ? <><Truck className="h-3 w-3 text-secondary" />Delivery</>
                          : <><User className="h-3 w-3" />Pickup</>}
                      </span>
                      {order.isAdvanceOrder && (
                        <span className="flex items-center gap-1 text-amber-700">
                          <AlertTriangle className="h-3 w-3" />Advance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amount + badge */}
                  <div className="text-right shrink-0 w-36">
                    <p className="text-base font-bold text-secondary">TZS {order.totalPrice.toLocaleString()}</p>
                    {order.paymentStatus === 'deposit' ? (
                      <>
                        <p className="text-xs text-muted-foreground">Paid: TZS {order.amountPaid.toLocaleString()}</p>
                        <p className="text-xs text-amber-700 font-medium">
                          Bal: TZS {(order.totalPrice - order.amountPaid).toLocaleString()}
                        </p>
                        <Badge className="bg-blue-100 text-blue-800 border-0 text-xs mt-0.5">Deposit</Badge>
                      </>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">Unpaid</Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {/* Row 1: Confirm payment + Message */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onConfirmPaymentClick(order)}
                      >
                        <DollarSign className="mr-1 h-4 w-4" /> Confirm Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Message customer"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        onClick={() => onOpenMessage(order)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Row 2: Reminder + Overdue SMS with inline status */}
                    <div className="flex items-end gap-2">
                      <div className="flex flex-col items-center gap-0.5">
                        <Button
                          size="sm"
                          variant="outline"
                          title="Send payment reminder SMS"
                          disabled={anyBusy}
                          className={`border-amber-400 text-amber-700 hover:bg-amber-50 bg-transparent text-xs px-2 py-1 transition-all ${
                            s.reminder === 'success' ? 'border-green-400 text-green-700' :
                            s.reminder === 'error' || s.reminder === 'timeout' ? 'border-red-400 text-red-700' : ''
                          }`}
                          onClick={() => handleReminder(order)}
                        >
                          {reminderBusy
                            ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            : s.reminder === 'success' ? <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                            : s.reminder === 'error' || s.reminder === 'timeout' ? <XCircle className="h-3 w-3 mr-1 text-red-500" />
                            : <Bell className="h-3 w-3 mr-1" />}
                          {reminderBusy ? 'Sending…' : 'Reminder'}
                        </Button>
                        <StatusPill status={s.reminder} label="Reminder" />
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <Button
                          size="sm"
                          variant="outline"
                          title="Send overdue notice SMS"
                          disabled={anyBusy}
                          className={`border-red-400 text-red-700 hover:bg-red-50 bg-transparent text-xs px-2 py-1 transition-all ${
                            s.overdue === 'success' ? 'border-green-400 text-green-700' :
                            s.overdue === 'error' || s.overdue === 'timeout' ? 'border-red-600 text-red-800' : ''
                          }`}
                          onClick={() => handleOverdue(order)}
                        >
                          {overdueBusy
                            ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            : s.overdue === 'success' ? <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                            : s.overdue === 'error' || s.overdue === 'timeout' ? <XCircle className="h-3 w-3 mr-1 text-red-600" />
                            : <AlertCircle className="h-3 w-3 mr-1" />}
                          {overdueBusy ? 'Sending…' : 'Overdue'}
                        </Button>
                        <StatusPill status={s.overdue} label="Overdue notice" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
