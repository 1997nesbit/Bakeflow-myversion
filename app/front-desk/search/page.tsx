'use client'

import React, { useState } from 'react'
import { FrontDeskSidebar } from '@/components/front-desk/front-desk-sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { OrderDetail } from '@/components/front-desk/order-detail'
import {
  mockOrders,
  Order,
  OrderStatus,
  statusLabels,
  statusColors,
  orderTypeLabels,
} from '@/lib/mock-data'
import {
  Search,
  Clock,
  MessageSquare,
  Send,
  Truck,
  User,
  Calendar,
  Filter,
  Phone,
  CreditCard,
  ChefHat,
  X,
} from 'lucide-react'

export default function SearchPage() {
  const [orders] = useState<Order[]>(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')

  // Message dialog
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageOrder, setMessageOrder] = useState<Order | null>(null)
  const [messageText, setMessageText] = useState('')

  const activeFilters = [statusFilter !== 'all', deliveryFilter !== 'all', paymentFilter !== 'all'].filter(Boolean).length

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      order.customerName.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.items.some(i => i.name.toLowerCase().includes(q))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDelivery = deliveryFilter === 'all' || order.deliveryType === deliveryFilter
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter
    return matchesSearch && matchesStatus && matchesDelivery && matchesPayment
  })

  const handleOpenMessage = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setMessageOrder(order)
    setMessageText('')
    setShowMessageDialog(true)
  }

  const handleSendMessage = () => {
    setShowMessageDialog(false)
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setDeliveryFilter('all')
    setPaymentFilter('all')
    setSearchQuery('')
  }

  const handleUpdateStatus = (orderId: string, _newStatus: OrderStatus) => {
    setSelectedOrder(null)
  }

  const handlePostToBaker = (_orderId: string) => {
    setSelectedOrder(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Search & Inquiry</h1>
          <p className="text-sm text-muted-foreground">
            Look up orders by customer name, phone, order ID, or item name
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, phone, order ID, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 text-base rounded-xl border-2 border-border focus:border-primary"
            />
            {searchQuery && (
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearchQuery('')}>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="baker">With Baker</SelectItem>
              <SelectItem value="decorator">Decorating</SelectItem>
              <SelectItem value="quality">Quality Check</SelectItem>
              <SelectItem value="packing">Packing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="dispatched">With Driver</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
            </SelectContent>
          </Select>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={clearFilters}>
              Clear all ({activeFilters})
            </Button>
          )}
          <div className="ml-auto text-sm text-muted-foreground">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Results */}
        {filteredOrders.length === 0 ? (
          <div className="mt-8 text-center py-16 rounded-xl border-2 border-dashed border-border">
            <Search className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-lg font-medium text-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term or adjust your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => (
              <Card key={order.id} className="cursor-pointer border-0 shadow-sm bg-card transition-shadow hover:shadow-md" onClick={() => setSelectedOrder(order)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Left: Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-foreground">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.id}</p>
                        <Badge className={`${statusColors[order.status]} border-0 text-xs`}>{statusLabels[order.status]}</Badge>
                        <Badge variant="outline" className="bg-transparent text-xs">{orderTypeLabels[order.orderType]}</Badge>
                      </div>
                      <p className="text-sm text-foreground truncate">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{order.customerPhone}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{order.pickupDate}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.pickupTime}</span>
                        <span className="flex items-center gap-1">
                          {order.deliveryType === 'delivery' ? <><Truck className="h-3 w-3 text-secondary" />Delivery</> : <><User className="h-3 w-3" />Pickup</>}
                        </span>
                        {order.paymentStatus === 'deposit' && (
                          <span className="flex items-center gap-1 text-amber-600 font-medium">
                            <CreditCard className="h-3 w-3" />Deposit - Balance: ${(order.totalPrice - order.amountPaid).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Price and actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold text-secondary">${order.totalPrice.toFixed(2)}</span>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent" onClick={(e) => handleOpenMessage(order, e)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={handleUpdateStatus} onPostToBaker={handlePostToBaker} onMessage={(order) => handleOpenMessage(order)} />
            </div>
          </div>
        )}

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Message Customer</DialogTitle>
            </DialogHeader>
            {messageOrder && (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-3">
                  <p className="font-medium text-foreground">{messageOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{messageOrder.customerPhone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea placeholder="Type message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="min-h-[100px]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is ready for pickup!`)}>Ready for Pickup</Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is out for delivery!`)}>Out for Delivery</Button>
                  <Button variant="outline" size="sm" className="text-xs bg-transparent" onClick={() => setMessageText(`Hi ${messageOrder.customerName}, regarding your order ${messageOrder.id}, please contact us.`)}>General Inquiry</Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="bg-transparent">Cancel</Button>
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
