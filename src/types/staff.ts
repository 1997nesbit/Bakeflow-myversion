// ---- STAFF TYPES ----

export type StaffRole =
  | 'manager'
  | 'front_desk'
  | 'baker'
  | 'decorator'
  | 'driver'
  | 'inventory_clerk'

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  phone: string
  email?: string
  status: 'active' | 'inactive'
  joinDate: string
  salary: number
}

export interface CreateStaffPayload extends Omit<StaffMember, 'id'> {
  password: string
}
