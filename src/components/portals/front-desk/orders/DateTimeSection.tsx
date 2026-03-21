'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Edit3 } from 'lucide-react'

interface DateTimeSectionProps {
  pickupDate: string
  pickupTime: string
  editingDate: boolean
  isAdvance: boolean
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
  onEditingDateChange: (v: boolean) => void
}

export function DateTimeSection({
  pickupDate, pickupTime, editingDate, isAdvance,
  onDateChange, onTimeChange, onEditingDateChange,
}: DateTimeSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Date & Time</h3>
        {!editingDate && (
          <button type="button" onClick={() => onEditingDateChange(true)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Edit3 className="h-3 w-3" />
            Change date (advance order)
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          {editingDate ? (
            <Input id="date" type="date" value={pickupDate} onChange={(e) => onDateChange(e.target.value)} required />
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              <span className="text-foreground">{pickupDate}</span>
              <Badge variant="outline" className="text-xs bg-transparent">Today</Badge>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <Input id="time" type="time" value={pickupTime} onChange={(e) => onTimeChange(e.target.value)} required />
        </div>
      </div>
      {isAdvance && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">Advance order detected. Deposit options available at checkout.</p>
        </div>
      )}
    </div>
  )
}
