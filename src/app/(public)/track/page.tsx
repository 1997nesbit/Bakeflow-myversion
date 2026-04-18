'use client'

import { useState } from 'react'
import { Search, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ordersService } from '@/lib/api/services/orders'
import type { OrderTrackingResponse } from '@/types/order'
import { OrderTracker } from '@/components/shared/OrderTracker'

export default function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState('')
  const [order, setOrder] = useState<OrderTrackingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) return

    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const data = await ordersService.getByTrackingId(trackingId.trim())
      setOrder(data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Order not found. Please check your tracking ID.')
      } else {
        setError('An error occurred while tracking your order.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f4] via-white to-[#fce7ea] flex flex-col font-sans">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #e66386 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />

      {/* Header */}
      <header className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 flex items-center z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="flex h-8 w-8 rounded-full bg-white shadow-sm border border-border/50 items-center justify-center group-hover:border-border transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          </div>
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 z-10 w-full max-w-4xl mx-auto space-y-12 pb-24">
        
        {/* Search Section */}
        <div className={`w-full max-w-lg mx-auto text-center transition-all duration-700 ${order ? 'scale-90 -translate-y-8 opacity-80' : 'scale-100 translate-y-0'}`}>
          <div className="mb-6 space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">
              Track Your Order
            </h1>
            <p className="text-muted-foreground">Enter your 8-character Tracking ID below</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="e.g. A9B8C7D6"
                className="h-16 pl-6 pr-32 text-lg rounded-full shadow-lg border-2 border-primary/20 bg-white/80 backdrop-blur focus-visible:ring-primary/30 uppercase font-medium placeholder:normal-case placeholder:font-normal transition-all hover:bg-white"
              />
              <Button 
                type="submit" 
                disabled={loading || !trackingId.trim()}
                className="absolute right-2 h-12 rounded-full px-6 bg-gradient-to-r from-secondary to-primary hover:opacity-90 transition-opacity text-white font-bold"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 mr-1" />}
                {!loading && "Track"}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 font-medium border border-red-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <Search className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Tracker View */}
        {order && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
            <OrderTracker order={order} />
          </div>
        )}

      </main>
    </div>
  )
}
