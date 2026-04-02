'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { BakerSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DailyBatchItem } from '@/types/production'
import { productionService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { Layers, Plus, ChefHat, Flame, CheckCircle } from 'lucide-react'
import { AddBatchForm } from './AddBatchForm'
import { CategorySummaryGrid } from './CategorySummaryGrid'
import { BatchCard } from './BatchCard'

export function BakerProduction() {
  const [batches, setBatches] = useState<DailyBatchItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const controller = new AbortController()
    productionService.getBatches({ signal: controller.signal })
      .then(res => setBatches(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const handleAddBatch = (batch: DailyBatchItem) => {
    setBatches(prev => [batch, ...prev])
    setShowForm(false)
    toast.success(`Added ${batch.quantityBaked} ${batch.unit} of ${batch.productName}`)
  }

  const totalBaked = batches.reduce((sum, b) => sum + b.quantityBaked, 0)
  const totalRemaining = batches.reduce((sum, b) => sum + b.quantityRemaining, 0)
  const totalSold = totalBaked - totalRemaining

  const byCategory = batches.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + b.quantityRemaining
    return acc
  }, {} as Record<string, number>)

  if (!mounted) return null

  return (
    <div className="min-h-screen" style={{ background: '#fdf2f4' }}>
      <BakerSidebar />
      <main className="ml-64">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}>
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground text-balance">Daily Production</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Button className="text-white border-0" style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }} onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Log Batch
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Baked', value: totalBaked, icon: Flame, bg: '#fce7ea', color: '#CA0123' },
              { label: 'Remaining', value: totalRemaining, icon: Layers, bg: '#fdf2f4', color: '#e66386' },
              { label: 'Fulfilled / Sold', value: totalSold, icon: CheckCircle, bg: '#f0fdf4', color: '#16a34a' },
              { label: 'Products', value: batches.length, icon: ChefHat, bg: '#fce7ea', color: '#CA0123' },
            ].map(s => (
              <Card key={s.label} className="border-0 shadow-sm bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: s.bg }}>
                      <s.icon className="h-4 w-4" style={{ color: s.color }} />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {showForm && (
            <AddBatchForm
              batchCount={batches.length}
              onAdd={handleAddBatch}
              onCancel={() => setShowForm(false)}
            />
          )}

          <CategorySummaryGrid byCategory={byCategory} />

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Today&apos;s Batches</h3>
            {batches.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-lg font-medium text-muted-foreground">No batches logged yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start by logging your first batch of the day</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {batches.map(batch => <BatchCard key={batch.id} batch={batch} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
