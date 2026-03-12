'use client'

import { useRoleAuth } from './use-role-auth'

export function useManagerAuth() {
  const { userName: managerName, logout } = useRoleAuth({
    storageKey: 'bbr_manager_auth',
    loginPath: '/manager/login',
    defaultName: 'Manager',
  })
  return { managerName, logout }
}
