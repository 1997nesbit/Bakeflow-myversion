import React from 'react'
import { Check, Clock, ChefHat, PackageCheck, Truck, MapPin } from 'lucide-react'
import type { OrderTrackingResponse } from '@/types/order'

interface OrderTrackerProps {
  order: OrderTrackingResponse
}

export function OrderTracker({ order }: OrderTrackerProps) {
  // Define our overarching tracking stages
  const STAGES = [
    { id: ' received', label: 'Order Received', icon: Clock },
    { id: 'kitchen', label: 'In Kitchen', icon: ChefHat },
    { id: 'ready', label: order.deliveryType === 'delivery' ? 'Ready for Dispatch' : 'Ready for Pickup', icon: PackageCheck },
    ...(order.deliveryType === 'delivery' ? [{ id: 'dispatched', label: 'On the Way', icon: Truck }] : []),
    { id: 'delivered', label: order.deliveryType === 'delivery' ? 'Delivered' : 'Picked Up', icon: Check },
  ]

  // Map backend status to our tracking stages
  const currentStageIndex = (() => {
    switch (order.status) {
      case 'pending':
      case 'paid':
        return 0
      case 'baker':
      case 'quality':
      case 'decorator':
      case 'packing':
        return 1
      case 'ready':
        return 2
      case 'dispatched':
        return order.deliveryType === 'delivery' ? 3 : 2
      case 'delivered':
        return order.deliveryType === 'delivery' ? 4 : 3
      default:
        return 0
    }
  })()

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 p-6 md:p-10 overflow-hidden relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/80 mb-1">
              Tracking ID
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {order.trackingId}
            </h1>
          </div>
          <div className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
            Hello, {order.customerName.split(' ')[0]} 👋
          </div>
        </div>

        {/* Display Order Details */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-background rounded-2xl p-4 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Date & Time
            </p>
            <p className="font-bold text-foreground">{order.pickupDate}</p>
            <p className="text-sm font-medium text-muted-foreground">{order.pickupTime}</p>
          </div>
          <div className="bg-background rounded-2xl p-4 shadow-sm border border-border/50">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Type
            </p>
            <p className="font-bold text-foreground capitalize">{order.deliveryType}</p>
            <p className="text-sm font-medium text-muted-foreground">
              {order.deliveryType === 'delivery' ? 'To door' : 'In-store'}
            </p>
          </div>
        </div>

        {/* Stepper Timeline */}
        <div className="relative mt-8">
          {/* Connecting Line background */}
          <div className="absolute left-6 md:left-[50%] top-0 bottom-0 w-1 bg-muted/50 rounded -ml-0.5 md:-ml-0.5" />
          
          {/* Active Connecting Line Overlay Fill */}
          <div 
            className="absolute left-6 md:left-[50%] top-0 w-1 bg-gradient-to-b from-secondary to-primary rounded -ml-0.5 md:-ml-0.5 transition-all duration-1000 ease-in-out"
            style={{ 
              height: `${currentStageIndex === 0 ? 0 : (currentStageIndex / (STAGES.length - 1)) * 100}%` 
            }} 
          />

          <div className="flex flex-col gap-10 md:gap-14 relative pb-4">
            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex
              const isCurrent = idx === currentStageIndex
              const isFuture = idx > currentStageIndex
              const Icon = stage.icon

              return (
                <div 
                  key={stage.id} 
                  className={`relative flex items-center md:justify-center ${idx % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6`}
                >
                  {/* Step Text */}
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} ml-16 md:ml-0`}>
                    <h3 className={`text-lg font-bold transition-colors duration-500 ${isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isCurrent ? 'In progress' : isPast ? 'Completed' : 'Pending'}
                    </p>
                  </div>

                  {/* Step Icon Indicator */}
                  <div className={`absolute left-0 md:relative md:left-auto flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-700 ease-in-out z-10 shrink-0 shadow-sm
                    ${isPast ? 'bg-gradient-to-br from-secondary to-primary border-white scale-100 text-white' : 
                      isCurrent ? 'bg-white border-primary scale-110 text-primary shadow-lg shadow-primary/20' : 
                      'bg-muted border-white scale-90 text-muted-foreground'}`}
                  >
                    {isPast ? <Check className="h-5 w-5 stroke-[3]" /> : <Icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />}
                  </div>

                  {/* Empty Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
