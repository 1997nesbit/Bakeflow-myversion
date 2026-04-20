import React from 'react'
import {
  Check, Clock, ChefHat, PackageCheck, Truck, Phone,
  CalendarDays, ShoppingBag, Home, MapPin, AlertCircle, BadgeCheck,
} from 'lucide-react'
import type { OrderTrackingResponse } from '@/types/order'

interface OrderTrackerProps {
  order: OrderTrackingResponse
}

/* Status → stage index */
const STATUS_INDEX: Record<string, number> = {
  pending: 0, paid: 0,
  baker: 1, quality: 1, decorator: 1, packing: 1,
  ready: 2,
  dispatched: 3,
  delivered: 4,
}

/* Friendly status labels (icon-only in the badge, text only) */
const STATUS_META: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  pending:   { label: 'Awaiting confirmation', Icon: Clock,       color: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid:      { label: 'Confirmed',             Icon: BadgeCheck,  color: 'bg-green-50 text-green-700 border-green-200' },
  baker:     { label: 'Baking',                Icon: ChefHat,     color: 'bg-orange-50 text-orange-700 border-orange-200' },
  quality:   { label: 'Quality check',         Icon: Check,       color: 'bg-blue-50 text-blue-700 border-blue-200' },
  decorator: { label: 'Decorating',            Icon: ChefHat,     color: 'bg-purple-50 text-purple-700 border-purple-200' },
  packing:   { label: 'Packing',               Icon: PackageCheck,color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ready:     { label: 'Ready!',                Icon: BadgeCheck,  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  dispatched:{ label: 'On the way',            Icon: Truck,       color: 'bg-sky-50 text-sky-700 border-sky-200' },
  delivered: { label: 'Delivered',             Icon: Check,       color: 'bg-green-50 text-green-700 border-green-200' },
}

export function OrderTracker({ order }: OrderTrackerProps) {
  const isDelivery = order.deliveryType === 'delivery'

  /* Each stage: Icon rendered directly (no emoji) */
  const STAGES: { label: string; sub: string; Icon: React.ElementType }[] = [
    { label: 'Order Received',                                    sub: "We've got your order!",           Icon: ClipboardList },
    { label: 'In the Kitchen',                                    sub: 'Being baked with love',           Icon: ChefHat },
    { label: isDelivery ? 'Ready for Dispatch' : 'Ready for Pickup', sub: isDelivery ? 'Packed and waiting for a driver' : 'Come collect your order', Icon: PackageCheck },
    ...(isDelivery ? [{ label: 'On the Way', sub: 'Your order is en route', Icon: Truck }] : []),
    { label: isDelivery ? 'Delivered' : 'Picked Up',             sub: isDelivery ? 'Enjoy your order!' : "Hope you love it!",  Icon: isDelivery ? Home : BadgeCheck },
  ]

  const rawIndex          = STATUS_INDEX[order.status] ?? 0
  const currentStageIndex = Math.min(rawIndex, STAGES.length - 1)
  const progressPct       = STAGES.length <= 1 ? 100 : (currentStageIndex / (STAGES.length - 1)) * 100
  const meta              = STATUS_META[order.status] ?? { label: order.status, Icon: AlertCircle, color: 'bg-gray-50 text-gray-700 border-gray-200' }
  const StatusIcon        = meta.Icon

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl shadow-red-100/50" style={{ background: 'linear-gradient(160deg, #ffffff 0%, #fff5f7 100%)' }}>

      {/* ── Hero banner ──────────────────────────────────────────── */}
      <div
        className="relative px-6 py-8 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #CA0123 0%, #e66386 100%)' }}
      >
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-red-100 text-xs font-semibold uppercase tracking-widest mb-1">Tracking</p>
            <h2 className="text-3xl font-black text-white tracking-tight">{order.trackingId}</h2>
            <p className="text-red-200 text-sm mt-1">
              Hello, <span className="font-bold text-white">{order.customerName.split(' ')[0]}</span>
            </p>
          </div>
          {/* Status badge — icon + text, no emoji */}
          <span className={`shrink-0 text-[11px] font-bold border rounded-xl px-3 py-1.5 flex items-center gap-1.5 ${meta.color}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {meta.label}
          </span>
        </div>
      </div>

      {/* ── Details grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 px-6 pt-5">
        {/* Date & Time */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Date &amp; Time
          </p>
          <p className="font-bold text-gray-900 text-sm leading-tight">{order.pickupDate}</p>
          <p className="text-gray-500 text-xs mt-0.5">{order.pickupTime}</p>
        </div>
        {/* Type */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1">
            {isDelivery ? <Truck className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
            {isDelivery ? 'Delivery' : 'Pickup'}
          </p>
          <p className="font-bold text-gray-900 text-sm">{isDelivery ? 'Home delivery' : 'In-store pickup'}</p>
          <p className="text-gray-500 text-xs mt-0.5">{isDelivery ? 'To your door' : 'Visit the shop'}</p>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Progress</p>
          <p className="text-[10px] font-bold text-gray-400">{Math.round(progressPct)}%</p>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #e66386 0%, #CA0123 100%)' }}
          />
        </div>
      </div>

      {/* ── Stepper ──────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-6 space-y-0">
        {STAGES.map((stage, idx) => {
          const isPast    = idx < currentStageIndex
          const isCurrent = idx === currentStageIndex
          const isLast    = idx === STAGES.length - 1
          const Icon      = stage.Icon

          return (
            <div key={idx} className="flex gap-4">
              {/* Connector column */}
              <div className="flex flex-col items-center" style={{ width: 48, minWidth: 48 }}>
                {/* Circle */}
                <div
                  className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-700 ${
                    isPast    ? 'border-transparent shadow-md shadow-red-200/60' :
                    isCurrent ? 'border-[#CA0123] bg-white shadow-lg shadow-red-300/40' :
                                'border-gray-200 bg-gray-50'
                  }`}
                  style={{
                    width: 48, height: 48,
                    background: isPast ? 'linear-gradient(135deg, #e66386, #CA0123)' : undefined,
                    transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
                  }}
                >
                  {isPast
                    ? <Check className="h-5 w-5 text-white stroke-[3]" />
                    : <Icon className={`h-5 w-5 ${isCurrent ? 'text-[#CA0123]' : 'text-gray-400'}`} />
                  }
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full border-2 border-[#CA0123] animate-ping opacity-30" />
                  )}
                </div>
                {/* Vertical connector */}
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 my-1.5 rounded-full transition-all duration-700"
                    style={{
                      minHeight: 24,
                      background: isPast ? 'linear-gradient(to bottom, #CA0123, #e66386)' : '#e5e7eb',
                    }}
                  />
                )}
              </div>

              {/* Text */}
              <div className={`flex-1 ${isLast ? 'pb-2' : 'pb-5'}`}>
                <p className={`font-bold text-sm leading-tight transition-colors ${
                  isCurrent ? 'text-[#CA0123]' : isPast ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {stage.label}
                </p>
                <p className={`text-xs mt-0.5 ${isCurrent ? 'text-red-400 font-medium animate-pulse' : isPast ? 'text-gray-500' : 'text-gray-300'}`}>
                  {isCurrent ? stage.sub : isPast ? 'Completed' : stage.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Footer strip ─────────────────────────────────────────── */}
      <div className="mx-4 mb-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 px-4 py-3">
        <Phone className="h-4 w-4 shrink-0" style={{ color: '#CA0123' }} />
        <p className="text-xs text-gray-600">
          Questions? <span className="font-bold" style={{ color: '#CA0123' }}>Call the bakery</span> or reply to the SMS we sent you.
        </p>
      </div>
    </div>
  )
}

/* ── Local alias for Clipboard icon (not in standard lucide set) ─────── */
function ClipboardList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
  )
}
