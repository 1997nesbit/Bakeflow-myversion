'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'
import Link from 'next/link'
import type { DailyBatchItem } from '@/types/production'

interface Props {
  batches: DailyBatchItem[]
}

export function ProductionSummaryCard({ batches }: Props) {
  const totalBaked = batches.reduce((s, b) => s + b.quantityBaked, 0)

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" style={{ color: '#CA0123' }} />
            <h3 className="text-sm font-semibold text-foreground">Today&apos;s Production</h3>
            <Badge className="text-[10px] text-white border-0" style={{ background: '#e66386' }}>
              {totalBaked} baked
            </Badge>
          </div>
          <Link href="/portal/baker/production" className="text-xs font-medium hover:underline" style={{ color: '#CA0123' }}>
            Manage
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No batches logged yet today</p>
            <Link href="/portal/baker/production">
              <Button size="sm" variant="outline" className="mt-3 bg-transparent text-xs" style={{ borderColor: '#e66386', color: '#e66386' }}>
                Log First Batch
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {batches.slice(0, 5).map(batch => {
              const usedPct = Math.round(((batch.quantityBaked - batch.quantityRemaining) / batch.quantityBaked) * 100)
              return (
                <div key={batch.id} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: '#fbd5db' }}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ background: '#e66386' }}>
                    {batch.quantityRemaining}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{batch.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${usedPct}%`, background: usedPct > 80 ? '#CA0123' : '#e66386' }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">{usedPct}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{batch.quantityRemaining}/{batch.quantityBaked}</span>
                </div>
              )
            })}
            {batches.length > 5 && (
              <Link href="/portal/baker/production" className="block text-center text-xs font-medium py-2 hover:underline" style={{ color: '#e66386' }}>
                View all {batches.length} batches
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
