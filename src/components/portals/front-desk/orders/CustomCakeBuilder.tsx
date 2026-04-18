'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Cake } from 'lucide-react'
import { cakeFlavours, icingTypes } from '@/data/constants/menus'

interface CustomCakeBuilderProps {
  customFlavour: string
  customIcing: string
  customKg: number
  customPrice: number
  customDesc: string
  customNote: string
  onFlavourChange: (v: string) => void
  onIcingChange: (v: string) => void
  onKgChange: (v: number) => void
  onPriceChange: (v: number) => void
  onDescChange: (v: string) => void
  onNoteChange: (v: string) => void
  onAdd: () => void
}

export function CustomCakeBuilder({
  customFlavour, customIcing, customKg, customPrice, customDesc, customNote,
  onFlavourChange, onIcingChange, onKgChange, onPriceChange, onDescChange, onNoteChange,
  onAdd,
}: CustomCakeBuilderProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Cake className="h-4 w-4" />
        Custom Cake
      </h3>
      <div className="rounded-lg bg-accent/50 border border-border p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Cake Flavour</Label>
            <Select value={customFlavour} onValueChange={onFlavourChange}>
              <SelectTrigger><SelectValue placeholder="Select flavour" /></SelectTrigger>
              <SelectContent>{cakeFlavours.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Icing Type</Label>
            <Select value={customIcing} onValueChange={onIcingChange}>
              <SelectTrigger><SelectValue placeholder="Select icing" /></SelectTrigger>
              <SelectContent>{icingTypes.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Weight (kg)</Label>
            <Input type="number" min="0.5" step="0.5" value={customKg} onChange={(e) => onKgChange(Number.parseFloat(e.target.value) || 1)} />
          </div>
          <div className="space-y-2">
            <Label>Price (TZS)</Label>
            <Input type="number" min="0" step="1" value={customPrice || ''} onChange={(e) => onPriceChange(Number.parseFloat(e.target.value) || 0)} placeholder="Enter price" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Cake Description (how it should look)</Label>
          <Textarea placeholder="e.g., 2-tier round, pink drip, fresh flowers on top, gold leaf accent..." value={customDesc} onChange={(e) => onDescChange(e.target.value)} rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Note for Customer (what to write on cake)</Label>
          <Input placeholder="e.g., Happy Birthday Sarah!" value={customNote} onChange={(e) => onNoteChange(e.target.value)} />
        </div>
        <Button
          type="button"
          onClick={onAdd}
          disabled={!customFlavour || !customIcing || customPrice <= 0}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Cake to Order
        </Button>
      </div>
    </div>
  )
}
