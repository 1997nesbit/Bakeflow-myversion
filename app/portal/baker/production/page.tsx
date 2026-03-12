'use client'

import { useState, useEffect } from 'react'
import { BakerSidebar } from '@/components/portal-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  mockDailyBatches,
  DailyBatchItem,
  bakeryMenu,
} from '@/lib/mock-data'
import {
  Layers,
  Plus,
  X,
  ChefHat,
  Clock,
  Flame,
  Wheat,
  Croissant,
  Cookie,
  Cake,
  CheckCircle,
} from 'lucide-react'

const categoryIcons: Record<string, typeof Wheat> = {
  bread: Wheat,
  pastry: Croissant,
  snack: Cookie,
  cake: Cake,
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  bread: { bg: '#fce7ea', text: '#CA0123' },
  pastry: { bg: '#fdf2f4', text: '#e66386' },
  snack: { bg: '#fce7ea', text: '#CA0123' },
  cake: { bg: '#fdf2f4', text: '#e66386' },
}

export default function DailyProductionPage() {
  const [batches, setBatches] = useState<DailyBatchItem[]>(mockDailyBatches)
  const [showForm, setShowForm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Form state
  const [formProduct, setFormProduct] = useState('')
  const [formCategory, setFormCategory] = useState<DailyBatchItem['category']>('bread')
  const [formQuantity, setFormQuantity] = useState('')
  const [formUnit, setFormUnit] = useState('pcs')
  const [formOvenTemp, setFormOvenTemp] = useState('')
  const [formNotes, setFormNotes] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const handleAddBatch = () => {
    if (!formProduct.trim() || !formQuantity) return
    const qty = parseInt(formQuantity)
    if (isNaN(qty) || qty <= 0) return

    let bakerName = 'Baker'
    try {
      const auth = localStorage.getItem('baker_auth')
      if (auth) bakerName = JSON.parse(auth).name || 'Baker'
    } catch { /* ignore */ }

    const newBatch: DailyBatchItem = {
      id: `BATCH-${String(batches.length + 1).padStart(3, '0')}`,
      productName: formProduct.trim(),
      category: formCategory,
      quantityBaked: qty,
      quantityRemaining: qty,
      unit: formUnit,
      bakedBy: bakerName,
      bakedAt: new Date().toISOString(),
      ovenTemp: formOvenTemp.trim() || undefined,
      notes: formNotes.trim() || undefined,
    }

    setBatches(prev => [newBatch, ...prev])
    setFormProduct('')
    setFormQuantity('')
    setFormOvenTemp('')
    setFormNotes('')
    setFormCategory('bread')
    setShowForm(false)
    showToast(`Added ${qty} ${formUnit} of ${formProduct.trim()}`)
  }

  const totalBaked = batches.reduce((sum, b) => sum + b.quantityBaked, 0)
  const totalRemaining = batches.reduce((sum, b) => sum + b.quantityRemaining, 0)
  const totalSold = totalBaked - totalRemaining

  const byCategory = batches.reduce((acc, b) => {
    acc[b.category] = (acc[b.category] || 0) + b.quantityRemaining
    return acc
  }, {} as Record<string, number>)

  // Quick-add suggestions from bakery menu
  const menuSuggestions = bakeryMenu.filter(m => m.category !== 'beverage' && m.category !== 'cake')

  if (!mounted) return null

  return (
    <div className="min-h-screen" style={{ background: '#fdf2f4' }}>
      <BakerSidebar />
      <main className="ml-64">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-md"
                style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
              >
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground text-balance">Daily Production</h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <Button
              className="text-white border-0"
              style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Log Batch
            </Button>
          </div>

          {/* Stats */}
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

          {/* Add Batch Form */}
          {showForm && (
            <Card className="border-2 shadow-sm" style={{ borderColor: '#e66386' }}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" style={{ color: '#CA0123' }} />
                    <h3 className="text-base font-semibold text-foreground">Log New Batch</h3>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Quick suggestions */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Quick select from menu:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {menuSuggestions.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                        style={{
                          borderColor: formProduct === item.name ? '#CA0123' : '#fbd5db',
                          background: formProduct === item.name ? '#fce7ea' : 'transparent',
                          color: formProduct === item.name ? '#CA0123' : undefined,
                        }}
                        onClick={() => {
                          setFormProduct(item.name)
                          setFormCategory(item.category as DailyBatchItem['category'])
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name</label>
                    <Input
                      value={formProduct}
                      onChange={e => setFormProduct(e.target.value)}
                      placeholder="e.g. Sourdough Loaf"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value as DailyBatchItem['category'])}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="bread">Bread</option>
                      <option value="pastry">Pastry</option>
                      <option value="snack">Snack</option>
                      <option value="cake">Cake</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
                    <Input
                      type="number"
                      min="1"
                      value={formQuantity}
                      onChange={e => setFormQuantity(e.target.value)}
                      placeholder="50"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Unit</label>
                    <select
                      value={formUnit}
                      onChange={e => setFormUnit(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="loaves">Loaves</option>
                      <option value="trays">Trays</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Oven Temp</label>
                    <Input
                      value={formOvenTemp}
                      onChange={e => setFormOvenTemp(e.target.value)}
                      placeholder="e.g. 220C"
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
                  <Textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="e.g. Oven #1, extra glaze, butter croissant dough..."
                    className="min-h-[60px] text-sm"
                  />
                </div>

                <Button
                  className="w-full text-white border-0"
                  style={{ background: 'linear-gradient(135deg, #CA0123, #e66386)' }}
                  onClick={handleAddBatch}
                  disabled={!formProduct.trim() || !formQuantity}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Log Batch
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Category Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(byCategory).map(([cat, remaining]) => {
              const Icon = categoryIcons[cat] || Layers
              const colors = categoryColors[cat] || { bg: '#fce7ea', text: '#CA0123' }
              return (
                <div key={cat} className="rounded-xl border p-3 bg-card flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: colors.bg }}>
                    <Icon className="h-5 w-5" style={{ color: colors.text }} />
                  </span>
                  <div>
                    <p className="text-lg font-bold text-foreground">{remaining}</p>
                    <p className="text-xs text-muted-foreground capitalize">{cat} left</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Batch List */}
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
                {batches.map(batch => {
                  const Icon = categoryIcons[batch.category] || Layers
                  const colors = categoryColors[batch.category] || { bg: '#fce7ea', text: '#CA0123' }
                  const usedPct = Math.round(((batch.quantityBaked - batch.quantityRemaining) / batch.quantityBaked) * 100)

                  return (
                    <Card key={batch.id} className="border-0 shadow-sm bg-card overflow-hidden">
                      <div className="px-4 py-2 flex items-center justify-between" style={{ background: colors.bg }}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: colors.text }} />
                          <p className="text-xs font-semibold capitalize" style={{ color: colors.text }}>{batch.category}</p>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: colors.text }}>{batch.id}</span>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{batch.productName}</p>
                            <p className="text-xs text-muted-foreground">{batch.bakedBy}</p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-transparent">
                            {batch.quantityRemaining}/{batch.quantityBaked} {batch.unit}
                          </Badge>
                        </div>

                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${usedPct}%`,
                              background: usedPct > 80 ? '#CA0123' : usedPct > 50 ? '#e66386' : '#22c55e',
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{usedPct}% fulfilled</span>
                          <span>{batch.quantityRemaining} remaining</span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(batch.bakedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {batch.ovenTemp && (
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {batch.ovenTemp}
                            </span>
                          )}
                        </div>

                        {batch.notes && (
                          <p className="text-xs rounded-lg p-2 border" style={{ background: '#fdf2f4', borderColor: '#fbd5db', color: '#e66386' }}>
                            {batch.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toastMsg && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-5 py-3 text-white shadow-lg animate-in slide-in-from-bottom-4"
            style={{ background: '#CA0123' }}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{toastMsg}</span>
          </div>
        )}
      </main>
    </div>
  )
}
