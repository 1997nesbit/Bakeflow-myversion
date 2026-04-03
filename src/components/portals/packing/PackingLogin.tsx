'use client'

import { Package } from 'lucide-react'
import { PortalLoginForm } from '@/components/shared/PortalLoginForm'
import { BRAND } from '@/config/constants'

export function PackingLogin() {
  return (
    <PortalLoginForm
      title="Packing Portal"
      subtitle="Bakeflow Packing Station Access"
      icon={<Package className="h-10 w-10 text-white" />}
      gradient={`linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`}
      redirectPath="/packing"
    />
  )
}
