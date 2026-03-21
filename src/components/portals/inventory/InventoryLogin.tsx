'use client'

import { Package } from 'lucide-react'
import { PortalLoginForm } from '@/components/shared/PortalLoginForm'
import { INVENTORY_CREDENTIALS, AUTH_STORAGE_KEYS } from '@/config/demo-credentials'
import { BRAND } from '@/config/constants'

export function InventoryLogin() {
  return (
    <PortalLoginForm
      title="Inventory Portal"
      subtitle="Bbr Bakeflow Stock Management"
      icon={<Package className="h-10 w-10 text-white" />}
      gradient={`linear-gradient(135deg, ${BRAND.secondary}, #d94a70)`}
      credentials={INVENTORY_CREDENTIALS}
      storageKey={AUTH_STORAGE_KEYS.inventory}
      redirectPath="/inventory"
      extraFields={['role']}
    />
  )
}
