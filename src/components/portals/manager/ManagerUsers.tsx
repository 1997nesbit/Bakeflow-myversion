'use client'

import { useState, useEffect } from 'react'
import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { StaffMember, StaffRole } from '@/types/staff'
import { staffService } from '@/lib/api/services/staff'
import { handleApiError } from '@/lib/utils/handle-error'
import { toast } from 'sonner'
import { staffRoleLabels } from '@/data/constants/labels'
import { Search, Plus, Phone, Mail, Calendar, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'

export function ManagerUsers() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null)

  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState<StaffRole>('front_desk')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formSalary, setFormSalary] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    staffService.getAll({ signal: controller.signal })
      .then(res => setStaff(res.results))
      .catch(handleApiError)
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
    const matchRole = filterRole === 'all' || s.role === filterRole
    return matchSearch && matchRole
  })

  const roleColor: Record<StaffRole, string> = {
    manager: 'bg-manager-accent/20 text-primary', front_desk: 'bg-blue-500/20 text-blue-300',
    baker: 'bg-orange-500/20 text-orange-300', decorator: 'bg-pink-500/20 text-pink-300',
    driver: 'bg-purple-500/20 text-purple-300', inventory_clerk: 'bg-green-500/20 text-green-300',
  }

  const handleAdd = async () => {
    if (!formName || !formPhone) return
    try {
      const created = await staffService.create({
        name: formName, role: formRole, phone: formPhone,
        email: formEmail || undefined, status: 'active',
        joinDate: new Date().toISOString().split('T')[0], salary: Number(formSalary) || 0,
      })
      setStaff(prev => [...prev, created])
      setShowAdd(false)
      setFormName(''); setFormPhone(''); setFormEmail(''); setFormSalary('')
      toast.success('Staff member added.')
    } catch (err) {
      handleApiError(err)
    }
  }

  const handleToggleStatus = async (id: string) => {
    const member = staff.find(s => s.id === id)
    if (!member) return
    const prev = staff
    const newStatus = member.status === 'active' ? 'inactive' : 'active'
    setStaff(staff.map(s => s.id === id ? { ...s, status: newStatus } : s))
    try {
      if (newStatus === 'inactive') {
        await staffService.deactivate(id)
      } else {
        await staffService.update(id, { status: 'active' })
      }
    } catch (err) {
      setStaff(prev)
      handleApiError(err)
    }
  }

  const handleEdit = async () => {
    if (!editStaff) return
    const prev = staff
    setStaff(staff.map(s => s.id === editStaff.id ? editStaff : s))
    setEditStaff(null)
    try {
      await staffService.update(editStaff.id, {
        name: editStaff.name, role: editStaff.role,
        phone: editStaff.phone, salary: editStaff.salary,
      })
      toast.success('Staff member updated.')
    } catch (err) {
      setStaff(prev)
      handleApiError(err)
    }
  }

  const activeCount = staff.filter(s => s.status === 'active').length
  const totalSalary = staff.filter(s => s.status === 'active').reduce((s, m) => s + (Number(m.salary) || 0), 0)

  return (
    <div className="min-h-screen bg-manager-bg">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-white/40">{activeCount} active staff, TZS {totalSalary.toLocaleString()}/month payroll</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-manager-accent hover:bg-manager-accent/85 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add Staff
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or phone..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {(Object.keys(staffRoleLabels) as StaffRole[]).map(r => (
                <SelectItem key={r} value={r}>{staffRoleLabels[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff grid */}
        {loading ? (
          <div className="text-center py-16 text-white/30 text-sm">Loading staff...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 shrink-0 text-sm font-bold text-white/60">
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${roleColor[s.role]}`}>{staffRoleLabels[s.role]}</Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${s.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {s.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>
                    {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/30 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {s.joinDate}</span>
                    <span>TZS {(Number(s.salary) || 0).toLocaleString()}/mo</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => setEditStaff(s)} className="p-2 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/70">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => void handleToggleStatus(s.id)} className="p-2 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/70">
                    {s.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-red-400" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="bg-manager-card border-white/10 text-white">
            <DialogHeader><DialogTitle>Add New Staff</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-white/60">Full Name</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div>
                <Label className="text-white/60">Role</Label>
                <Select value={formRole} onValueChange={(v) => setFormRole(v as StaffRole)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(staffRoleLabels) as StaffRole[]).map(r => <SelectItem key={r} value={r}>{staffRoleLabels[r]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60">Phone</Label><Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div><Label className="text-white/60">Email (optional)</Label><Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <div><Label className="text-white/60">Monthly Salary (TZS)</Label><Input type="number" value={formSalary} onChange={(e) => setFormSalary(e.target.value)} className="bg-white/5 border-white/10 text-white mt-1" /></div>
              <Button onClick={() => void handleAdd()} className="w-full bg-manager-accent hover:bg-manager-accent/85 text-white">Add Staff Member</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editStaff} onOpenChange={() => setEditStaff(null)}>
          <DialogContent className="bg-manager-card border-white/10 text-white">
            <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
            {editStaff && (
              <div className="space-y-3">
                <div><Label className="text-white/60">Full Name</Label><Input value={editStaff.name} onChange={(e) => setEditStaff({ ...editStaff, name: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" /></div>
                <div>
                  <Label className="text-white/60">Role</Label>
                  <Select value={editStaff.role} onValueChange={(v) => setEditStaff({ ...editStaff, role: v as StaffRole })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{(Object.keys(staffRoleLabels) as StaffRole[]).map(r => <SelectItem key={r} value={r}>{staffRoleLabels[r]}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-white/60">Phone</Label><Input value={editStaff.phone} onChange={(e) => setEditStaff({ ...editStaff, phone: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" /></div>
                <div><Label className="text-white/60">Salary (TZS)</Label><Input type="number" value={editStaff.salary || ''} onChange={(e) => setEditStaff({ ...editStaff, salary: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white mt-1" /></div>
                <Button onClick={() => void handleEdit()} className="w-full bg-manager-accent hover:bg-manager-accent/85 text-white">Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
