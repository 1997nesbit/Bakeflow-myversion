'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  mockInventoryUsers,
  type InventoryUser,
  type InventoryRole,
} from '@/lib/mock-data'
import {
  Users,
  Shield,
  Plus,
  CheckCircle,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'

const roleLabels: Record<InventoryRole, string> = {
  manager: 'Manager',
  inventory_clerk: 'Inventory Clerk',
  baker: 'Baker',
  front_desk: 'Front Desk',
}

const roleColors: Record<InventoryRole, string> = {
  manager: 'bg-purple-100 text-purple-800',
  inventory_clerk: 'bg-blue-100 text-blue-800',
  baker: 'bg-orange-100 text-orange-800',
  front_desk: 'bg-pink-100 text-pink-800',
}

const rolePermissions: Record<InventoryRole, string[]> = {
  manager: ['View dashboard', 'Add stock', 'Record rollout', 'View alerts', 'Manage access', 'Edit items', 'View reports'],
  inventory_clerk: ['View dashboard', 'Add stock', 'Record rollout', 'View alerts'],
  baker: ['View dashboard', 'Record rollout'],
  front_desk: ['View dashboard (read-only)'],
}

export default function AccessPage() {
  const [users, setUsers] = useState<InventoryUser[]>(mockInventoryUsers)
  const [showAddUser, setShowAddUser] = useState(false)
  const [toast, setToast] = useState('')

  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<InventoryRole | ''>('')

  const handleToggleAccess = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        if (u.role === 'manager') return u
        return { ...u, hasInventoryAccess: !u.hasInventoryAccess }
      }
      return u
    }))
  }

  const handleAddUser = () => {
    if (!newName || !newRole) return

    const newUser: InventoryUser = {
      id: `IU-${String(users.length + 1).padStart(3, '0')}`,
      name: newName,
      role: newRole as InventoryRole,
      hasInventoryAccess: newRole === 'manager' ? true : true,
    }

    setUsers([...users, newUser])
    setShowAddUser(false)
    setNewName('')
    setNewRole('')
    setToast(`${newName} added with ${roleLabels[newRole as InventoryRole]} role`)
    setTimeout(() => setToast(''), 3000)
  }

  const handleChangeRole = (userId: string, newRole: InventoryRole) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, role: newRole, hasInventoryAccess: newRole === 'manager' ? true : u.hasInventoryAccess } : u
    ))
  }

  const accessCount = users.filter(u => u.hasInventoryAccess).length

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Access & Roles</h1>
              <p className="text-xs text-muted-foreground">Manage who can access inventory portal</p>
            </div>
            <Button
              onClick={() => setShowAddUser(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <UserPlus className="mr-1.5 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 grid-cols-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">With Access</p>
                    <p className="text-2xl font-bold text-foreground">{accessCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">No Access</p>
                    <p className="text-2xl font-bold text-foreground">{users.length - accessCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role permissions reference */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4.5 w-4.5 text-primary" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(rolePermissions) as InventoryRole[]).map(role => (
                  <div key={role} className="rounded-lg border border-border p-3">
                    <Badge className={`${roleColors[role]} border-0 mb-2`}>{roleLabels[role]}</Badge>
                    <ul className="space-y-1">
                      {rolePermissions[role].map(perm => (
                        <li key={perm} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users list */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <Badge className={`${roleColors[user.role]} border-0 text-xs mt-0.5`}>
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleChangeRole(user.id, v as InventoryRole)}
                      >
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="inventory_clerk">Inventory Clerk</SelectItem>
                          <SelectItem value="baker">Baker</SelectItem>
                          <SelectItem value="front_desk">Front Desk</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.hasInventoryAccess}
                          onCheckedChange={() => handleToggleAccess(user.id)}
                          disabled={user.role === 'manager'}
                        />
                        <span className={`text-xs font-medium ${user.hasInventoryAccess ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                          {user.hasInventoryAccess ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add user dialog */}
        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Add Team Member
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as InventoryRole)}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager (full access)</SelectItem>
                    <SelectItem value="inventory_clerk">Inventory Clerk</SelectItem>
                    <SelectItem value="baker">Baker (rollout only)</SelectItem>
                    <SelectItem value="front_desk">Front Desk (view only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRole && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">This role can:</p>
                  <ul className="space-y-1">
                    {rolePermissions[newRole as InventoryRole]?.map(perm => (
                      <li key={perm} className="text-xs text-foreground flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUser(false)} className="bg-transparent">Cancel</Button>
              <Button
                onClick={handleAddUser}
                disabled={!newName || !newRole}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}
      </main>
    </div>
  )
}
