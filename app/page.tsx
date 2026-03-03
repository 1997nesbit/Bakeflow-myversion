'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChefHat, ShoppingCart, Package, ArrowRight, Clock, Shield } from 'lucide-react'

const portals = [
  {
    id: 'front-desk',
    name: 'Front Desk',
    description: 'Orders, customer management, dispatch, messaging and dashboard',
    href: '/front-desk',
    icon: ShoppingCart,
    features: ['Create & manage orders', 'Dispatch to drivers', 'Customer messaging', 'Revenue dashboard'],
    gradient: 'from-[#e66386] to-[#CA0123]',
    iconBg: 'bg-[#e66386]',
    shadowColor: 'shadow-[#e66386]/20',
    borderHover: 'hover:border-[#e66386]/40',
  },
  {
    id: 'baker',
    name: 'Baker Portal',
    description: 'Baking queue, timers, quality assurance and decorator handoff',
    href: '/portal/baker',
    icon: ChefHat,
    features: ['Accept incoming orders', 'Bake with live timers', 'Quality assurance checks', 'Post to decorator'],
    gradient: 'from-[#CA0123] to-[#8a0118]',
    iconBg: 'bg-[#CA0123]',
    shadowColor: 'shadow-[#CA0123]/20',
    borderHover: 'hover:border-[#CA0123]/40',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock tracking, supplier management, rollouts and low-stock alerts',
    href: '/inventory',
    icon: Package,
    features: ['Record stock purchases', 'Track daily rollouts', 'Low-stock alerts', 'Role-based access'],
    gradient: 'from-[#e66386] to-[#d94a70]',
    iconBg: 'bg-[#e66386]',
    shadowColor: 'shadow-[#e66386]/20',
    borderHover: 'hover:border-[#e66386]/40',
  },
]

export default function PortalSelector() {
  const [hoveredPortal, setHoveredPortal] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f4] via-white to-[#fdf2f4]">
      {/* Header */}
      <header className="border-b border-[#e66386]/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#e66386] to-[#CA0123]">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1a0a0e]">Bbr Bakeflow</h1>
              <p className="text-xs text-[#e66386]">Bakery Workflow System</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#7a5a62]">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure Access</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#e66386]">Select Portal</p>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a0a0e]">Where are you headed?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#7a5a62]">
            Choose your workspace to get started. Each portal is tailored to your role in the bakery.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {portals.map((portal) => {
            const isHovered = hoveredPortal === portal.id
            return (
              <Link
                key={portal.id}
                href={portal.href}
                onMouseEnter={() => setHoveredPortal(portal.id)}
                onMouseLeave={() => setHoveredPortal(null)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[#e66386]/10 bg-white transition-all duration-300 ${portal.borderHover} ${portal.shadowColor} ${isHovered ? 'shadow-xl -translate-y-1' : 'shadow-sm'}`}
              >
                {/* Top gradient strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${portal.gradient}`} />

                <div className="flex flex-1 flex-col p-6">
                  {/* Icon + Title */}
                  <div className="mb-4 flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${portal.iconBg} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}>
                      <portal.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a0a0e]">{portal.name}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#7a5a62]">{portal.description}</p>
                    </div>
                  </div>

                  {/* Feature list */}
                  <ul className="mb-6 flex-1 space-y-2">
                    {portal.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[#4a3a3e]">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r ${portal.gradient}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`flex items-center justify-between rounded-xl bg-gradient-to-r ${portal.gradient} px-4 py-3 text-white transition-all duration-300 ${isHovered ? 'shadow-lg' : ''}`}>
                    <span className="text-sm font-semibold">Open Portal</span>
                    <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="mt-14 flex items-center justify-center gap-6 text-xs text-[#7a5a62]">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#e66386]" />
            <span>Real-time updates across all portals</span>
          </div>
          <span className="text-[#e66386]/30">|</span>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#e66386]" />
            <span>Role-based access control</span>
          </div>
        </div>
      </main>
    </div>
  )
}
