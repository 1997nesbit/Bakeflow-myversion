'use client'

import { useState, useEffect } from 'react'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Order } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { MessageSquare, Users, Clock, CheckCircle, Plus } from 'lucide-react'
import { NewCampaignForm } from './NewCampaignForm'
import { CampaignHistoryItem } from './CampaignHistoryItem'
import type { Campaign } from './CampaignHistoryItem'

const mockCampaigns: Campaign[] = [
  {
    id: 'CAMP-001',
    name: 'Weekend Special',
    message: 'Order any cake this weekend and get 10% off! Use code WEEKEND10',
    recipients: 156,
    status: 'sent',
    sentAt: '2026-02-03',
  },
  {
    id: 'CAMP-002',
    name: 'Valentine Promotion',
    message: 'Make this Valentine special with our heart-shaped cakes! Pre-order now.',
    recipients: 200,
    status: 'scheduled',
    scheduledFor: '2026-02-10',
  },
]

const messageTemplates = [
  { id: 1, name: 'Order Ready', message: 'Hi {name}! Your order {orderId} is ready for pickup.' },
  { id: 2, name: 'Delivery Update', message: 'Hi {name}! Your order {orderId} is on its way!' },
  { id: 3, name: 'Special Offer', message: 'Hi {name}! We have a special offer just for you: {offer}' },
  { id: 4, name: 'Thank You', message: 'Thank you for your order, {name}! We hope you enjoy your treats from Bbr Bakeflow.' },
]

export function FrontDeskMessaging() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const controller = new AbortController()
    ordersService.getAll({ signal: controller.signal })
      .then(res => setOrders(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  const uniqueCustomers = Array.from(
    new Map(orders.map((o) => [o.customer.phone, { name: o.customer.name, phone: o.customer.phone }])).values()
  )

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = messageTemplates.find((t) => t.id.toString() === templateId)
    if (template) setCampaignMessage(template.message)
  }

  const handleSendCampaign = () => {
    if (!campaignName || !campaignMessage || selectedRecipients.length === 0) return
    const newCampaign: Campaign = {
      id: `CAMP-${String(campaigns.length + 1).padStart(3, '0')}`,
      name: campaignName,
      message: campaignMessage,
      recipients: selectedRecipients.length,
      status: 'sent',
      sentAt: new Date().toISOString().split('T')[0],
    }
    setCampaigns([newCampaign, ...campaigns])
    setShowNewCampaign(false)
    setCampaignName('')
    setCampaignMessage('')
    setSelectedRecipients([])
    setSelectedTemplate('')
  }

  const toggleRecipient = (phone: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]
    )
  }

  const selectAllRecipients = () => {
    setSelectedRecipients(
      selectedRecipients.length === uniqueCustomers.length ? [] : uniqueCustomers.map((c) => c.phone)
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messaging</h1>
            <p className="text-muted-foreground">Send promotions and updates to customers</p>
          </div>
          <Button onClick={() => setShowNewCampaign(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-5 w-5" />
            New Campaign
          </Button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">{uniqueCustomers.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campaigns Sent</p>
                <p className="text-2xl font-bold text-foreground">{campaigns.filter((c) => c.status === 'sent').length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">{campaigns.filter((c) => c.status === 'scheduled').length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {showNewCampaign && (
            <NewCampaignForm
              campaignName={campaignName}
              campaignMessage={campaignMessage}
              selectedTemplate={selectedTemplate}
              selectedRecipients={selectedRecipients}
              uniqueCustomers={uniqueCustomers}
              messageTemplates={messageTemplates}
              onNameChange={setCampaignName}
              onMessageChange={setCampaignMessage}
              onTemplateSelect={handleTemplateSelect}
              onToggleRecipient={toggleRecipient}
              onSelectAll={selectAllRecipients}
              onSend={handleSendCampaign}
              onCancel={() => setShowNewCampaign(false)}
            />
          )}

          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Campaign History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <CampaignHistoryItem key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
