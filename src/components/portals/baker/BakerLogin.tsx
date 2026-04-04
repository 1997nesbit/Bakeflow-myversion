'use client'

import { ChefHat } from 'lucide-react'
import { PortalLoginForm } from '@/components/shared/PortalLoginForm'
import { BRAND } from '@/config/constants'

export function BakerLogin() {
  return (
    <PortalLoginForm
      title="Baker Portal"
      subtitle="Bbr Bakeflow Kitchen Access"
      icon={<ChefHat className="h-10 w-10 text-white" />}
      gradient={`linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})`}
      redirectPath="/baker"
      expectedRole="baker"
    />
  )
}
