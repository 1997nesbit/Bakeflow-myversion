import Link from 'next/link'
import { ChefHat, ShoppingCart, Package, Truck, ArrowRight, Clock, Shield, Settings, PackageSearch } from 'lucide-react'

const portals = [
  {
    id: 'front-desk',
    name: 'Front Desk',
    description: 'Orders, customer management, dispatch, messaging and dashboard',
    href: '/front-desk/login',
    icon: ShoppingCart,
    features: ['Create & manage orders', 'Dispatch to drivers', 'Customer messaging', 'Revenue dashboard'],
    ctaClass: 'bg-gradient-to-r from-primary to-secondary',
    iconBg: 'bg-primary',
  },
  {
    id: 'baker',
    name: 'Baker Portal',
    description: 'Baking queue, timers, quality assurance and decorator handoff',
    href: '/baker/login',
    icon: ChefHat,
    features: ['Accept incoming orders', 'Bake with live timers', 'Quality assurance checks', 'Post to decorator'],
    ctaClass: 'bg-gradient-to-r from-secondary to-secondary/70',
    iconBg: 'bg-secondary',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock tracking, supplier management, rollouts and low-stock alerts',
    href: '/inventory/login',
    icon: Package,
    features: ['Record stock purchases', 'Track daily rollouts', 'Low-stock alerts', 'Role-based access'],
    ctaClass: 'bg-gradient-to-r from-primary to-primary/80',
    iconBg: 'bg-primary',
  },
  {
    id: 'manager',
    name: 'Manager Portal',
    description: 'Full business oversight, staff, debts, reports and account management',
    href: '/manager/login',
    icon: Settings,
    features: ['Dashboard & reports', 'Staff & task management', 'Debt tracking', 'Bulk messaging'],
    ctaClass: 'bg-gradient-to-r from-manager-surface to-secondary',
    iconBg: 'bg-manager-surface',
  },
  {
    id: 'driver',
    name: 'Driver Portal',
    description: 'Delivery assignments, route navigation, proof of delivery and payment collection',
    href: '/driver/login',
    icon: Truck,
    features: ['View assigned deliveries', 'Navigate with Google Maps', 'Upload proof of delivery', 'Collect on-delivery payments'],
    ctaClass: 'bg-gradient-to-r from-blue-600 to-blue-500',
    iconBg: 'bg-blue-600',
  },
  {
    id: 'track',
    name: 'Customer Tracking',
    description: 'Track your order status in real-time, view pickup details and order progression.',
    href: '/track',
    icon: PackageSearch,
    features: ['Live timeline updates', 'Verify delivery instructions', 'No login required', 'Mobile friendly view'],
    ctaClass: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
    iconBg: 'bg-emerald-600',
  },
]

export function PortalSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f4] via-white to-[#fdf2f4]">
      {/* Header */}
      <header className="border-b border-primary/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Bbr Bakeflow</h1>
              <p className="text-xs text-primary">Bakery Workflow System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure Access</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">Select Portal</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Where are you headed?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Choose your workspace to get started. Each portal is tailored to your role in the bakery.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {portals.map((portal) => (
            <Link
              key={portal.id}
              href={portal.href}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex flex-1 flex-col p-6">
                {/* Icon + Title */}
                <div className="mb-4 flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${portal.iconBg} transition-transform duration-200 group-hover:scale-105`}>
                    <portal.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{portal.name}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{portal.description}</p>
                  </div>
                </div>

                {/* Feature list */}
                <ul className="mb-6 flex-1 space-y-1.5">
                  {portal.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground/70">
                      <span className="inline-block h-1 w-1 rounded-full bg-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`flex items-center justify-between rounded-lg ${portal.ctaClass} px-4 py-2.5 text-white`}>
                  <span className="text-sm font-medium">Open Portal</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-14 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Real-time updates across all portals</span>
          </div>
          <span className="text-primary/30">|</span>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>Role-based access control</span>
          </div>
        </div>
      </main>
    </div>
  )
}
