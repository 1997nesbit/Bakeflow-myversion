'use client'

import { ManagerSidebar } from '@/components/manager/manager-sidebar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { mockTasks, staffRoleLabels } from '@/lib/mock-data'
import { History, Search, CheckCircle2, Clock, Calendar, User } from 'lucide-react'
import { useState } from 'react'

export default function TaskHistoryPage() {
  const [search, setSearch] = useState('')

  const allTasks = [...mockTasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const filtered = allTasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.assignedTo.toLowerCase().includes(search.toLowerCase()))

  const priColor: Record<string, string> = {
    urgent: 'bg-red-500/20 text-red-300', high: 'bg-orange-500/20 text-orange-300',
    medium: 'bg-blue-500/20 text-blue-300', low: 'bg-gray-500/20 text-gray-400',
  }
  const statColor: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-300', in_progress: 'bg-blue-500/20 text-blue-300', completed: 'bg-green-500/20 text-green-300',
  }

  return (
    <div className="min-h-screen bg-[#0f0709]">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Task History</h1>
          <p className="text-sm text-white/40">Full timeline of all assigned tasks</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Total Tasks</p>
            <p className="text-xl font-bold text-white">{allTasks.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Completed</p>
            <p className="text-xl font-bold text-green-400">{allTasks.filter(t => t.status === 'completed').length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">In Progress</p>
            <p className="text-xl font-bold text-blue-400">{allTasks.filter(t => t.status === 'in_progress').length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-white/40 mb-1">Pending</p>
            <p className="text-xl font-bold text-amber-400">{allTasks.filter(t => t.status === 'pending').length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks or assignee..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5">
              <div className="mt-0.5 shrink-0">
                {t.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Clock className="h-5 w-5 text-white/20" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white truncate">{t.title}</p>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${priColor[t.priority]}`}>{t.priority}</Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statColor[t.status]}`}>
                    {t.status === 'in_progress' ? 'In Progress' : t.status === 'completed' ? 'Done' : 'Pending'}
                  </Badge>
                </div>
                {t.description && <p className="text-xs text-white/40 mb-1">{t.description}</p>}
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{t.assignedTo} ({staffRoleLabels[t.assignedRole]})</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Created: {new Date(t.createdAt).toLocaleDateString()}</span>
                  <span>Due: {t.dueDate}</span>
                  {t.completedAt && <span className="text-green-400/60">Completed: {new Date(t.completedAt).toLocaleDateString()}</span>}
                </div>
              </div>
              <span className="text-[11px] text-white/20 shrink-0">{t.id}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
