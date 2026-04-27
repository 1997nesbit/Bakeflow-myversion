'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CustomerRecord } from '@/types/customer'
import type { Campaign, MessageTemplate } from '@/types/notification'
import { customersService } from '@/lib/api/services/customers'
import { notificationsService } from '@/lib/api/services/notifications'
import { handleApiError } from '@/lib/utils/handle-error'
import {
  MessageSquare, Users, CheckCircle, Plus, Settings2,
  Send, Clock, Sparkles,
} from 'lucide-react'
import { NewCampaignForm } from './NewCampaignForm'
import { TemplateManagement } from './TemplateManagement'

export function FrontDeskMessaging() {
  const [campaigns, setCampaigns]             = useState<Campaign[]>([])
  const [templates, setTemplates]             = useState<MessageTemplate[]>([])
  // M-2: use the dedicated customers endpoint, not orders, for the contact list
  const [customers, setCustomers]             = useState<CustomerRecord[]>([])
  const [showNewCampaign, setShowNewCampaign] = useState(false)
  const [showTemplates, setShowTemplates]     = useState(false)

  // ── Campaign form state ──────────────────────────────────────────────────
  const [campaignName, setCampaignName]             = useState('')
  const [campaignMessage, setCampaignMessage]       = useState('')
  const [selectedTemplate, setSelectedTemplate]     = useState('')
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [sending, setSending]                       = useState(false)
  const [sendResult, setSendResult]                 = useState<'success' | 'error' | 'timeout' | null>(null)
  const [sentCount, setSentCount]                   = useState(0)
  // M-3: track the current search term here so select-all can use the filtered list
  const [recipientSearch, setRecipientSearch]       = useState('')
  const [isScheduled, setIsScheduled]               = useState(false)
  const [scheduledFor, setScheduledFor]             = useState('')

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await notificationsService.getCampaigns()
      setCampaigns(res.results)
    } catch { /* silent */ }
  }, [])

  const loadTemplates = useCallback(async () => {
    try {
      const res = await notificationsService.getTemplates()
      setTemplates(res.results.filter(t => t.isActive))
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    // M-2: fetch customers directly — no longer derived from orders list
    customersService.getAllForSearch({ signal: controller.signal })
      .then(setCustomers)
      .catch(handleApiError)
    loadCampaigns()
    loadTemplates()
    return () => controller.abort()
  }, [loadCampaigns, loadTemplates])

  // M-2: build unique customer list with phone directly from Customer records
  const uniqueCustomers = customers
    .filter(c => c.phone)
    .map(c => ({ name: c.name, phone: c.phone }))

  // M-3: compute filtered list here so select-all can reference it
  const filteredCustomers = uniqueCustomers.filter(c =>
    c.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
    c.phone.includes(recipientSearch)
  )

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    const tpl = templates.find(t => t.id === templateId)
    if (tpl) setCampaignMessage(tpl.content)
  }

  const handleSendCampaign = async () => {
    if (!campaignName || !campaignMessage || selectedRecipients.length === 0) return
    setSending(true)
    setSendResult(null)
    try {
      const campaign = await notificationsService.sendCampaign({
        name: campaignName,
        messageContent: campaignMessage,
        recipients: selectedRecipients,
        scheduledFor: isScheduled && scheduledFor
          ? new Date(scheduledFor).toISOString()   // convert local time → UTC ISO
          : undefined,
      })
      setCampaigns(prev => [campaign, ...prev])
      setSentCount(campaign.recipientsCount)
      setSendResult('success')
      // Reset form fields after a beat so the user sees the success banner
      setTimeout(() => {
        setShowNewCampaign(false)
        setCampaignName('')
        setCampaignMessage('')
        setSelectedRecipients([])
        setSelectedTemplate('')
        setRecipientSearch('')
        setIsScheduled(false)
        setScheduledFor('')
        setSendResult(null)
      }, 2000)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      const message = (err as { message?: string })?.message ?? ''
      if (code === 'ECONNABORTED' || message.includes('timeout')) {
        setSendResult('timeout')
      } else {
        setSendResult('error')
      }
    } finally {
      setSending(false)
    }
  }

  const toggleRecipient = (phone: string) => {
    setSelectedRecipients(prev => {
      const s = new Set(prev)
      s.has(phone) ? s.delete(phone) : s.add(phone)
      return Array.from(s)
    })
  }

  // O(n) select-all using Set union/difference — no O(n²) includes() scans
  const selectAllFiltered = () => {
    const filteredPhones = filteredCustomers.map(c => c.phone)
    const currentSet = new Set(selectedRecipients)
    const allSelected = filteredPhones.every(p => currentSet.has(p))
    if (allSelected) {
      const removeSet = new Set(filteredPhones)
      setSelectedRecipients(selectedRecipients.filter(p => !removeSet.has(p)))
    } else {
      filteredPhones.forEach(p => currentSet.add(p))
      setSelectedRecipients(Array.from(currentSet))
    }
  }

  const sentCampaignCount = campaigns.filter(c => c.status === 'sent').length
  const scheduledCount     = campaigns.filter(c => c.status === 'scheduled').length

  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messaging</h1>
            <p className="text-muted-foreground">Send promotions and updates to customers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
            <Button onClick={() => setShowNewCampaign(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-5 w-5" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                {/* M-2: now reflects the real customer count, not order-derived */}
                <p className="text-2xl font-bold">{uniqueCustomers.length}</p>
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
                <p className="text-2xl font-bold">{sentCount}</p>
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
                <p className="text-2xl font-bold">{scheduledCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── New campaign form ────────────────────────────────────── */}
          {showNewCampaign && (
          <NewCampaignForm
              campaignName={campaignName}
              campaignMessage={campaignMessage}
              selectedTemplate={selectedTemplate}
              selectedRecipients={selectedRecipients}
              uniqueCustomers={uniqueCustomers}
              filteredCustomers={filteredCustomers}
              recipientSearch={recipientSearch}
              messageTemplates={templates.map(t => ({ id: t.id, name: t.name, message: t.content }))}
              onNameChange={setCampaignName}
              onMessageChange={setCampaignMessage}
              onTemplateSelect={handleTemplateSelect}
              onToggleRecipient={toggleRecipient}
              onSelectAllFiltered={selectAllFiltered}
              onSearchChange={setRecipientSearch}
              onIsScheduledChange={setIsScheduled}
              onScheduledForChange={setScheduledFor}
              onSend={handleSendCampaign}
              onCancel={() => setShowNewCampaign(false)}
              isSending={sending}
              sendResult={sendResult}
              sentCount={sentCount}
              isScheduled={isScheduled}
              scheduledFor={scheduledFor}
            />
          )}

          {/* ── Campaign history ──────────────────────────────────────── */}
          <Card className="border-0 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Campaign History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed py-10 text-center">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">No campaigns sent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(c => (
                    <div key={c.id} className="flex items-start justify-between rounded-lg border p-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">{c.name}</p>
                          <Badge className={
                            c.status === 'sent' ? 'bg-green-100 text-green-800 border-0 text-xs'
                            : c.status === 'scheduled' ? 'bg-blue-100 text-blue-800 border-0 text-xs'
                            : 'bg-secondary text-secondary-foreground border-0 text-xs'
                          }>
                            {c.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.messageContent}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {c.recipientsCount} recipients
                          </span>
                          {c.sentAt && (
                            <span className="flex items-center gap-1">
                              <Send className="h-3 w-3" /> {new Date(c.sentAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── Template management dialog ──────────────────────────────── */}
      <TemplateManagement
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onTemplatesChanged={loadTemplates}
      />
    </div>
  )
}
