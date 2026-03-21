'use client'

import { useState, useEffect, useCallback } from 'react'
import { BakerSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { mockOrders } from '@/data/mock/orders'
import { mockDailyBatches } from '@/data/mock/production'
import { minutesSincePosted } from '@/lib/utils/date'
import { ChefHat, Flame, Users } from 'lucide-react'
import Link from 'next/link'
import { DashboardAlertBanners } from './DashboardAlertBanners'
import { DashboardStatsGrid } from './DashboardStatsGrid'
import { WorkflowDiagram } from './WorkflowDiagram'
import { ProductionSummaryCard } from './ProductionSummaryCard'
import { IncomingOrdersCard } from './IncomingOrdersCard'
import { BakingProgressPanel } from './BakingProgressPanel'
import { QAQueuePanel } from './QAQueuePanel'

export function BakerDashboard() {
  const [mounted, setMounted] = useState(false)
  const [, setTick] = useState(0)
  const [bakerName, setBakerName] = useState('Baker')

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    try {
      const auth = localStorage.getItem('baker_auth')
      if (auth) setBakerName(JSON.parse(auth).name || 'Baker')
    } catch { /* ignore */ }
  }, [])

  const incomingOrders = mockOrders.filter(o => o.status === 'baker' && !o.postedToBakerAt)
  const bakingOrders = mockOrders.filter(o => o.status === 'baker' && o.postedToBakerAt)
  const qaOrders = mockOrders.filter(o => o.status === 'quality')
  const sentToDecorator = mockOrders.filter(o =>
    ['decorator', 'packing', 'ready', 'dispatched', 'delivered'].includes(o.status)
  )
  const overdueOrders = mounted
    ? bakingOrders.filter(o => o.postedToBakerAt && minutesSincePosted(o.postedToBakerAt) > o.estimatedMinutes)
    : []

  const getElapsed = useCallback(
    (postedAt?: string) => {
      if (!postedAt || !mounted) return 0
      return Math.floor((Date.now() - new Date(postedAt).getTime()) / (1000 * 60))
    },
    [mounted]
  )

  const totalActive = incomingOrders.length + bakingOrders.length + qaOrders.length

  return (
    <div className="min-h-screen" style={{ background: '#fdf2f4' }}>
      <BakerSidebar />
      <main className="ml-64">
        <DashboardAlertBanners overdueCount={overdueOrders.length} incomingCount={incomingOrders.length} />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground text-balance">Welcome, {bakerName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {totalActive} active in pipeline -- shared across all bakers
                </p>
              </div>
            </div>
            <Link href="/portal/baker/active">
              <Button className="text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
                <Flame className="mr-2 h-4 w-4" />
                Go to Kitchen
              </Button>
            </Link>
          </div>

          <DashboardStatsGrid
            incomingCount={incomingOrders.length}
            bakingCount={bakingOrders.length}
            qaCount={qaOrders.length}
            sentOutCount={sentToDecorator.length}
            batchCount={mockDailyBatches.length}
          />

          <WorkflowDiagram
            incomingCount={incomingOrders.length}
            bakingCount={bakingOrders.length}
            qaCount={qaOrders.length}
            sentOutCount={sentToDecorator.length}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            <ProductionSummaryCard batches={mockDailyBatches} />
            <IncomingOrdersCard orders={incomingOrders} />
          </div>

          <BakingProgressPanel orders={bakingOrders} getElapsed={getElapsed} />
          <QAQueuePanel orders={qaOrders} />
        </div>
      </main>
    </div>
  )
}
