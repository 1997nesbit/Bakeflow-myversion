'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Send, Truck, Package } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  const actions = [
    { name: 'New Order', icon: Plus, href: '/front-desk', color: 'bg-primary hover:bg-primary/90 text-primary-foreground' },
    { name: 'Send Campaign', icon: Send, href: '/messaging', color: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' },
    { name: 'View Deliveries', icon: Truck, href: '/drivers', color: 'bg-foreground hover:bg-foreground/90 text-background' },
    { name: 'Check Inventory', icon: Package, href: '/inventory', color: 'bg-muted hover:bg-muted/80 text-foreground' },
  ]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.name}
              asChild
              className={`h-auto flex-col gap-2 py-4 ${action.color}`}
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{action.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
