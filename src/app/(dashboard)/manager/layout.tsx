import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Manager Portal">{children}</PortalErrorBoundary>
}
