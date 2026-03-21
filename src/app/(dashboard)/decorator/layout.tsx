import React from 'react'
import { PortalErrorBoundary } from '@/components/shared/PortalErrorBoundary'

export default function DecoratorLayout({ children }: { children: React.ReactNode }) {
  return <PortalErrorBoundary portalName="Decorator Portal">{children}</PortalErrorBoundary>
}
