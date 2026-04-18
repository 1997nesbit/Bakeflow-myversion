'use client'

import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Store,
  Bell,
  Printer,
  Users,
  Shield,
  Save,
} from 'lucide-react'

export function FrontDeskSettings() {
  return (
    <div className="min-h-screen bg-background">
      <FrontDeskSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your bakery system preferences
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Bakery Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Store className="h-5 w-5" />
                Bakery Information
              </CardTitle>
              <CardDescription>
                Update your bakery details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bakeryName">Bakery Name</Label>
                  <Input id="bakeryName" defaultValue="Bbr Bakeflow" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+1 555-0100" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue="123 Bakery Street, Sweet Town, ST 12345"
                  />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">New Order Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new order is placed
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when inventory falls below minimum
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Order Status Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when orders change production stages
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of bakery activity
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Printing */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Printer className="h-5 w-5" />
                Printing
              </CardTitle>
              <CardDescription>
                Configure receipt and label printing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto-print Receipts</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically print receipts for new orders
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Print Order Labels</p>
                  <p className="text-sm text-muted-foreground">
                    Print labels for production tracking
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage staff access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Admin User', role: 'Owner', email: 'admin@bbrbakeflow.com' },
                  { name: 'Sarah Baker', role: 'Baker', email: 'sarah@bbrbakeflow.com' },
                  { name: 'Mike Decorator', role: 'Decorator', email: 'mike@bbrbakeflow.com' },
                  { name: 'Front Desk', role: 'Staff', email: 'desk@bbrbakeflow.com' },
                ].map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="mt-4 bg-transparent">
                <Users className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
