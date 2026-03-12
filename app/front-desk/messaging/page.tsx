'use client'

import { useState } from 'react'
import { FrontDeskSidebar } from '@/components/portal-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockOrders } from '@/lib/mock-data'
import {
  Send,
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  Plus,
  Sparkles,
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  message: string
  recipients: number
  status: 'draft' | 'sent' | 'scheduled'
  sentAt?: string
  scheduledFor?: string
}

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

export default function MessagingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [campaignMessage, setCampaignMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])

  const uniqueCustomers = Array.from(
    new Map(mockOrders.map((o) => [o.customerPhone, { name: o.customerName, phone: o.customerPhone }])).values()
  )

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = messageTemplates.find((t) => t.id.toString() === templateId)
    if (template) {
      setCampaignMessage(template.message)
    }
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
      prev.includes(phone)
        ? prev.filter((p) => p !== phone)
        : [...prev, phone]
    )
  }

  const selectAllRecipients = () => {
    if (selectedRecipients.length === uniqueCustomers.length) {
      setSelectedRecipients([])
    } else {
      setSelectedRecipients(uniqueCustomers.map((c) => c.phone))
    }
  }

  const statusColors: Record<Campaign['status'], string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messaging</h1>
            <p className="text-muted-foreground">
              Send promotions and updates to customers
            </p>
          </div>
          <Button
            onClick={() => setShowNewCampaign(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Campaign
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold text-foreground">
                  {uniqueCustomers.length}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.filter((c) => c.status === 'sent').length}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {campaigns.filter((c) => c.status === 'scheduled').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* New Campaign Form */}
          {showNewCampaign && (
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create New Campaign
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaignName">Campaign Name</Label>
                      <Input
                        id="campaignName"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="e.g., Weekend Special Offer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Message Template (Optional)</Label>
                      <Select
                        value={selectedTemplate}
                        onValueChange={handleTemplateSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {messageTemplates.map((template) => (
                            <SelectItem
                              key={template.id}
                              value={template.id.toString()}
                            >
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="campaignMessage">Message</Label>
                      <Textarea
                        id="campaignMessage"
                        value={campaignMessage}
                        onChange={(e) => setCampaignMessage(e.target.value)}
                        placeholder="Write your message..."
                        rows={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {'{name}'} for customer name, {'{orderId}'} for order ID
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Recipients</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={selectAllRecipients}
                      >
                        {selectedRecipients.length === uniqueCustomers.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </Button>
                    </div>
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
                      {uniqueCustomers.map((customer) => (
                        <div
                          key={customer.phone}
                          className="flex items-center gap-3"
                        >
                          <Checkbox
                            id={customer.phone}
                            checked={selectedRecipients.includes(customer.phone)}
                            onCheckedChange={() => toggleRecipient(customer.phone)}
                          />
                          <label
                            htmlFor={customer.phone}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            <span className="font-medium text-foreground">
                              {customer.name}
                            </span>
                            <span className="ml-2 text-muted-foreground">
                              {customer.phone}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedRecipients.length} recipients selected
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewCampaign(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSendCampaign}
                    disabled={
                      !campaignName ||
                      !campaignMessage ||
                      selectedRecipients.length === 0
                    }
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign History */}
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
                  <div
                    key={campaign.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {campaign.name}
                          </p>
                          <Badge
                            className={`${statusColors[campaign.status]} border-0`}
                          >
                            {campaign.status === 'sent'
                              ? 'Sent'
                              : campaign.status === 'scheduled'
                              ? 'Scheduled'
                              : 'Draft'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campaign.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {campaign.recipients} recipients
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.status === 'sent'
                            ? `Sent on ${campaign.sentAt}`
                            : `Scheduled for ${campaign.scheduledFor}`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 rounded bg-muted/50 p-3">
                      <p className="text-sm text-foreground">{campaign.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
