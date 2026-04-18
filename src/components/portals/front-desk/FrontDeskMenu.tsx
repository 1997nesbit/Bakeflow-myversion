'use client'

import { FrontDeskSidebar } from '@/components/layout/app-sidebar'
import { MenuManagement } from '@/components/shared/MenuManagement'

export function FrontDeskMenu() {
  return <MenuManagement sidebar={<FrontDeskSidebar />} theme="light" />
}
