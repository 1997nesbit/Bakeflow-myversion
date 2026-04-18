'use client'

import { Badge } from '@/components/ui/badge'

interface Campaign {
  id: string
  name: string
  message: string
  recipients: number
  status: 'draft' | 'sent' | 'scheduled'
  sentAt?: string
  scheduledFor?: string
}

const STATUS_COLORS: Record<Campaign['status'], string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
}

const STATUS_LABELS: Record<Campaign['status'], string> = {
  draft: 'Draft',
  sent: 'Sent',
  scheduled: 'Scheduled',
}

interface CampaignHistoryItemProps {
  campaign: Campaign
}

export function CampaignHistoryItem({ campaign }: CampaignHistoryItemProps) {
  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground">{campaign.name}</p>
            <Badge className={`${STATUS_COLORS[campaign.status]} border-0`}>
              {STATUS_LABELS[campaign.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{campaign.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{campaign.recipients} recipients</p>
          <p className="text-xs text-muted-foreground">
            {campaign.status === 'sent' ? `Sent on ${campaign.sentAt}` : `Scheduled for ${campaign.scheduledFor}`}
          </p>
        </div>
      </div>
      <div className="mt-3 rounded bg-muted/50 p-3">
        <p className="text-sm text-foreground">{campaign.message}</p>
      </div>
    </div>
  )
}

export type { Campaign }
