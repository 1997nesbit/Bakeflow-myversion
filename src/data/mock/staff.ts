// ---- MOCK STAFF DATA ----
// TODO (Phase 6): Replace with staffService.getAll() from @/lib/api/services/staff

import type { StaffMember } from '@/types/staff'

export const mockStaff: StaffMember[] = [
  { id: 'STF-001', name: 'Admin Manager', role: 'manager', phone: '+255 755 000 001', email: 'admin@bbrbakeflow.co.tz', status: 'active', joinDate: '2024-01-15', salary: 800000 },
  { id: 'STF-002', name: 'Sarah Mwangi', role: 'front_desk', phone: '+255 713 002 200', email: 'sarah@bbrbakeflow.co.tz', status: 'active', joinDate: '2024-03-01', salary: 450000 },
  { id: 'STF-003', name: 'Baker John', role: 'baker', phone: '+255 784 003 300', status: 'active', joinDate: '2024-02-10', salary: 550000 },
  { id: 'STF-004', name: 'Baker Sarah', role: 'baker', phone: '+255 756 004 400', status: 'active', joinDate: '2024-06-01', salary: 550000 },
  { id: 'STF-005', name: 'Tom Martinez', role: 'driver', phone: '+255 716 005 500', status: 'active', joinDate: '2024-04-15', salary: 350000 },
  { id: 'STF-006', name: 'Amy Garcia', role: 'driver', phone: '+255 787 006 600', status: 'active', joinDate: '2024-05-20', salary: 350000 },
  { id: 'STF-007', name: 'Chris Lee', role: 'driver', phone: '+255 715 007 700', status: 'active', joinDate: '2025-01-10', salary: 350000 },
  { id: 'STF-008', name: 'Mary Kendi', role: 'inventory_clerk', phone: '+255 754 008 800', status: 'active', joinDate: '2024-07-01', salary: 400000 },
  { id: 'STF-009', name: 'Rose Otieno', role: 'decorator', phone: '+255 782 009 900', status: 'active', joinDate: '2024-08-15', salary: 500000 },
  { id: 'STF-010', name: 'James Nyamwanga', role: 'front_desk', phone: '+255 713 010 100', status: 'inactive', joinDate: '2024-03-01', salary: 450000 },
]
