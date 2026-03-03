'use client'

import { useState } from 'react'
import { ManagerSidebar } from '@/components/manager/manager-sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockStaff, type StaffMember, type StaffRole, staffRoleLabels } from '@/lib/mock-data'
import { Users, Search, Plus, Phone, Mail, Calendar, Edit2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function UsersPage() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null)

  const [formName, setFormName] = useState('')
  const [formRole, setFormRole] = useState<StaffRole>('front_desk')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formSalary, setFormSalary] = useState('')

  const filtered = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
    const matchRole = filterRole === 'all' || s.role === filterRole
    return matchSearch && matchRole
  })

  const roleColor: Record<StaffRole, string> = {
    manager: 'bg-[#CA0123]/20 text-[#e66386]', front_desk: 'bg-blue-500/20 text-blue-300',
    baker: 'bg-orange-500/20 text-orange-300', decorator: 'bg-pink-500/20 text-pink-300',
    driver: 'bg-purple-500/20 text-purple-300', inventory_clerk: 'bg-green-500/20 text-green-300',
  }

  const handleAdd = () => {
    if (!formName || !formPhone) return
    const newStaff: StaffMember = {
      id: `STF-${String(staff.length + 1).padStart(3, '0')}`,
      name: formName, role: formRole, phone: formPhone, email: formEmail || undefined,
      status: 'active', joinDate: new Date().toISOString().split('T')[0], salary: Number(formSalary) || 0,
    }
    setStaff([...staff, newStaff])
    setShowAdd(false)
    setFormName(''); setFormPhone(''); setFormEmail(''); setFormSalary('')
  }

  const handleToggleStatus = (id: string) => {
    setStaff(staff.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
  }

  const handleEdit = () => {
    if (!editStaff) return
    setStaff(staff.map(s => s.id === editStaff.id ? editStaff : s))
    setEditStaff(null)
  }

  const activeCount = staff.filter(s => s.status === 'active').length
  const totalSalary = staff.filter(s => s.status === 'active').reduce((s, m) => s + m.salary, 0)

  return (
    <div className="min-h-screen bg-[#0f0709]">
      <ManagerSidebar />
      <main className="ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-sm text-white/40">{activeCount} active staff, TZS {totalSalary.toLocaleString()}/month payroll</p>
          </div>
          <Button onClick={() => setShowAdd(true)} className="bg-[#CA0123] hover:bg-[#a8011d] text-white">
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
                  <span>TZS {s.salary.toLocaleString()}/mo</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => setEditStaff(s)} className="p-2 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/70">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => handleToggleStatus(s.id)} className="p-2 rounded-lg text-white/30 hover:bg-white/5 hover:text-white/70">
                  {s.status === 'active' ? <ToggleRight className="h-4 w-4 text-green-400" /> : <ToggleLeft className="h-4 w-4 text-red-400" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Dialog */}
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogContent className="bg-[#1a0a0e] border-white/10 text-white">
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
              <Button onClick={handleAdd} className="w-full bg-[#CA0123] hover:bg-[#a8011d] text-white">Add Staff Member</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editStaff} onOpenChange={() => setEditStaff(null)}>
          <DialogContent className="bg-[#1a0a0e] border-white/10 text-white">
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
                <div><Label className="text-white/60">Salary (TZS)</Label><Input type="number" value={editStaff.salary} onChange={(e) => setEditStaff({ ...editStaff, salary: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white mt-1" /></div>
                <Button onClick={handleEdit} className="w-full bg-[#CA0123] hover:bg-[#a8011d] text-white">Save Changes</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
