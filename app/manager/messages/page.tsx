'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockCustomers, mockStaff, staffRoleLabels, type StaffRole } from '@/lib/mock-data'
import { MessageSquare, Send, Users, Crown, Clock, CheckCircle2, Phone } from 'lucide-react'

interface SentMessage {
  id: string
  audience: string
  message: string
  recipientCount: number
  sentAt: string
  channel: 'sms' | 'whatsapp'
}

export default function MessagesPage() {
  const [audience, setAudience] = useState<string>('all_customers')
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('whatsapp')
  const [message, setMessage] = useState('')
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([
    { id: 'MSG-001', audience: 'Gold Customers', message: 'Happy Valentine! Get 20% off all custom cakes this week. Order now at Bbr Bakeflow!', recipientCount: 4, sentAt: '2026-02-05T10:00:00', channel: 'whatsapp' },
    { id: 'MSG-002', audience: 'All Customers', message: 'Good morning! Fresh bread and pastries available. Visit us today!', recipientCount: 10, sentAt: '2026-02-06T07:00:00', channel: 'sms' },
    { id: 'MSG-003', audience: 'All Staff', message: 'Reminder: Monthly meeting this Friday at 5pm. Please confirm attendance.', recipientCount: 9, sentAt: '2026-02-04T14:00:00', channel: 'whatsapp' },
  ])

  const getRecipientCount = () => {
    switch (audience) {
      case 'all_customers': return mockCustomers.length
      case 'gold_customers': return mockCustomers.filter(c => c.isGold).length
      case 'all_staff': return mockStaff.filter(s => s.status === 'active').length
      case 'bakers': return mockStaff.filter(s => s.role === 'baker' && s.status === 'active').length
      case 'drivers': return mockStaff.filter(s => s.role === 'driver' && s.status === 'active').length
      case 'front_desk': return mockStaff.filter(s => s.role === 'front_desk' && s.status === 'active').length
      default: return 0
    }
  }

  const audienceLabel: Record<string, string> = {
    all_customers: 'All Customers', gold_customers: 'Gold Customers',
    all_staff: 'All Staff', bakers: 'Bakers', drivers: 'Drivers', front_desk: 'Front Desk',
  }

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg: SentMessage = {
      id: `MSG-${String(sentMessages.length + 1).padStart(3, '0')}`,
      audience: audienceLabel[audience] || audience,
      message: message.trim(),
      recipientCount: getRecipientCount(),
      sentAt: new Date().toISOString(),
      channel,
    }
    setSentMessages([newMsg, ...sentMessages])
    setMessage('')
  }

  const templates = [
    'Good morning! Fresh bread and pastries are ready. Visit Bbr Bakeflow today!',
    'Special offer: 15% off all cakes this weekend. Order now!',
    'Your order is ready for pickup at Bbr Bakeflow. Thank you!',
    'Reminder: We close at 8pm today. Rush your orders!',
    'Thank you for being a loyal customer. Enjoy 10% off your next order!',
  ]

  return (
    <div className="min-h-screen bg-[#0f0709]">
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
                        <SelectItem value="all_customers">All Customers ({mockCustomers.length})</SelectItem>
                        <SelectItem value="gold_customers">Gold Customers ({mockCustomers.filter(c => c.isGold).length})</SelectItem>
                        <SelectItem value="all_staff">All Staff ({mockStaff.filter(s => s.status === 'active').length})</SelectItem>
                        <SelectItem value="bakers">Bakers ({mockStaff.filter(s => s.role === 'baker' && s.status === 'active').length})</SelectItem>
                        <SelectItem value="drivers">Drivers ({mockStaff.filter(s => s.role === 'driver' && s.status === 'active').length})</SelectItem>
                        <SelectItem value="front_desk">Front Desk ({mockStaff.filter(s => s.role === 'front_desk' && s.status === 'active').length})</SelectItem>
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
                    <span className="text-xs text-white/40">Sending to {getRecipientCount()} recipients</span>
                  </div>
                </div>

                <Button onClick={handleSend} disabled={!message.trim()} className="bg-[#CA0123] hover:bg-[#a8011d] text-white">
                  <Send className="h-4 w-4 mr-2" /> Send Message
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

          {/* History */}
          <div className="col-span-2">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Recent Messages</h3>
              <div className="space-y-3">
                {sentMessages.map((m) => (
                  <div key={m.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="text-[10px] px-1.5 py-0 border-0 bg-purple-500/20 text-purple-300">{m.audience}</Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${m.channel === 'whatsapp' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>{m.channel}</Badge>
                      <span className="text-[10px] text-white/20 ml-auto">{m.recipientCount} recipients</span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{m.message}</p>
                    <p className="text-[10px] text-white/20 mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(m.sentAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
