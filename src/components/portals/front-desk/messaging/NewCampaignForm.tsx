'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Sparkles } from 'lucide-react'

interface Customer {
  name: string
  phone: string
}

interface MessageTemplate {
  id: number
  name: string
  message: string
}

interface NewCampaignFormProps {
  campaignName: string
  campaignMessage: string
  selectedTemplate: string
  selectedRecipients: string[]
  uniqueCustomers: Customer[]
  messageTemplates: MessageTemplate[]
  onNameChange: (v: string) => void
  onMessageChange: (v: string) => void
  onTemplateSelect: (id: string) => void
  onToggleRecipient: (phone: string) => void
  onSelectAll: () => void
  onSend: () => void
  onCancel: () => void
}

export function NewCampaignForm({
  campaignName, campaignMessage, selectedTemplate, selectedRecipients,
  uniqueCustomers, messageTemplates,
  onNameChange, onMessageChange, onTemplateSelect,
  onToggleRecipient, onSelectAll, onSend, onCancel,
}: NewCampaignFormProps) {
  const canSend = !!campaignName && !!campaignMessage && selectedRecipients.length > 0

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name</Label>
              <Input id="campaignName" value={campaignName} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g., Weekend Special Offer" />
            </div>
            <div className="space-y-2">
              <Label>Message Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={onTemplateSelect}>
                <SelectTrigger><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaignMessage">Message</Label>
              <Textarea id="campaignMessage" value={campaignMessage} onChange={(e) => onMessageChange(e.target.value)} placeholder="Write your message..." rows={5} />
              <p className="text-xs text-muted-foreground">
                Use {'{name}'} for customer name, {'{orderId}'} for order ID
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Recipients</Label>
              <Button type="button" variant="ghost" size="sm" onClick={onSelectAll}>
                {selectedRecipients.length === uniqueCustomers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
              {uniqueCustomers.map((customer) => (
                <div key={customer.phone} className="flex items-center gap-3">
                  <Checkbox
                    id={customer.phone}
                    checked={selectedRecipients.includes(customer.phone)}
                    onCheckedChange={() => onToggleRecipient(customer.phone)}
                  />
                  <label htmlFor={customer.phone} className="flex-1 cursor-pointer text-sm">
                    <span className="font-medium text-foreground">{customer.name}</span>
                    <span className="ml-2 text-muted-foreground">{customer.phone}</span>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{selectedRecipients.length} recipients selected</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={onSend} disabled={!canSend}>
            <Send className="mr-2 h-4 w-4" />
            Send Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
