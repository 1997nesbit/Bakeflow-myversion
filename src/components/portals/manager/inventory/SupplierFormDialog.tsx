'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import type { Supplier, SupplierPayload } from '@/types/inventory'
import { Truck } from 'lucide-react'

interface Props {
  open: boolean
  supplier: Supplier | null   // null = create mode
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: SupplierPayload) => Promise<void>
}

export function SupplierFormDialog({ open, supplier, onOpenChange, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setName(supplier?.name ?? '')
      setPhone(supplier?.phone ?? '')
      setEmail(supplier?.email ?? '')
    }
  }, [open, supplier])

  const isValid = name.trim() && phone.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'bg-white/5 border-white/10 text-white placeholder:text-white/30 mt-1'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-manager-card border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Truck className="h-5 w-5 text-manager-accent" />
            {supplier ? 'Edit Supplier' : 'New Supplier'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-white/60">Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Supplier name" className={inputCls} />
          </div>
          <div>
            <Label className="text-white/60">Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255…" className={inputCls} />
          </div>
          <div>
            <Label className="text-white/60">Email (optional)</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="supplier@email.com" className={inputCls} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 text-white/60 hover:text-white bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="bg-manager-accent hover:bg-manager-accent/85 text-white"
          >
            {supplier ? 'Save Changes' : 'Create Supplier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
