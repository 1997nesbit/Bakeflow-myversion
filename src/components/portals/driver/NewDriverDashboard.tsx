'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Truck, MapPin, Phone, Clock, Package, CheckCircle2, Navigation,
  User, LogOut, AlertCircle, Banknote, Play, History, ChevronRight,
  CalendarDays, TrendingUp, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'

import { ordersService } from '@/lib/api/services/orders'
import { useRoleAuth } from '@/lib/hooks/use-role-auth'
import type { Order } from '@/types/order'
import { PaymentCollectionModal } from './PaymentCollectionModal'

type TabType = 'available' | 'active' | 'history'

type DayGroup = {
  dateKey: string        // e.g. '2026-05-02'
  label: string          // e.g. 'Today' | 'Yesterday' | 'May 1'
  trips: Order[]
  totalFees: number
  locations: string[]
}

export function NewDriverDashboard() {
  const { userName, logout } = useRoleAuth({
    expectedRole: 'driver',
    loginPath: '/driver/login',
    defaultName: 'Driver',
  })

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDeliveryFeeDialog, setShowDeliveryFeeDialog] = useState(false)
  const [deliveryFeeInput, setDeliveryFeeInput] = useState('')
  const [showConfirmEnd, setShowConfirmEnd] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('available')
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)

  // Local state for delivery fees (since not yet in backend)
  const [deliveryFees, setDeliveryFees] = useState<Record<string, number>>({})

  const fetchOrders = useCallback(async () => {
    try {
      const res = await ordersService.getAll()
      setOrders(res.results)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [fetchOrders])

  // Load delivery fees from localStorage to persist across refreshes
  useEffect(() => {
    const savedFees = localStorage.getItem('driver_local_delivery_fees')
    if (savedFees) {
      try {
        setDeliveryFees(JSON.parse(savedFees))
      } catch (e) {
        console.error('Failed to parse saved delivery fees')
      }
    }
  }, [])

  const saveDeliveryFee = (orderId: string, fee: number) => {
    const newFees = { ...deliveryFees, [orderId]: fee }
    setDeliveryFees(newFees)
    localStorage.setItem('driver_local_delivery_fees', JSON.stringify(newFees))
  }

  // Derived lists
  const availableOrders = useMemo(() =>
    orders.filter(o =>
      // Unassigned ready orders — driver can self-accept
      (o.status === 'ready' && o.deliveryType === 'delivery' && !o.driver) ||
      // Dispatched orders assigned to this driver but not yet accepted
      (o.status === 'dispatched' && !o.driverAccepted)
    ),
    [orders]
  )

  const activeDelivery = useMemo(() => 
    orders.find(o => o.status === 'dispatched' && o.driverAccepted),
    [orders]
  )

  const tripHistory = useMemo(() => 
    orders.filter(o => o.status === 'delivered'),
    [orders]
  )

  // Group trip history by day for the History tab
  const tripsByDay = useMemo<DayGroup[]>(() => {
    const groups: Record<string, Order[]> = {}
    tripHistory.forEach(trip => {
      // Use updatedAt if available, else createdAt
      const dateStr = (trip as any).updatedAt || trip.createdAt
      const dateKey = new Date(dateStr).toISOString().slice(0, 10) // 'YYYY-MM-DD'
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(trip)
    })

    const todayKey = new Date().toISOString().slice(0, 10)
    const yesterdayKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a)) // newest first
      .map(([dateKey, trips]) => {
        const totalFees = trips.reduce((sum, t) => sum + (deliveryFees[t.id] || 0), 0)
        const locations = trips
          .map(t => t.deliveryAddress || '')
          .filter(Boolean)
          .filter((v, i, arr) => arr.indexOf(v) === i) // deduplicate
        let label: string
        if (dateKey === todayKey) label = 'Today'
        else if (dateKey === yesterdayKey) label = 'Yesterday'
        else {
          const d = new Date(dateKey + 'T12:00:00')
          label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        }
        return { dateKey, label, trips, totalFees, locations }
      })
  }, [tripHistory, deliveryFees])

  const todayGroup = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10)
    return tripsByDay.find(g => g.dateKey === todayKey) ?? null
  }, [tripsByDay])

  // Handlers
  const handleRequestAccept = (order: Order) => {
    // Directly open the fee dialog when tapping an available order card
    setSelectedOrder(order)
    setDeliveryFeeInput('')
    setShowDeliveryFeeDialog(true)
  }

  const handleConfirmAcceptWithFee = async () => {
    if (!selectedOrder) return
    const fee = parseInt(deliveryFeeInput) || 0
    
    try {
      await ordersService.acceptDelivery(selectedOrder.id)
      saveDeliveryFee(selectedOrder.id, fee)
      
      toast.success(`Delivery accepted - ${selectedOrder.customer.name}`)
      setShowDeliveryFeeDialog(false)
      setSelectedOrder(null)
      setActiveTab('active')
      fetchOrders()
    } catch (err) {
      toast.error('Failed to accept delivery. Please try again.')
    }
  }

  const handleEndTrip = async () => {
    if (!activeDelivery) return
    
    try {
      await ordersService.markDelivered(activeDelivery.id)
      toast.success('Trip completed!')
      setShowConfirmEnd(false)
      setActiveTab('history')
      fetchOrders()
    } catch (err) {
      toast.error('Failed to mark as delivered.')
    }
  }

  const openMaps = (address: string) => {
    const encoded = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank')
  }

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const totalDeliveryFees = tripHistory.reduce((sum, t) => sum + (deliveryFees[t.id] || 0), 0)
  const totalCollected = tripHistory.reduce((sum, t) => {
    const outstanding = t.paymentStatus !== 'paid' ? (t.totalPrice - t.amountPaid) : 0
    return sum + outstanding
  }, 0)

  // Needs payment collection?
  const needsPayment = (order: Order) => order.paymentTerms === 'on_delivery' && order.paymentStatus !== 'paid'

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#111827] border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8]">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Driver Portal</h1>
              <p className="text-xs text-slate-400">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-800" onClick={() => toast.info('Profile coming soon')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 hover:bg-slate-800" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-800">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'available' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Available
            {availableOrders.length > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {availableOrders.length}
              </span>
            )}
            {activeTab === 'available' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'active' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Active
            {activeDelivery && (
              <span className="ml-1.5 inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            )}
            {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'history' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            History
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>
        </div>
      </header>

      <main className="p-4 pb-24">
        {loading && <div className="text-center py-10 text-slate-400">Loading deliveries...</div>}

        {/* AVAILABLE TAB */}
        {activeTab === 'available' && !loading && (
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-white">{availableOrders.length}</p>
                  <p className="text-xs text-blue-300">Available Now</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">{tripHistory.length}</p>
                  <p className="text-xs text-green-300">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Available Orders List */}
            {availableOrders.length === 0 ? (
              <Card className="bg-[#111827] border-slate-800">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No deliveries available</p>
                  <p className="text-xs text-slate-500 mt-1">Ready orders and assigned dispatches will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {availableOrders.map(order => {
                  const isAssigned = order.status === 'dispatched' && !order.driverAccepted
                  const isReady = order.status === 'ready'
                  return (
                  <Card 
                    key={order.id} 
                    className={`bg-[#111827] border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer ${isAssigned ? 'border-l-4 border-l-blue-500' : ''}`}
                    onClick={() => handleRequestAccept(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">{order.customer.name}</p>
                            {isAssigned ? (
                              <Badge className="bg-blue-500/20 text-blue-300 border-0 text-[10px] px-1.5">
                                <Truck className="h-2.5 w-2.5 mr-0.5" />Assigned to You
                              </Badge>
                            ) : (
                              <Badge className="bg-purple-500/20 text-purple-300 border-0 text-[10px] px-1.5">
                                <Play className="h-2.5 w-2.5 mr-0.5" />Open
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{order.trackingId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">TZS {(order.totalPrice).toLocaleString()}</p>
                          <p className="text-xs text-slate-400">Order Value</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                        <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                        <span className="truncate">{order.deliveryAddress || 'No address provided'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {order.pickupTime}
                        </div>
                        {needsPayment(order) ? (
                          <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                            <Banknote className="h-3 w-3 mr-1" />
                            Collect TZS {(order.totalPrice - order.amountPaid).toLocaleString()}
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Already Paid
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE TAB */}
        {activeTab === 'active' && !loading && (
          <div className="space-y-4">
            {!activeDelivery ? (
              <Card className="bg-[#111827] border-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-8 w-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium">No active delivery</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Accept an order from Available tab to start</p>
                  <Button 
                    variant="outline" 
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    onClick={() => setActiveTab('available')}
                  >
                    View Available Deliveries
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e3a5f] via-[#1a365d] to-[#0f2744] border border-blue-500/30">
                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-semibold text-green-400 uppercase tracking-wide">In Transit</span>
                    </div>
                    <Badge className="bg-blue-600/80 text-white border-0 px-3 py-1">{activeDelivery.trackingId}</Badge>
                  </div>
                  
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold text-white mb-1">{activeDelivery.customer.name}</h2>
                    <p className="text-sm text-slate-300">{activeDelivery.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 backdrop-blur">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Order Value</p>
                      <p className="text-xl font-bold text-white">TZS {activeDelivery.totalPrice.toLocaleString()}</p>
                      {activeDelivery.paymentStatus === 'paid' ? (
                        <Badge className="bg-green-600/50 text-green-300 border-0 text-xs mt-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-600/50 text-amber-300 border-0 text-xs mt-2">
                          <Banknote className="h-3 w-3 mr-1" /> Collect
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 backdrop-blur">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Delivery Fee</p>
                      <p className="text-xl font-bold text-blue-400">TZS {(deliveryFees[activeDelivery.id] || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-2">Zone-based</p>
                    </div>
                  </div>

                  {needsPayment(activeDelivery) && (
                    <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-amber-400" />
                          <span className="text-sm text-amber-300 font-medium">Collect from Customer</span>
                        </div>
                        <p className="text-xl font-bold text-amber-400">
                          TZS {((activeDelivery.totalPrice - activeDelivery.amountPaid) + (deliveryFees[activeDelivery.id] || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button onClick={() => openMaps(activeDelivery.deliveryAddress || '')} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium">
                      <Navigation className="h-5 w-5" /> Navigate
                    </button>
                    <button onClick={() => callCustomer(activeDelivery.customer.phone)} className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors text-white font-medium">
                      <Phone className="h-5 w-5" /> Call
                    </button>
                  </div>

                  <div className="mb-4">
                    {needsPayment(activeDelivery) ? (
                      <button onClick={() => setPaymentOrder(activeDelivery)} className="w-full p-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2">
                        <Banknote className="h-5 w-5" /> Record Payment
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-center text-green-300 font-medium">
                        Payment Completed
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowConfirmEnd(true)}
                    className={`w-full p-5 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold flex items-center justify-center gap-3 text-lg ${needsPayment(activeDelivery) && activeDelivery.paymentStatus !== 'paid' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={needsPayment(activeDelivery) && activeDelivery.paymentStatus !== 'paid'}
                  >
                    <CheckCircle2 className="h-6 w-6" /> End Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && !loading && (
          <div className="space-y-4">

            {/* Today's Summary Banner */}
            {todayGroup ? (
              <div className="rounded-2xl bg-gradient-to-br from-[#14532d]/60 via-[#15803d]/30 to-[#166534]/40 border border-green-500/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-green-400 font-medium uppercase tracking-wide">Today's Earnings</p>
                    <p className="text-2xl font-bold text-white">TZS {todayGroup.totalFees.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-900/50 p-3 text-center">
                    <p className="text-xl font-bold text-white">{todayGroup.trips.length}</p>
                    <p className="text-[10px] text-slate-400">Deliveries</p>
                  </div>
                  <div className="rounded-xl bg-slate-900/50 p-3 text-center">
                    <p className="text-xl font-bold text-blue-400">{todayGroup.locations.length}</p>
                    <p className="text-[10px] text-slate-400">Locations</p>
                  </div>
                </div>
                {todayGroup.locations.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Stops Today</p>
                    {todayGroup.locations.map((loc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full bg-blue-500/30 flex items-center justify-center text-[9px] text-blue-300 font-bold shrink-0">{i + 1}</span>
                        <p className="text-xs text-slate-300 truncate">{loc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#111827] border border-slate-800 p-4 text-center">
                <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">No deliveries yet today</p>
                <p className="text-xs text-slate-500 mt-0.5">Complete deliveries to track earnings</p>
              </div>
            )}

            {/* All-time totals */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-white">{tripHistory.length}</p>
                  <p className="text-[10px] text-blue-300">Total Trips</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
                <CardContent className="p-3 text-center">
                  <p className="text-sm font-bold text-green-400">TZS {totalDeliveryFees.toLocaleString()}</p>
                  <p className="text-[10px] text-green-300">All Fees</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/30">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-amber-400">{tripsByDay.length}</p>
                  <p className="text-[10px] text-amber-300">Days</p>
                </CardContent>
              </Card>
            </div>

            {/* Day-by-day Breakdown */}
            {tripsByDay.length === 0 ? (
              <Card className="bg-[#111827] border-slate-800">
                <CardContent className="p-8 text-center">
                  <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No completed trips yet</p>
                  <p className="text-xs text-slate-500 mt-1">Completed deliveries will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium px-1">Trip History</p>
                {tripsByDay.map(dayGroup => {
                  const isExpanded = expandedDay === dayGroup.dateKey
                  return (
                    <div key={dayGroup.dateKey} className="rounded-2xl bg-[#111827] border border-slate-800 overflow-hidden">
                      {/* Day Header — click to expand/collapse */}
                      <button
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                        onClick={() => setExpandedDay(isExpanded ? null : dayGroup.dateKey)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                            <CalendarDays className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{dayGroup.label}</p>
                            <p className="text-[10px] text-slate-400">{dayGroup.trips.length} {dayGroup.trips.length === 1 ? 'delivery' : 'deliveries'} · {dayGroup.locations.length} {dayGroup.locations.length === 1 ? 'location' : 'locations'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-400">TZS {dayGroup.totalFees.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-500">earned</p>
                          </div>
                          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-800 p-4 space-y-3">
                          {/* Locations visited */}
                          {dayGroup.locations.length > 0 && (
                            <div className="rounded-xl bg-slate-800/50 p-3">
                              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-2">Locations Visited</p>
                              <div className="space-y-2">
                                {dayGroup.locations.map((loc, i) => (
                                  <div key={i} className="flex items-start gap-2">
                                    <span className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-300 font-bold shrink-0 mt-0.5">{i + 1}</span>
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                      <p className="text-xs text-slate-300 truncate">{loc}</p>
                                    </div>
                                    <button
                                      onClick={() => openMaps(loc)}
                                      className="text-[10px] text-blue-400 hover:text-blue-300 shrink-0 underline"
                                    >Map</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Individual trips */}
                          <div className="space-y-2">
                            {dayGroup.trips.map((trip, idx) => {
                              const dateStr = (trip as any).updatedAt || trip.createdAt
                              return (
                                <div key={trip.id} className="rounded-xl bg-slate-800/30 p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-500 font-mono">#{idx + 1}</span>
                                        <p className="text-sm font-medium text-white truncate">{trip.customer.name}</p>
                                      </div>
                                      <p className="text-[10px] text-slate-500 mt-0.5">{trip.trackingId} · {formatTime(dateStr)}</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                        <p className="text-[11px] text-slate-400 truncate">{trip.deliveryAddress}</p>
                                      </div>
                                    </div>
                                    <div className="text-right ml-3 shrink-0">
                                      <p className="text-sm font-bold text-green-400">TZS {(deliveryFees[trip.id] || 0).toLocaleString()}</p>
                                      <p className="text-[10px] text-slate-500">fee</p>
                                      <Badge className="bg-green-500/20 text-green-400 border-0 text-[10px] mt-1 px-1.5 py-0">Delivered</Badge>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Delivery Fee Dialog (with order summary) ─── */}
      <Dialog open={showDeliveryFeeDialog} onOpenChange={(open) => {
        setShowDeliveryFeeDialog(open)
        if (!open) setSelectedOrder(null)
      }}>
        <DialogContent className="bg-[#111827] border-slate-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-400" />
              Accept Delivery
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order summary */}
              <div className="rounded-xl bg-slate-800/60 p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">{selectedOrder.customer.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{selectedOrder.trackingId}</p>
                  </div>
                  {needsPayment(selectedOrder) ? (
                    <Badge className="bg-amber-500/20 text-amber-400 border-0 text-xs">
                      <Banknote className="h-3 w-3 mr-1" />COD
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Paid
                    </Badge>
                  )}
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}
                <p className="text-xs text-slate-400 truncate">
                  {selectedOrder.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </p>
                {needsPayment(selectedOrder) && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                    <p className="text-xs text-amber-300 font-medium">
                      Collect TZS {(selectedOrder.totalPrice - selectedOrder.amountPaid).toLocaleString()} on arrival
                    </p>
                  </div>
                )}
              </div>

              {/* Fee input */}
              <div className="space-y-2">
                <Label className="text-slate-300">Your Delivery Fee (TZS)</Label>
                <Input
                  type="number"
                  value={deliveryFeeInput}
                  onChange={e => setDeliveryFeeInput(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-xl h-14 text-center font-bold"
                  placeholder="e.g. 3000"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && deliveryFeeInput !== '' && handleConfirmAcceptWithFee()}
                />
                <p className="text-xs text-slate-500 text-center">This is your earnings for this trip</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-slate-700 text-slate-300" onClick={() => {
                  setShowDeliveryFeeDialog(false)
                  setSelectedOrder(null)
                }}>Cancel</Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmAcceptWithFee}
                  disabled={deliveryFeeInput === ''}
                >
                  Start Delivery
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showConfirmEnd} onOpenChange={setShowConfirmEnd}>
        <DialogContent className="bg-[#111827] border-slate-800 text-white max-w-sm">
          <DialogHeader><DialogTitle className="text-white">Complete Delivery</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p>Confirm delivery to <span className="font-bold">{activeDelivery?.customer.name}</span>?</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-slate-700" onClick={() => setShowConfirmEnd(false)}>Cancel</Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleEndTrip}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {paymentOrder && (
        <PaymentCollectionModal
          order={paymentOrder}
          open={!!paymentOrder}
          onClose={() => setPaymentOrder(null)}
          onPaymentRecorded={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
            setPaymentOrder(null)
          }}
        />
      )}
    </div>
  )
}
