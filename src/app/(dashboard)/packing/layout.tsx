import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function PackingLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Packing Portal">{children}</PortalErrorBoundary>
}
