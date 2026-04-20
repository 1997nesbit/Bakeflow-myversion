'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Loader2, ArrowLeft, ChefHat, Sparkles, CakeSlice, Star, Gift, Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ordersService } from '@/lib/api/services/orders'
import type { OrderTrackingResponse } from '@/types/order'
import { OrderTracker } from '@/components/shared/OrderTracker'

/* ─── Floating decorative orbs ─────────────────────────────────── */
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large soft glow — top left */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#CA0123]/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      {/* Mid glow — bottom right */}
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[#e66386]/15 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      {/* Small accent — top right */}
      <div className="absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      {/* Dot grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #CA0123 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
    </div>
  )
}

/* ─── Decorative icon strip (replaces emoji row) ────────────────── */
function IconStrip() {
  const icons = [
    { Icon: CakeSlice, color: '#CA0123' },
    { Icon: ChefHat,   color: '#e66386' },
    { Icon: Star,      color: '#f59e0b' },
    { Icon: Gift,      color: '#8b5cf6' },
    { Icon: Heart,     color: '#CA0123' },
    { Icon: Sparkles,  color: '#e66386' },
  ]
  return (
    <div className="flex gap-3 justify-center mb-6">
      {icons.map(({ Icon, color }, i) => (
        <div
          key={i}
          className="flex items-center justify-center h-9 w-9 rounded-2xl animate-bounce"
          style={{ background: `${color}15`, animationDelay: `${i * 0.15}s`, animationDuration: '2.5s' }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      ))}
    </div>
  )
}

/* ─── Main page content (needs Suspense for useSearchParams) ─────── */
function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [trackingId, setTrackingId] = useState('')
  const [order, setOrder] = useState<OrderTrackingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doSearch = async (id: string) => {
    if (!id.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const data = await ordersService.getByTrackingId(id.trim())
      setOrder(data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("We couldn't find that order. Double-check your tracking ID.")
      } else {
        setError('Something went wrong. Please try again in a moment.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setTrackingId(id.toUpperCase())
      doSearch(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(trackingId)
  }

  return (
    <div className="relative min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 50%, #fce8ec 100%)' }}>
      <FloatingOrbs />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-2xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 border border-gray-200 shadow-sm group-hover:shadow-md transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back
        </Link>

        {/* Logo pill */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur border border-red-100 shadow-sm rounded-full px-4 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: '#CA0123' }}>
            <ChefHat className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-black text-gray-800">Bbr <span style={{ color: '#CA0123' }}>Bakeflow</span></span>
        </div>
      </header>

      {/* ── Hero section ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 pt-10 pb-24">

        {/* Heading block */}
        <div className={`w-full max-w-lg text-center transition-all duration-700 ${order ? 'mb-6' : 'mb-10'}`}>
          <IconStrip />

          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight mb-3"
            style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #CA0123 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Track Your<br />Order
          </h1>
          <p className="text-gray-500 text-base max-w-xs mx-auto">
            Your cake is on its journey — let's see where it is right now.
          </p>
        </div>

        {/* ── Search card ────────────────────────────────────── */}
        <div className={`w-full max-w-md transition-all duration-700 ${order ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-red-100/60 p-6">

            {/* Input row */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="TRK-XXXXXX"
                  className="pl-10 h-13 rounded-2xl border-2 border-gray-100 bg-gray-50/80 focus:bg-white focus-visible:ring-red-200 focus-visible:border-red-300 font-mono text-base font-bold uppercase placeholder:normal-case placeholder:font-normal transition-all"
                  style={{ height: 52 }}
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !trackingId.trim()}
                className="h-[52px] rounded-2xl px-5 font-bold text-white shadow-lg shadow-red-300/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                style={{ background: loading ? '#e66386' : 'linear-gradient(135deg, #e66386 0%, #CA0123 100%)', minWidth: 56 }}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              </Button>
            </form>

            {/* Hint */}
            {!order && !error && !loading && (
              <p className="text-xs text-center text-gray-400 mt-3">
                Find your tracking ID in the SMS we sent you.
              </p>
            )}

            {/* Loading state */}
            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm" style={{ color: '#CA0123' }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Fetching your order...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <span className="text-xl mt-0.5">😔</span>
                <div>
                  <p className="text-sm font-semibold text-red-700">Order not found</p>
                  <p className="text-xs text-red-500 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tracker card (shown after search) ──────────────── */}
        {order && (
          <div className="w-full max-w-xl mt-6 animate-in fade-in zoom-in-95 duration-500">
            <OrderTracker order={order} />
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-12 text-center">
          Questions? Call us or visit the bakery. <span className="font-bold" style={{ color: '#CA0123' }}>Bbr Bakeflow</span>
        </p>
      </main>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff5f7, #ffffff)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl animate-bounce" style={{ background: '#CA012315' }}>
            <ChefHat className="h-8 w-8" style={{ color: '#CA0123' }} />
          </div>
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#CA0123' }} />
        </div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}
