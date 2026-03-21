'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

interface Props {
  incomingCount: number
  bakingCount: number
  qaCount: number
  sentOutCount: number
}

export function WorkflowDiagram({ incomingCount, bakingCount, qaCount, sentOutCount }: Props) {
  const steps = [
    { label: 'Incoming', count: incomingCount, bg: '#e66386' },
    { label: 'Baking', count: bakingCount, bg: '#CA0123' },
    { label: 'QA', count: qaCount, bg: '#e66386' },
    { label: 'Decorator', count: sentOutCount, bg: '#16a34a' },
  ]

  return (
    <Card className="border-0 shadow-sm bg-card">
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Workflow</p>
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 flex-1">
              <div className="flex-1 text-center">
                <div
                  className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full text-white font-bold text-sm shadow-md"
                  style={{ background: step.bg }}
                >
                  {step.count}
                </div>
                <p className="text-xs font-medium text-foreground">{step.label}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 -mt-5" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
