'use client'

import { Truck } from 'lucide-react'
import { PortalLoginForm } from '@/components/shared/PortalLoginForm'
import { BRAND } from '@/config/constants'

export function DriverLogin() {
  return (
    <PortalLoginForm
      title="Driver Portal"
      subtitle="Bbr Bakeflow Delivery Management"
      icon={<Truck className="h-10 w-10 text-white" />}
      gradient={`linear-gradient(135deg, #1d4ed8, #2563eb)`}
      redirectPath="/driver"
      expectedRole="driver"
    />
  )
}
