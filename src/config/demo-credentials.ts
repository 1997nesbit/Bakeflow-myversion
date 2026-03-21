// ---- DEMO CREDENTIALS ----
// Single source of truth for all mock login credentials.
// TODO (Phase 1): Delete this file entirely once real auth is wired up.
// All auth will then go through authService.login() in @/lib/api/services/auth

export interface DemoCredential {
  username: string
  password: string
  displayName: string
  role?: string
}

export const FRONT_DESK_CREDENTIALS: DemoCredential[] = [
  { username: 'sarah', password: 'desk123', displayName: 'Sarah (Front Desk)' },
  { username: 'mary',  password: 'desk123', displayName: 'Mary (Front Desk)' },
  { username: 'admin', password: 'admin123', displayName: 'Admin' },
]

export const BAKER_CREDENTIALS: DemoCredential[] = [
  { username: 'john',  password: 'bake123', displayName: 'Baker John' },
  { username: 'grace', password: 'bake123', displayName: 'Baker Grace' },
]

export const INVENTORY_CREDENTIALS: DemoCredential[] = [
  { username: 'manager', password: 'inv123', displayName: 'Manager Admin', role: 'manager' },
  { username: 'clerk',   password: 'inv123', displayName: 'Store Clerk Mary', role: 'clerk' },
]

export const MANAGER_CREDENTIALS: DemoCredential[] = [
  { username: 'manager', password: 'manager123', displayName: 'Admin Manager' },
]

/** localStorage key names per portal. Centralised to avoid key mismatches. */
export const AUTH_STORAGE_KEYS = {
  frontDesk: 'frontdesk_auth',
  baker:     'baker_auth',
  inventory: 'inventory_auth',
  manager:   'bbr_manager_auth',
} as const
