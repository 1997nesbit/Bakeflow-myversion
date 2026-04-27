'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Send, Sparkles, Copy, ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, TimerOff } from 'lucide-react'
import { TEMPLATE_VARIABLES } from '@/types/notification'

type SendResult = 'success' | 'error' | 'timeout' | null

// Inline status banner shown between the recipient list and the action footer
function StatusBanner({ result, count }: { result: SendResult; count?: number }) {
  if (!result) return null
  const config = {
    success: {
      icon: <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />,
      className: 'bg-green-50 border-green-200 text-green-800',
      text: `✓ Campaign delivered to ${count ?? 0} recipient${(count ?? 0) !== 1 ? 's' : ''}.`,
    },
    error: {
      icon: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
      className: 'bg-red-50 border-red-200 text-red-700',
      text: 'Failed to send. Check gateway settings and try again.',
    },
    timeout: {
      icon: <TimerOff className="h-4 w-4 shrink-0 text-amber-600" />,
      className: 'bg-amber-50 border-amber-200 text-amber-700',
      text: 'Request timed out. The SMS gateway may be slow — please retry.',
    },
  } as const
  const c = config[result]
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${c.className}`}>
      {c.icon}{c.text}
    </div>
  )
}

// Max rows to render at once — prevents sluggish 500-node DOM on large lists.
// The user can narrow down further via search.
const DISPLAY_CAP = 60

interface Customer {
  name: string
  phone: string
}

interface MessageTemplate {
  id: string
  name: string
  message: string
}

interface NewCampaignFormProps {
  campaignName: string
  campaignMessage: string
  selectedTemplate: string
  selectedRecipients: string[]
  uniqueCustomers: Customer[]
  filteredCustomers: Customer[]
  recipientSearch: string
  messageTemplates: MessageTemplate[]
  isSending?: boolean
  sendResult?: 'success' | 'error' | 'timeout' | null
  sentCount?: number
  isScheduled: boolean
  scheduledFor: string
  onNameChange: (v: string) => void
  onMessageChange: (v: string) => void
  onTemplateSelect: (id: string) => void
  onToggleRecipient: (phone: string) => void
  onSelectAllFiltered: () => void
  onSearchChange: (v: string) => void
  onIsScheduledChange: (v: boolean) => void
  onScheduledForChange: (v: string) => void
  onSend: () => void
  onCancel: () => void
}

export function NewCampaignForm({
  campaignName, campaignMessage, selectedTemplate, selectedRecipients,
  uniqueCustomers, filteredCustomers, recipientSearch, messageTemplates, isSending,
  sendResult, sentCount, isScheduled, scheduledFor,
  onNameChange, onMessageChange, onTemplateSelect,
  onToggleRecipient, onSelectAllFiltered, onSearchChange, 
  onIsScheduledChange, onScheduledForChange, onSend, onCancel,
}: NewCampaignFormProps) {
  const canSend = !!campaignName && !!campaignMessage && selectedRecipients.length > 0 && !isSending

  const [expanded, setExpanded] = useState<string | null>(null)

  // O(1) lookups — convert the array to a Set once per render cycle.
  // This turns the O(n²) allFilteredSelected check into O(n).
  const selectedSet = useMemo(() => new Set(selectedRecipients), [selectedRecipients])

  // Cap how many rows we render; user narrows via search
  const visibleCustomers = filteredCustomers.slice(0, DISPLAY_CAP)
  const hiddenCount = filteredCustomers.length - visibleCustomers.length

  const allFilteredSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every(c => selectedSet.has(c.phone))

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  return (
    <Card className="border-0 shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Create New Campaign
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Left: message composer ──────────────────────────────── */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g., Christmas Special"
              />
            </div>
            <div className="space-y-2">
              <Label>Message Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={onTemplateSelect}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaignMessage">Message</Label>
              <Textarea
                id="campaignMessage"
                value={campaignMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Write your message or pick a template above..."
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Variables: {TEMPLATE_VARIABLES.map(v => v.key).join(' · ')}
              </p>
            </div>
            <div className="space-y-4 rounded-xl border border-dashed p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isScheduled"
                  checked={isScheduled}
                  onCheckedChange={(checked) => onIsScheduledChange(!!checked)}
                />
                <Label htmlFor="isScheduled" className="text-sm font-medium cursor-pointer">
                  Schedule for later
                </Label>
              </div>

              {isScheduled && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Label htmlFor="scheduledFor" className="text-xs text-muted-foreground uppercase tracking-wider">
                    Dispatch Time
                  </Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => onScheduledForChange(e.target.value)}
                    className="h-9"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Campaign will be sent automatically after this time.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: recipient picker ───────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Recipients{' '}
                <span className="font-normal text-muted-foreground">
                  ({selectedRecipients.length} selected / {uniqueCustomers.length} total)
                </span>
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={onSelectAllFiltered}
                disabled={filteredCustomers.length === 0}>
                {allFilteredSelected ? 'Deselect Filtered' : 'Select All Filtered'}
              </Button>
            </div>

            <Input
              placeholder="Search by name or phone…"
              className="h-8 text-xs"
              value={recipientSearch}
              onChange={e => onSearchChange(e.target.value)}
            />

            {/* Customer list — capped at DISPLAY_CAP rows */}
            <div className="max-h-80 space-y-1 overflow-y-auto rounded-lg border p-2">
              {visibleCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No customers found.</p>
              )}
              {visibleCustomers.map((customer) => {
                const isExpanded = expanded === customer.phone
                const isChecked  = selectedSet.has(customer.phone)   // O(1)

                return (
                  <div key={customer.phone} className="rounded-md">
                    <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md">
                      <Checkbox
                        id={customer.phone}
                        checked={isChecked}
                        onCheckedChange={() => onToggleRecipient(customer.phone)}
                      />
                      <label
                        htmlFor={customer.phone}
                        className="flex-1 cursor-pointer text-sm min-w-0"
                      >
                        <span className="font-medium text-foreground">{customer.name}</span>
                        <span className="ml-2 text-muted-foreground text-xs">{customer.phone}</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : customer.phone)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {isExpanded ? 'Hide' : 'Info'}
                        </Badge>
                        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="ml-8 mb-1 rounded-md bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(customer.phone, 'Phone')}
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" /> Copy phone number
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Overflow notice — shown when results exceed DISPLAY_CAP */}
              {hiddenCount > 0 && (
                <p className="text-center text-xs text-muted-foreground py-3 border-t mt-2">
                  {hiddenCount} more customer{hiddenCount > 1 ? 's' : ''} not shown —{' '}
                  <span className="text-primary">search to narrow down</span>
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Showing {visibleCustomers.length} of {filteredCustomers.length} filtered
            </p>
          </div>
        </div>

        {/* Inline send result banner */}
        <StatusBanner result={sendResult ?? null} count={sentCount} />

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isSending}>Cancel</Button>
          <Button
            className={`transition-colors ${
              sendResult === 'error' || sendResult === 'timeout'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary hover:bg-primary/90'
            }`}
            onClick={onSend}
            disabled={!canSend}
          >
            {isSending
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : sendResult === 'success' ? <CheckCircle2 className="mr-2 h-4 w-4" />
              : sendResult === 'error' || sendResult === 'timeout' ? <XCircle className="mr-2 h-4 w-4" />
              : <Send className="mr-2 h-4 w-4" />}
            {isSending ? 'Sending…'
              : sendResult === 'success' ? 'Send Another'
              : sendResult === 'error' || sendResult === 'timeout' ? 'Retry'
              : `Send Campaign (${selectedRecipients.length})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
