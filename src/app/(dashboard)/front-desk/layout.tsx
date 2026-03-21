import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function FrontDeskLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Front Desk Portal">{children}</PortalErrorBoundary>
}
