'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CalendarClock } from 'lucide-react'

interface DateTimeSectionProps {
  pickupDate: string
  pickupTime: string
  isAdvance: boolean
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
}

function toLocalDateString(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function formatPickupDate(dateStr: string): { label: string; daysAway: number } | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const picked = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysAway = Math.round((picked.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const label = picked.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return { label, daysAway }
}

const QUICK_PICKS = [
  { label: 'Today',    offset: 0 },
  { label: 'Tomorrow', offset: 1 },
  { label: '+2 days',  offset: 2 },
  { label: '+3 days',  offset: 3 },
  { label: '+1 week',  offset: 7 },
]

// 8:00 AM – 8:00 PM in 30-minute steps
const TIME_SLOTS: { label: string; value: string }[] = Array.from({ length: 25 }, (_, i) => {
  const totalMinutes = 8 * 60 + i * 30
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  const label = new Date(`1970-01-01T${value}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return { label, value }
})

export function DateTimeSection({
  pickupDate, pickupTime, isAdvance,
  onDateChange, onTimeChange,
}: DateTimeSectionProps) {
  const formatted = formatPickupDate(pickupDate)

  function dayHint(): string {
    if (!formatted) return ''
    const { label, daysAway } = formatted
    if (daysAway === 0) return `Today · ${label}`
    if (daysAway === 1) return `Tomorrow · ${label}`
    if (daysAway > 1) return `${daysAway} days away · ${label}`
    return `${label}`
  }

  const isPast = formatted ? formatted.daysAway < 0 : false

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-foreground">Pickup Date & Time</h3>
      </div>

      {/* Quick-pick chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PICKS.map(({ label, offset }) => {
          const value = toLocalDateString(offset)
          const active = pickupDate === value
          return (
            <Button
              key={offset}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              className={active ? 'bg-primary text-primary-foreground' : 'bg-transparent'}
              onClick={() => onDateChange(value)}
            >
              {label}
            </Button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={pickupDate}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
          {pickupDate && (
            <p className={`text-xs ${isPast ? 'text-destructive' : 'text-muted-foreground'}`}>
              {isPast ? 'Selected date is in the past' : dayHint()}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Time *</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {TIME_SLOTS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => onTimeChange(value)}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors
                  ${pickupTime === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-transparent text-foreground hover:bg-accent'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground shrink-0">Custom:</span>
            <Input
              id="time"
              type="time"
              value={pickupTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      </div>

      {isAdvance && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Advance order — deposit options will be available at checkout.
          </p>
        </div>
      )}
    </div>
  )
}
