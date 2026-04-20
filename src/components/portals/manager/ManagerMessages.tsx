'use client'

import { useState, useEffect, useCallback } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CustomerRecord } from '@/types/customer'
import type { StaffMember } from '@/types/staff'
import type { Campaign } from '@/types/notification'
import { customersService } from '@/lib/api/services/customers'
import { staffService } from '@/lib/api/services/staff'
import { notificationsService } from '@/lib/api/services/notifications'
import { handleApiError } from '@/lib/utils/handle-error'
import { toast } from 'sonner'
import { MessageSquare, Send, Clock, Loader2 } from 'lucide-react'

export function ManagerMessages() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [audience, setAudience] = useState<string>('all_customers')
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp')
  const [message, setMessage] = useState('')
  // C-3: real campaign history loaded from backend — no more hardcoded fake data
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [sending, setSending] = useState(false)  // C-3: loading state for send button

  const loadCampaigns = useCallback(async () => {
    try {
      const res = await notificationsService.getCampaigns()
      setCampaigns(res.results)
    } catch { /* silent — history is non-critical */ }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    customersService.getAll({ signal: controller.signal })
      .then(res => setCustomers(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    staffService.getAll({ signal: controller.signal })
      .then(res => setStaff(res.results))
      .catch(handleApiError)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  const activeStaff = staff.filter(s => s.status === 'active')

  const getRecipients = (): string[] => {
    switch (audience) {
      case 'all_customers':  return customers.map(c => c.phone).filter(Boolean)
      case 'gold_customers': return customers.filter(c => c.isGold).map(c => c.phone).filter(Boolean)
      case 'all_staff':      return activeStaff.map(s => s.phone).filter(Boolean)
      case 'bakers':         return activeStaff.filter(s => s.role === 'baker').map(s => s.phone).filter(Boolean)
      case 'drivers':        return activeStaff.filter(s => s.role === 'driver').map(s => s.phone).filter(Boolean)
      case 'front_desk':     return activeStaff.filter(s => s.role === 'front_desk').map(s => s.phone).filter(Boolean)
      default:               return []
    }
  }

  const audienceLabel: Record<string, string> = {
    all_customers: 'All Customers', gold_customers: 'Gold Customers',
    all_staff: 'All Staff', bakers: 'Bakers', drivers: 'Drivers', front_desk: 'Front Desk',
  }

  const recipientCount = getRecipients().length

  // C-3: send actually calls the backend campaign API
  const handleSend = async () => {
    const recipients = getRecipients()
    if (!message.trim() || recipients.length === 0) return
    setSending(true)
    try {
      const campaign = await notificationsService.sendCampaign({
        name: `${audienceLabel[audience] ?? audience} — ${new Date().toLocaleDateString()}`,
        messageContent: message.trim(),
        recipients,
      })
      setCampaigns(prev => [campaign, ...prev])
      toast.success(`Campaign sent to ${campaign.recipientsCount} recipient(s)!`)
      setMessage('')
    } catch (err) {
      handleApiError(err)
    } finally {
      setSending(false)
    }
  }

  const templates = [
    'Good morning! Fresh bread and pastries are ready. Visit Bbr Bakeflow today!',
    'Special offer: 15% off all cakes this weekend. Order now!',
    'Your order is ready for pickup at Bbr Bakeflow. Thank you!',
    'Reminder: We close at 8pm today. Rush your orders!',
    'Thank you for being a loyal customer. Enjoy 10% off your next order!',
  ]

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Bulk Messages</h1>
          <p className="text-sm text-white/40">Send messages to customers and staff groups</p>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Compose */}
          <div className="col-span-3 space-y-4">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Compose Message</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/60">Audience</Label>
                    <Select value={audience} onValueChange={setAudience}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_customers">All Customers ({customers.length})</SelectItem>
                        <SelectItem value="gold_customers">Gold Customers ({customers.filter(c => c.isGold).length})</SelectItem>
                        <SelectItem value="all_staff">All Staff ({activeStaff.length})</SelectItem>
                        <SelectItem value="bakers">Bakers ({activeStaff.filter(s => s.role === 'baker').length})</SelectItem>
                        <SelectItem value="drivers">Drivers ({activeStaff.filter(s => s.role === 'driver').length})</SelectItem>
                        <SelectItem value="front_desk">Front Desk ({activeStaff.filter(s => s.role === 'front_desk').length})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/60">Channel</Label>
                    <Select value={channel} onValueChange={(v) => setChannel(v as 'sms' | 'whatsapp')}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white/60">Message</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1 min-h-[120px]" placeholder="Type your message..." />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-white/30">{message.length} characters</span>
                    <span className="text-xs text-white/40">Sending to {recipientCount} recipients</span>
                  </div>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || recipientCount === 0 || sending}
                  className="bg-manager-accent hover:bg-manager-accent/85 text-white"
                >
                  {sending
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
                    : <><Send className="h-4 w-4 mr-2" /> Send Message</>
                  }
                </Button>
              </div>
            </div>

            {/* Templates */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Templates</h3>
              <div className="space-y-2">
                {templates.map((tpl, i) => (
                  <button key={i} type="button" onClick={() => setMessage(tpl)}
                    className="w-full text-left rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors">
                    {tpl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History — now shows real campaigns from backend */}
          <div className="col-span-2">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Recent Campaigns</h3>
              {campaigns.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-xs text-white/30 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" /> No campaigns sent yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((c) => (
                    <div key={c.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-xs font-semibold text-white truncate flex-1">{c.name}</p>
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${
                          c.status === 'sent'      ? 'bg-green-500/20 text-green-300'
                          : c.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-white/10 text-white/50'
                        }`}>{c.status}</Badge>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{c.messageContent}</p>
                      <p className="text-[10px] text-white/20 mt-1.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {c.recipientsCount} recipients
                        {c.sentAt && ` · ${new Date(c.sentAt).toLocaleString()}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
