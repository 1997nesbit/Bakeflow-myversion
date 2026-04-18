'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Inbox, Flame, CheckCircle, Palette, Layers } from 'lucide-react'

interface Props {
  incomingCount: number
  bakingCount: number
  qaCount: number
  sentOutCount: number
  batchCount: number
}

export function DashboardStatsGrid({ incomingCount, bakingCount, qaCount, sentOutCount, batchCount }: Props) {
  const stats = [
    { label: 'Incoming', count: incomingCount, icon: Inbox, bg: '#fce7ea', color: '#CA0123' },
    { label: 'Baking', count: bakingCount, icon: Flame, bg: '#fbd5db', color: '#CA0123' },
    { label: 'QA Check', count: qaCount, icon: CheckCircle, bg: '#fce7ea', color: '#e66386' },
    { label: 'Sent Out', count: sentOutCount, icon: Palette, bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Batches Today', count: batchCount, icon: Layers, bg: '#fce7ea', color: '#CA0123' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map(s => (
        <Card key={s.label} className="border-0 shadow-sm bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: s.bg }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
