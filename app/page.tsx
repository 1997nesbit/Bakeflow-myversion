import { AppSidebar } from '@/components/app-sidebar'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { OrdersTable } from '@/components/dashboard/orders-table'
import { InventoryAlerts } from '@/components/dashboard/inventory-alerts'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { mockOrders, mockInventory } from '@/lib/mock-data'

export default function DashboardPage() {
  const todayOrders = mockOrders
  const pendingOrders = mockOrders.filter(
    (o) => !['ready', 'delivered'].includes(o.status)
  ).length
  const readyOrders = mockOrders.filter((o) => o.status === 'ready').length
  const lowStockItems = mockInventory.filter((i) => i.quantity < i.minStock).length

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is your bakery overview.</p>
        </div>

        <div className="space-y-6">
          <StatsCards
            totalOrders={todayOrders.length}
            pendingOrders={pendingOrders}
            readyOrders={readyOrders}
            lowStockItems={lowStockItems}
          />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <OrdersTable orders={todayOrders} />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <InventoryAlerts items={mockInventory} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
