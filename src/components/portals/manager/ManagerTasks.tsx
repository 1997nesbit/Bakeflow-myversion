'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TaskItem } from '@/types/task'
import type { StaffRole } from '@/types/staff'
import { mockTasks } from '@/data/mock/tasks'
import { mockStaff } from '@/data/mock/staff'
import { staffRoleLabels } from '@/data/constants/labels'
import { ListChecks, Plus, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react'

export function ManagerTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks)
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('active')

  const [fTitle, setFTitle] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fAssign, setFAssign] = useState('')
  const [fPriority, setFPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [fDue, setFDue] = useState(new Date().toISOString().split('T')[0])

  const activeTasks = tasks.filter(t => t.status !== 'completed')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const displayed = filterStatus === 'active' ? activeTasks : filterStatus === 'completed' ? completedTasks : tasks

  const priColor: Record<string, string> = {
    urgent: 'bg-red-500/20 text-red-300', high: 'bg-orange-500/20 text-orange-300',
    medium: 'bg-blue-500/20 text-blue-300', low: 'bg-gray-500/20 text-gray-400',
  }
  const statColor: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300', in_progress: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300',
  }

  const handleAdd = () => {
    if (!fTitle || !fAssign) return
    const staffMember = mockStaff.find(s => s.id === fAssign)
    const newTask: TaskItem = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      title: fTitle, description: fDesc || undefined,
      assignedTo: staffMember?.name || fAssign, assignedRole: staffMember?.role || 'front_desk',
      priority: fPriority, status: 'pending', dueDate: fDue, createdAt: new Date().toISOString(),
    }
    setTasks([newTask, ...tasks])
    setShowAdd(false)
    setFTitle(''); setFDesc(''); setFAssign('')
  }

  const updateStatus = (id: string, status: 'pending' | 'in_progress' | 'completed') => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status, completedAt: status === 'completed' ? new Date().toISOString() : undefined } : t))
  }

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-sm text-white/40">{activeTasks.length} active, {completedTasks.length} completed</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-manager-accent hover:bg-manager-accent/85 text-white">
            <Plus className="h-4 w-4 mr-2" /> Assign Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-1 rounded-lg border border-white/10 p-0.5 w-fit mb-5">
          {(['active', 'completed', 'all'] as const).map(f => (
            <button key={f} type="button" onClick={() => setFilterStatus(f)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${filterStatus === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
              {f === 'active' ? `Active (${activeTasks.length})` : f === 'completed' ? `Completed (${completedTasks.length})` : `All (${tasks.length})`}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {displayed.sort((a, b) => {
            const pri = { urgent: 0, high: 1, medium: 2, low: 3 }
            return (pri[a.priority] || 3) - (pri[b.priority] || 3)
          }).map((t) => (
            <div key={t.id} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
              <div className="mt-0.5">
                {t.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : t.priority === 'urgent' ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <Clock className="h-5 w-5 text-white/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-medium ${t.status === 'completed' ? 'text-white/50 line-through' : 'text-white'}`}>{t.title}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${priColor[t.priority]}`}>{t.priority}</Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statColor[t.status]}`}>
                    {t.status === 'in_progress' ? 'In Progress' : t.status === 'completed' ? 'Done' : 'Pending'}
                  </Badge>
                </div>
                {t.description && <p className="text-xs text-white/40 mb-1">{t.description}</p>}
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>Assigned: {t.assignedTo}</span>
                  <span>Due: {t.dueDate}</span>
                  {t.completedAt && <span>Completed: {new Date(t.completedAt).toLocaleDateString()}</span>}
                </div>
              </div>
              {t.status !== 'completed' && (
                <div className="flex items-center gap-1 shrink-0">
                  {t.status === 'pending' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10" onClick={() => updateStatus(t.id, 'in_progress')}>
                      Start
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10" onClick={() => updateStatus(t.id, 'completed')}>
                    Complete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="bg-manager-card border-white/10 text-white sm:max-w-md">
            <DialogHeader><DialogTitle>Assign New Task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-white/60">Task Title</Label><Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" placeholder="e.g. Clean walk-in fridge" /></div>
              <div><Label className="text-white/60">Description (optional)</Label><Textarea value={fDesc} onChange={(e) => setFDesc(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1 min-h-[60px]" /></div>
              <div>
                <Label className="text-white/60">Assign To</Label>
                <Select value={fAssign} onValueChange={setFAssign}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue placeholder="Select staff member" /></SelectTrigger>
                  <SelectContent>
                    {mockStaff.filter(s => s.status === 'active').map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({staffRoleLabels[s.role]})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/60">Priority</Label>
                <Select value={fPriority} onValueChange={(v) => setFPriority(v as 'low' | 'medium' | 'high' | 'urgent')}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60">Due Date</Label><Input type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <Button onClick={handleAdd} className="w-full bg-manager-accent hover:bg-manager-accent/85 text-white">Assign Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
