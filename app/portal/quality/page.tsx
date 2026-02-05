'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { mockOrders, Order, orderTypeLabels } from '@/lib/mock-data'
import { ClipboardCheck, Clock, Calendar, FileText, ArrowRight, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

export default function QualityPortalPage() {
  const [orders, setOrders] = useState<Order[]>(
    mockOrders.filter((o) => o.status === 'quality')
  )
  const [showCompleted, setShowCompleted] = useState(false)
  const [showRejected, setShowRejected] = useState(false)
  const [rejectNote, setRejectNote] = useState<string>('')
  const [rejectingOrder, setRejectingOrder] = useState<string | null>(null)

  const handleApproveOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'packing' as Order['status'] } : order
      )
    )
    setShowCompleted(true)
    setTimeout(() => setShowCompleted(false), 2000)
  }

  const handleRejectOrder = (orderId: string) => {
    // In real app, this would send back to decorator with notes
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: 'decorator' as Order['status'] } : order
      )
    )
    setRejectingOrder(null)
    setRejectNote('')
    setShowRejected(true)
    setTimeout(() => setShowRejected(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <ClipboardCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quality Check Portal</h1>
            <p className="text-muted-foreground">
              {orders.filter(o => o.status === 'quality').length} orders awaiting inspection
            </p>
          </div>
        </div>

        {/* Orders for QC */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              {orders.filter(o => o.status === 'quality').length}
            </span>
            Orders Awaiting Inspection
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orders.filter(o => o.status === 'quality').map((order) => (
              <Card key={order.id} className="border-2 border-blue-400 bg-card shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      QC Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">
                      {orderTypeLabels[order.orderType]}
                    </p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="rounded-lg bg-accent p-3">
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                        {item.customization && (
                          <p className="text-sm text-secondary mt-1">
                            Spec: {item.customization}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.specialNotes && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                      <FileText className="h-4 w-4 mt-0.5 text-amber-600" />
                      <p className="text-sm text-amber-800">{order.specialNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {order.pickupDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {order.pickupTime}
                    </span>
                  </div>

                  {rejectingOrder === order.id ? (
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Reason for rejection..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => setRejectingOrder(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Send Back
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                        onClick={() => setRejectingOrder(order.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveOrder(order.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          {orders.filter(o => o.status === 'quality').length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No orders awaiting quality check</p>
            </div>
          )}
        </section>

        {/* Completed Toast */}
        {showCompleted && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Order approved & sent to Packing!</span>
          </div>
        )}

        {/* Rejected Toast */}
        {showRejected && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-white shadow-lg">
            <RotateCcw className="h-5 w-5" />
            <span>Order sent back to Decorator!</span>
          </div>
        )}
      </main>
    </div>
  )
}
