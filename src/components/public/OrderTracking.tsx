import { ChefHat, Paintbrush, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import type { Order } from '@/types/order'
import { trackingStages } from '@/data/constants/tracking'

const stageIcons = [ChefHat, Paintbrush, Package, Truck]
const stageColors = {
  completed: { bg: 'bg-green-100', border: 'border-green-400', icon: 'text-green-600', line: 'bg-green-400' },
  active: { bg: 'bg-[#e66386]/10', border: 'border-[#CA0123]', icon: 'text-[#CA0123]', line: 'bg-border' },
  pending: { bg: 'bg-muted', border: 'border-border', icon: 'text-muted-foreground', line: 'bg-border' },
}

interface Props {
  initialOrder: Order | null
  trackingId: string
}

export function OrderTracking({ initialOrder, trackingId }: Props) {
  const order = initialOrder

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <ChefHat className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
          <p className="text-muted-foreground">We could not find an order with tracking ID <span className="font-mono font-semibold">{trackingId}</span>. Please check the link and try again.</p>
        </div>
      </div>
    )
  }

  // Determine which stage is active
  const currentStageIndex = trackingStages.findIndex(stage => stage.statuses.includes(order.status))
  const isDelivered = order.status === 'delivered'
  const isPending = order.status === 'pending' || order.status === 'paid'

  function getStageState(index: number): 'completed' | 'active' | 'pending' {
    if (isDelivered) return 'completed'
    if (isPending) return 'pending'
    if (index < currentStageIndex) return 'completed'
    if (index === currentStageIndex) return 'active'
    return 'pending'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F7] to-background">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#CA0123' }}>
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Bbr Bakeflow</h1>
            <p className="text-xs text-muted-foreground">Order Tracking</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        {/* Order Info Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tracking ID</p>
              <p className="text-lg font-mono font-bold text-foreground">{order.trackingId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="text-sm font-semibold text-foreground">{order.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Customer</p>
              <p className="font-medium text-foreground">{order.customer.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">{order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
              <p className="font-medium text-foreground">{order.pickupDate} at {order.pickupTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs">Items</p>
              {order.items.map((item, i) => (
                <p key={i} className="font-medium text-foreground text-sm">{item.name} x{item.quantity}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {isDelivered ? (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4 mb-8">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">Order Complete</p>
              <p className="text-sm text-green-700">Your order has been delivered. Enjoy!</p>
            </div>
          </div>
        ) : isPending ? (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4 mb-8">
            <Clock className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Order Received</p>
              <p className="text-sm text-amber-700">Your order is confirmed and will begin processing shortly.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border p-4 mb-8" style={{ background: '#FFF0F3', borderColor: '#e66386' }}>
            <div className="h-3 w-3 rounded-full animate-pulse" style={{ background: '#CA0123' }} />
            <div>
              <p className="font-semibold" style={{ color: '#CA0123' }}>In Progress</p>
              <p className="text-sm" style={{ color: '#e66386' }}>Your order is being prepared with care.</p>
            </div>
          </div>
        )}

        {/* Progress Tracker */}
        <div className="space-y-0">
          <h2 className="text-sm font-semibold text-foreground mb-6 uppercase tracking-wider">Order Progress</h2>
          {trackingStages.map((stage, index) => {
            const state = getStageState(index)
            const colors = stageColors[state]
            const Icon = stageIcons[index]
            const isLast = index === trackingStages.length - 1

            return (
              <div key={stage.key} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${colors.bg} ${colors.border} transition-all`}>
                    {state === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-16 ${colors.line} transition-all`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <p className={`font-semibold text-sm ${state === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {stage.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {state === 'completed' && 'Completed'}
                    {state === 'active' && 'Currently in progress...'}
                    {state === 'pending' && 'Waiting'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">For questions, call us or visit the shop.</p>
          <p className="text-xs font-medium mt-1" style={{ color: '#CA0123' }}>Bbr Bakeflow</p>
        </div>
      </main>
    </div>
  )
}
