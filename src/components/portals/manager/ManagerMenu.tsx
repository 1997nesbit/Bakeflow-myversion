'use client'

import { ManagerSidebar } from '@/components/layout/app-sidebar'
import { MenuManagement } from '@/components/shared/MenuManagement'

export function ManagerMenu() {
  return <MenuManagement sidebar={<ManagerSidebar />} theme="dark" />
}
