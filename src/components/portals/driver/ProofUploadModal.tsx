'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Order } from '@/types/order'
import { ordersService } from '@/lib/api/services/orders'
import { handleApiError } from '@/lib/utils/handle-error'
import { Camera, Upload, X, CheckCircle, ImageIcon } from 'lucide-react'

interface Props {
  order: Order
  open: boolean
  onClose: () => void
  /** Called with the updated order after successful upload */
  onUploaded: (updated: Order) => void
}

export function ProofUploadModal({ order, open, onClose, onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const updated = await ordersService.uploadProof(order.id, file)
      onUploaded(updated)
      toast.success('Proof of delivery uploaded!')
      handleClose()
    } catch (err) {
      handleApiError(err)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setPreview(null)
    setFile(null)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Upload Proof of Delivery
          </DialogTitle>
        </DialogHeader>

        {/* Order mini-info */}
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm">
          <p className="font-semibold text-foreground">{order.trackingId}</p>
          <p className="text-muted-foreground">{order.customer.name} — {order.deliveryAddress}</p>
        </div>

        {/* Drop zone / preview */}
        <div
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer
            ${preview ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Proof preview"
                className="max-h-56 w-full rounded-lg object-contain"
              />
              <button
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1 shadow hover:bg-background"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreview(null)
                  setFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Click to select a photo</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Take a photo or choose from gallery
                </p>
              </div>
            </>
          )}
        </div>

        {/* Hidden file input — accept camera on mobile */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Upload className="h-4 w-4 animate-bounce" />
                Uploading…
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Submit Proof
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
