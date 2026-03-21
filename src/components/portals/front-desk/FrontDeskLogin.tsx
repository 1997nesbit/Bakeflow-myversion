'use client'

import { ShoppingCart } from 'lucide-react'
import { PortalLoginForm } from '@/components/shared/PortalLoginForm'
import { FRONT_DESK_CREDENTIALS, AUTH_STORAGE_KEYS } from '@/config/demo-credentials'
import { BRAND } from '@/config/constants'

export function FrontDeskLogin() {
  return (
    <PortalLoginForm
      title="Front Desk"
      subtitle="Bbr Bakeflow Order Management"
      icon={<ShoppingCart className="h-10 w-10 text-white" />}
      gradient={`linear-gradient(135deg, ${BRAND.secondary}, ${BRAND.primary})`}
      credentials={FRONT_DESK_CREDENTIALS}
      storageKey={AUTH_STORAGE_KEYS.frontDesk}
      redirectPath="/front-desk"
    />
  )
}
