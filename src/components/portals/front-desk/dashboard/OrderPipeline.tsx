'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Wallet, ChefHat, Timer, PackageCheck, Truck, CheckCircle } from 'lucide-react'
import type { Order } from '@/types/order'

interface PipelineStage {
  label: string
  count: number
  icon: React.ElementType
  bg: string
  border: string
  iconBg: string
  iconColor: string
  textColor: string
}

interface OrderPipelineProps {
  pendingPayments: Order[]
  paidReadyToPost: Order[]
  inKitchen: Order[]
  readyOrders: Order[]
  dispatchedOrders: Order[]
  completedOrders: Order[]
}

export function OrderPipeline({
  pendingPayments, paidReadyToPost, inKitchen, readyOrders, dispatchedOrders, completedOrders,
}: OrderPipelineProps) {
  const pipeline: PipelineStage[] = [
    { label: 'Awaiting Pay', count: pendingPayments.length, icon: Wallet, bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', textColor: 'text-amber-700' },
    { label: 'Post to Baker', count: paidReadyToPost.length, icon: ChefHat, bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', textColor: 'text-emerald-700' },
    { label: 'In Kitchen', count: inKitchen.length, icon: Timer, bg: 'bg-orange-50', border: 'border-orange-200', iconBg: 'bg-orange-100', iconColor: 'text-orange-600', textColor: 'text-orange-700' },
    { label: 'Ready', count: readyOrders.length, icon: PackageCheck, bg: 'bg-sky-50', border: 'border-sky-200', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', textColor: 'text-sky-700' },
    { label: 'With Driver', count: dispatchedOrders.length, icon: Truck, bg: 'bg-violet-50', border: 'border-violet-200', iconBg: 'bg-violet-100', iconColor: 'text-violet-600', textColor: 'text-violet-700' },
    { label: 'Completed', count: completedOrders.length, icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', iconBg: 'bg-green-100', iconColor: 'text-green-600', textColor: 'text-green-700' },
  ]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">Order Pipeline</CardTitle>
          <Link href="/front-desk/orders">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 h-auto p-0">
              Open Orders <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="grid gap-3 grid-cols-3 lg:grid-cols-6">
          {pipeline.map((stage) => (
            <div key={stage.label} className={`rounded-xl border ${stage.border} ${stage.bg} p-3`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stage.iconBg}`}>
                  <stage.icon className={`h-3.5 w-3.5 ${stage.iconColor}`} />
                </div>
                <span className={`text-xl font-bold ${stage.textColor}`}>{stage.count}</span>
              </div>
              <p className={`text-[11px] font-medium ${stage.textColor}`}>{stage.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
