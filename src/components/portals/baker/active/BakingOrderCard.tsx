'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Play,
  Pause,
  CheckCircle,
  Cake,
  FileText,
  Layers,
} from 'lucide-react'
import type { Order } from '@/types/order'
import type { BulkBatch, FulfillmentChoice } from '@/types/production'
import { orderTypeLabels } from '@/data/constants/labels'

interface TimerDisplay {
  min: number
  sec: number
  pct: number
  running: boolean
  overdue: boolean
}

interface Props {
  order: Order
  td: TimerDisplay
  fulfillment: FulfillmentChoice | undefined
  batch: BulkBatch | undefined
  hasTimer: boolean
  onStartTimer: () => void
  onPauseTimer: () => void
  onSendToQA: () => void
}

export function BakingOrderCard({
  order,
  td,
  fulfillment,
  batch,
  hasTimer,
  onStartTimer,
  onPauseTimer,
  onSendToQA,
}: Props) {
  return (
    <Card
      className="border-2 shadow-sm transition-all"
      style={{
        borderColor: td.overdue ? '#CA0123' : td.running ? '#e66386' : undefined,
        background: td.overdue || td.running ? '#fdf2f4' : undefined,
      }}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-bold text-foreground">{order.id}</p>
              <Badge variant="outline" className="text-[10px] bg-transparent">
                {orderTypeLabels[order.orderType]}
              </Badge>
              {fulfillment && (
                <Badge
                  className="text-[10px] text-white border-0"
                  style={{ background: fulfillment.method === 'from_batch' ? '#22c55e' : '#CA0123' }}
                >
                  {fulfillment.method === 'from_batch' ? `From: ${fulfillment.batchItemName}` : 'Bake Fresh'}
                </Badge>
              )}
              {batch && (
                <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>
                  <Layers className="mr-1 h-2.5 w-2.5" />
                  {batch.name}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{order.customer.name}</p>
          </div>
          {td.overdue ? (
            <Badge className="text-white border-0 animate-pulse text-xs" style={{ background: '#CA0123' }}>
              OVERDUE
            </Badge>
          ) : td.running ? (
            <Badge className="text-white border-0 text-xs" style={{ background: '#e66386' }}>
              BAKING
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-transparent text-xs">READY</Badge>
          )}
        </div>

        {/* Timer */}
        <div className="rounded-xl p-4 text-center" style={{ background: td.overdue ? '#fce7ea' : '#fdf2f4' }}>
          <p
            className="text-4xl font-mono font-bold tabular-nums"
            style={{ color: td.overdue ? '#CA0123' : undefined }}
          >
            {String(td.min).padStart(2, '0')}:{String(td.sec).padStart(2, '0')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">of {order.estimatedMinutes} min</p>
          <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${td.pct}%`,
                background: td.overdue ? '#CA0123' : td.pct > 75 ? '#e66386' : '#22c55e',
              }}
            />
          </div>
        </div>

        {!hasTimer || !td.running ? (
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white border-0" onClick={onStartTimer}>
            <Play className="mr-2 h-4 w-4" />
            {hasTimer ? 'Resume' : 'Start Timer'}
          </Button>
        ) : (
          <Button variant="outline" className="w-full bg-transparent" onClick={onPauseTimer}>
            <Pause className="mr-2 h-4 w-4" />Pause
          </Button>
        )}

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-start justify-between">
                <p className="font-medium text-sm text-foreground">{item.name}</p>
                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
              </div>
              {item.isCustom && item.customCake && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#e66386' }}>
                  <Cake className="h-3 w-3" />
                  {item.customCake.flavour} &middot; {item.customCake.icingType} &middot; {item.customCake.kilogram}kg
                </p>
              )}
            </div>
          ))}
        </div>

        {order.cakeDescription && (
          <div
            className="flex items-start gap-2 rounded-lg border p-3"
            style={{ background: '#fce7ea', borderColor: '#fbd5db' }}
          >
            <Cake className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#CA0123' }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#CA0123' }}>
                Cake Description
              </p>
              <p className="text-xs" style={{ color: '#CA0123' }}>{order.cakeDescription}</p>
            </div>
          </div>
        )}

        {order.noteForCustomer && (
          <div
            className="flex items-start gap-2 rounded-lg border p-3"
            style={{ background: '#fdf2f4', borderColor: '#fbd5db' }}
          >
            <FileText className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#e66386' }} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#e66386' }}>
                Write on cake
              </p>
              <p className="text-xs text-foreground">{order.noteForCustomer}</p>
            </div>
          </div>
        )}

        <Button
          className="w-full text-white border-0"
          style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
          onClick={onSendToQA}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {'Done Baking → QA Check'}
        </Button>
      </CardContent>
    </Card>
  )
}
