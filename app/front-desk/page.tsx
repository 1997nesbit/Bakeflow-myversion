'use client'

import React from "react"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
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
import { OrderForm, NewOrderData } from '@/components/front-desk/order-form'
import { OrderDetail } from '@/components/front-desk/order-detail'
import {
  mockOrders,
  Order,
  OrderStatus,
  statusLabels,
  statusColors,
  orderTypeLabels,
} from '@/lib/mock-data'
import { Plus, Search, Clock, MapPin, MessageSquare, Send, ChefHat, CheckCircle } from 'lucide-react'

export default function FrontDeskPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [messageOrder, setMessageOrder] = useState<Order | null>(null)
  const [messageText, setMessageText] = useState('')
  const [showSentConfirm, setShowSentConfirm] = useState(false)
  const [showPostedConfirm, setShowPostedConfirm] = useState(false)

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleNewOrder = (data: NewOrderData) => {
    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      ...data,
      status: 'pending',
      totalPrice: data.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      ),
      createdAt: new Date().toISOString(),
    }
    setOrders([newOrder, ...orders])
    setShowNewOrder(false)
  }

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
    setSelectedOrder(null)
  }

  const handlePostToBaker = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'baker' as OrderStatus } : order
      )
    )
    setSelectedOrder(null)
    setShowPostedConfirm(true)
    setTimeout(() => setShowPostedConfirm(false), 2000)
  }

  const handleOpenMessage = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation()
    setMessageOrder(order)
    setMessageText('')
    setShowMessageDialog(true)
  }

  const handleSendMessage = () => {
    // In a real app, this would send an SMS/WhatsApp message
    setShowMessageDialog(false)
    setShowSentConfirm(true)
    setTimeout(() => setShowSentConfirm(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Front Desk</h1>
            <p className="text-muted-foreground">
              Manage orders and customer interactions
            </p>
          </div>
          <Button
            onClick={() => setShowNewOrder(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Order
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="baker">With Baker</SelectItem>
              <SelectItem value="decorator">Decorating</SelectItem>
              <SelectItem value="quality">Quality Check</SelectItem>
              <SelectItem value="packing">Packing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer border-0 shadow-sm transition-shadow hover:shadow-md bg-card"
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.id}</p>
                  </div>
                  <Badge className={`${statusColors[order.status]} border-0`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm text-foreground">
                    {orderTypeLabels[order.orderType]} -{' '}
                    {order.items.map((i) => i.name).join(', ')}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {order.pickupTime}
                    </span>
                    {order.isDelivery && (
                      <span className="flex items-center gap-1 text-secondary">
                        <MapPin className="h-3.5 w-3.5" />
                        Delivery
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">
                    {order.pickupDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      onClick={(e) => handleOpenMessage(order, e)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-secondary">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}

        {/* Order Form Modal */}
        {showNewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <OrderForm
                onClose={() => setShowNewOrder(false)}
                onSubmit={handleNewOrder}
              />
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <OrderDetail
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={handleUpdateStatus}
                onPostToBaker={handlePostToBaker}
                onMessage={(order) => {
                  setMessageOrder(order)
                  setMessageText('')
                  setShowMessageDialog(true)
                }}
              />
            </div>
          </div>
        )}

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Send Message to Customer</DialogTitle>
            </DialogHeader>
            {messageOrder && (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent p-3">
                  <p className="font-medium text-foreground">{messageOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{messageOrder.customerPhone}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is ready for pickup!`)}
                  >
                    Ready for Pickup
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setMessageText(`Hi ${messageOrder.customerName}, your order ${messageOrder.id} is out for delivery!`)}
                  >
                    Out for Delivery
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => setMessageText(`Hi ${messageOrder.customerName}, we need to confirm some details about your order ${messageOrder.id}. Please call us at your earliest convenience.`)}
                  >
                    Need Confirmation
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={!messageText.trim()} className="bg-primary hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sent Confirmation Toast */}
        {showSentConfirm && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Message sent successfully!</span>
          </div>
        )}

        {/* Posted to Baker Confirmation Toast */}
        {showPostedConfirm && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-lg">
            <ChefHat className="h-5 w-5" />
            <span>Order posted to Baker Portal!</span>
          </div>
        )}
      </main>
    </div>
  )
}
