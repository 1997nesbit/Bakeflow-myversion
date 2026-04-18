import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Inventory Portal">{children}</PortalErrorBoundary>
}
