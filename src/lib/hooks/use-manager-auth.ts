'use client'

import { useRoleAuth } from './use-role-auth'

export function useManagerAuth() {
  const { userName: managerName, logout } = useRoleAuth({
    expectedRole: 'manager',
    loginPath: '/manager/login',
    defaultName: 'Manager',
  })
  return { managerName, logout }
}
