'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Flame, Clock, TrendingUp } from 'lucide-react'
import type { Order } from '@/types/order'
import type { TimerState } from '@/types/production'

interface Props {
  bakingOrders: Order[]
  timers: Record<string, TimerState>
  now: number
}

export function ProductionSummaryProgress({ bakingOrders, timers, now }: Props) {
  if (bakingOrders.length === 0) return null

  let totalEstimatedSec = 0
  let totalElapsedSec = 0

  bakingOrders.forEach(order => {
    const t = timers[order.id]
    const estSec = order.estimatedMinutes * 60
    totalEstimatedSec += estSec

    if (t) {
      const elapsedMs = t.running ? now - t.startedAt + t.elapsed : t.elapsed
      totalElapsedSec += Math.floor(elapsedMs / 1000)
    }
  })

  const overallPct = totalEstimatedSec > 0 
    ? Math.min(100, (totalElapsedSec / totalEstimatedSec) * 100) 
    : 0

  const overdueCount = bakingOrders.filter(o => {
    const t = timers[o.id]
    if (!t) return false
    const elapsedMs = t.running ? now - t.startedAt + t.elapsed : t.elapsed
    return (elapsedMs / 1000 / 60) >= o.estimatedMinutes
  }).length

  return (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <div 
        className="h-1.5 w-full bg-border"
        style={{ background: 'linear-gradient(to right, #fce7ea, #fbd5db)' }}
      >
        <div 
          className="h-full transition-all duration-1000 ease-linear"
          style={{ 
            width: `${overallPct}%`, 
            background: 'linear-gradient(90deg, #CA0123, #e66386)',
            boxShadow: '0 0 10px rgba(202, 1, 35, 0.3)'
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf2f4]">
              <TrendingUp className="h-5 w-5 text-[#CA0123]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Production Progress</h3>
              <p className="text-xs text-muted-foreground">
                Overall shift completion based on estimated baking times
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Efficiency</p>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {Math.round(overallPct)}%
              </p>
            </div>
            
            <div className="h-8 w-px bg-border hidden md:block" />

            <div className="text-center md:text-left">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Active Load</p>
              <div className="flex items-center gap-1.5 justify-center md:justify-start">
                <Flame className="h-3.5 w-3.5 text-[#e66386]" />
                <span className="text-lg font-bold text-foreground">{bakingOrders.length}</span>
              </div>
            </div>

            {overdueCount > 0 && (
              <>
                <div className="h-8 w-px bg-border hidden md:block" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-red-500 mb-0.5">Overdue</p>
                  <div className="flex items-center gap-1.5 justify-center md:justify-start text-red-600">
                    <Clock className="h-3.5 w-3.5 animate-pulse" />
                    <span className="text-lg font-bold">{overdueCount}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
