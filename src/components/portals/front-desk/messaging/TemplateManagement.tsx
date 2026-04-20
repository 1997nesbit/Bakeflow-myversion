'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { notificationsService } from '@/lib/api/services/notifications'
import { handleApiError } from '@/lib/utils/handle-error'
import type { MessageTemplate, TriggerEvent } from '@/types/notification'
import { TRIGGER_LABELS, TEMPLATE_VARIABLES } from '@/types/notification'
import { Plus, Pencil, Trash2, Zap, MessageSquarePlus } from 'lucide-react'

interface TemplateManagementProps {
  open: boolean
  onClose: () => void
  onTemplatesChanged: () => void
}

const EMPTY: Partial<MessageTemplate> = {
  name: '', content: '', isActive: true, isAutomated: false, triggerEvent: '',
}

export function TemplateManagement({ open, onClose, onTemplatesChanged }: TemplateManagementProps) {
  const [templates, setTemplates]     = useState<MessageTemplate[]>([])
  const [editing, setEditing]         = useState<Partial<MessageTemplate> | null>(null)
  const [isNew, setIsNew]             = useState(false)
  const [saving, setSaving]           = useState(false)
  const [deleting, setDeleting]       = useState<string | null>(null) // id of template being deleted

  const load = async () => {
    try {
      const res = await notificationsService.getTemplates()
      setTemplates(res.results)
    } catch (err) { handleApiError(err) }
  }

  useEffect(() => { if (open) load() }, [open])

  const startNew = () => { setEditing({ ...EMPTY }); setIsNew(true) }
  const startEdit = (t: MessageTemplate) => { setEditing({ ...t }); setIsNew(false) }
  const cancelEdit = () => { setEditing(null); setIsNew(false) }

  const handleSave = async () => {
    if (!editing?.name || !editing?.content) {
      toast.error('Name and content are required.')
      return
    }
    setSaving(true)
    try {
      if (isNew) {
        await notificationsService.createTemplate(editing)
        toast.success('Template created!')
      } else {
        await notificationsService.updateTemplate(editing.id!, editing)
        toast.success('Template updated!')
      }
      await load()
      onTemplatesChanged()
      cancelEdit()
    } catch (err) { handleApiError(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"?`)) return
    setDeleting(id)  // m-5: disable the button while request is in-flight
    try {
      await notificationsService.deleteTemplate(id)
      toast.success('Template deleted.')
      await load()
      onTemplatesChanged()
    } catch (err) { handleApiError(err) }
    finally { setDeleting(null) }
  }

  const insertVar = (v: string) => {
    setEditing(prev => prev ? { ...prev, content: (prev.content ?? '') + v } : prev)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Message Templates</DialogTitle>
          <DialogDescription>
            Create reusable templates with <code className="text-xs bg-muted px-1 rounded">{'{{variable}}'}</code> placeholders.
            Automated templates fire on order events.
          </DialogDescription>
        </DialogHeader>

        {editing ? (
          /* ── Editor ─────────────────────────────────────────────────────── */
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="tpl-name">Template Name</Label>
              <Input
                id="tpl-name"
                value={editing.name ?? ''}
                onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Christmas Greeting"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tpl-content">Message Content</Label>
              <Textarea
                id="tpl-content"
                rows={5}
                value={editing.content ?? ''}
                onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
                placeholder="Hi {{customer_name}}, your order #{{order_no}} is ready..."
              />
              {/* Variable chips */}
              <p className="text-xs text-muted-foreground mt-1">Insert variable:</p>
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_VARIABLES.map(v => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insertVar(v.key)}
                    className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20 transition-colors font-mono"
                  >
                    {v.key}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="tpl-active"
                  checked={editing.isActive ?? true}
                  onCheckedChange={v => setEditing(p => ({ ...p, isActive: v }))}
                />
                <Label htmlFor="tpl-active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="tpl-auto"
                  checked={editing.isAutomated ?? false}
                  onCheckedChange={v => setEditing(p => ({ ...p, isAutomated: v, triggerEvent: v ? p?.triggerEvent : '' }))}
                />
                <Label htmlFor="tpl-auto">Automated</Label>
              </div>
            </div>

            {editing.isAutomated && (
              <div className="space-y-1">
                <Label>Trigger Event</Label>
                <Select
                  value={editing.triggerEvent ?? ''}
                  onValueChange={v => setEditing(p => ({ ...p, triggerEvent: v as TriggerEvent }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select trigger..." /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TRIGGER_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Template'}
              </Button>
            </div>
          </div>
        ) : (
          /* ── List ──────────────────────────────────────────────────────── */
          <div className="space-y-3 pt-2">
            <Button size="sm" className="w-full" onClick={startNew}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>

            {templates.length === 0 && (
              <div className="rounded-xl border-2 border-dashed py-10 text-center">
                <MessageSquarePlus className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No templates yet. Create one above.</p>
              </div>
            )}

            {templates.map(t => (
              <Card key={t.id} className={`border ${t.isActive ? '' : 'opacity-50'}`}>
                <CardContent className="p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">{t.name}</p>
                      {t.isAutomated && (
                        <Badge className="bg-purple-100 text-purple-800 border-0 text-xs flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {TRIGGER_LABELS[t.triggerEvent as TriggerEvent] ?? t.triggerEvent}
                        </Badge>
                      )}
                      {!t.isActive && (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={deleting === t.id}
                      onClick={() => handleDelete(t.id, t.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
