import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Driver Portal">{children}</PortalErrorBoundary>
}
