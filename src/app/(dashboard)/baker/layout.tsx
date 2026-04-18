import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function BakerLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Baker Portal">{children}</PortalErrorBoundary>
}
