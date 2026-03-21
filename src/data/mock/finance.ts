// ---- MOCK FINANCE DATA ----
// TODO (Phase 5): Replace with calls from @/lib/api/services/finance

import type { Expense, BusinessExpense, DebtRecord } from '@/types/finance'

export const mockExpenses: Expense[] = [
  { id: 'EXP-001', title: 'Bulk Flour Order - 50kg bags x10', category: 'raw_materials', amount: 420, date: '2026-02-01', paidTo: 'GrainCo Suppliers', paymentMethod: 'bank_transfer', receiptRef: 'GC-2026-0201', recurring: true, recurringPeriod: 'weekly', addedBy: 'Manager Admin' },
  { id: 'EXP-002', title: 'Butter & Margarine Restock', category: 'raw_materials', amount: 185, date: '2026-02-01', paidTo: 'Dairy Fresh Ltd', paymentMethod: 'bank_transfer', receiptRef: 'DF-2026-0201', recurring: true, recurringPeriod: 'weekly', addedBy: 'Manager Admin' },
  { id: 'EXP-003', title: 'Sugar - 25kg bags x5', category: 'raw_materials', amount: 95, date: '2026-02-02', paidTo: 'Sweetland Trading', paymentMethod: 'cash', receiptRef: 'SWT-0202', recurring: false, addedBy: 'Store Clerk Mary' },
  { id: 'EXP-004', title: 'Cake Boxes (100 units)', category: 'packaging', amount: 65, date: '2026-02-02', paidTo: 'PackRight Supplies', paymentMethod: 'mobile_money', receiptRef: 'PRS-0202', recurring: true, recurringPeriod: 'monthly', addedBy: 'Manager Admin' },
  { id: 'EXP-005', title: 'Branded Stickers & Labels (500 pcs)', category: 'packaging', amount: 40, date: '2026-02-03', paidTo: 'PrintShop Express', paymentMethod: 'mobile_money', recurring: false, addedBy: 'Store Clerk Mary' },
  { id: 'EXP-006', title: 'Oven Heating Element Replacement', category: 'equipment', amount: 350, date: '2026-02-03', paidTo: 'QuickFix Appliances', paymentMethod: 'cash', receiptRef: 'QFA-0203', notes: 'Replaced heating element in oven #2', recurring: false, addedBy: 'Manager Admin' },
  { id: 'EXP-007', title: 'New Baking Trays x12', category: 'equipment', amount: 110, date: '2026-02-04', paidTo: 'Baker Supply Store', paymentMethod: 'cash', notes: 'Heavy-duty aluminium trays', recurring: false, addedBy: 'Manager Admin' },
  { id: 'EXP-008', title: 'Walk-in Fridge Maintenance', category: 'storage', amount: 200, date: '2026-02-04', paidTo: 'CoolTech Services', paymentMethod: 'bank_transfer', receiptRef: 'CTS-0204', notes: 'Quarterly maintenance + gas top-up', recurring: true, recurringPeriod: 'monthly', addedBy: 'Manager Admin' },
  { id: 'EXP-009', title: 'Delivery Van Fuel - Week 5', category: 'delivery_logistics', amount: 120, date: '2026-02-04', paidTo: 'Shell Station', paymentMethod: 'cash', recurring: false, addedBy: 'Store Clerk Mary' },
  { id: 'EXP-010', title: 'Expired Eggs - 3 trays disposed', category: 'wastage', amount: 45, date: '2026-02-05', paidTo: 'N/A (Write-off)', paymentMethod: 'cash', notes: 'Batch expired before use, supplier delivery was late', recurring: false, addedBy: 'Manager Admin' },
  { id: 'EXP-011', title: 'Fondant & Food Colouring Restock', category: 'raw_materials', amount: 78, date: '2026-02-05', paidTo: 'Cake Craft Supplies', paymentMethod: 'mobile_money', receiptRef: 'CCS-0205', recurring: false, addedBy: 'Store Clerk Mary' },
  { id: 'EXP-012', title: 'Dry Yeast - 5kg bulk', category: 'raw_materials', amount: 55, date: '2026-02-06', paidTo: 'GrainCo Suppliers', paymentMethod: 'cash', receiptRef: 'GC-2026-0206', recurring: false, addedBy: 'Manager Admin' },
]

export const mockBusinessExpenses: BusinessExpense[] = [
  { id: 'BEX-001', title: 'Shop Rent - February', category: 'rent', amount: 1500000, date: '2026-02-01', paidTo: 'Greenfield Properties', paymentMethod: 'bank_transfer', receiptRef: 'GFP-0201', recurring: true },
  { id: 'BEX-002', title: 'Electricity - January', category: 'utilities', amount: 280000, date: '2026-01-31', paidTo: 'TANESCO', paymentMethod: 'mobile_money', receiptRef: 'TAN-0131', recurring: true },
  { id: 'BEX-003', title: 'Water - January', category: 'utilities', amount: 85000, date: '2026-01-31', paidTo: 'DAWASCO', paymentMethod: 'mobile_money', receiptRef: 'DAW-0131', recurring: true },
  { id: 'BEX-004', title: 'Staff Salaries - February', category: 'salaries', amount: 4750000, date: '2026-02-01', paidTo: 'All Staff', paymentMethod: 'bank_transfer', recurring: true },
  { id: 'BEX-005', title: 'Instagram Ad - Valentine Promo', category: 'marketing', amount: 150000, date: '2026-02-05', paidTo: 'Meta Ads', paymentMethod: 'card', recurring: false },
  { id: 'BEX-006', title: 'Health Inspection Renewal', category: 'licenses', amount: 200000, date: '2026-01-15', paidTo: 'City Health Dept', paymentMethod: 'bank_transfer', receiptRef: 'CHD-0115', recurring: true },
  { id: 'BEX-007', title: 'Deep Cleaning Service', category: 'cleaning', amount: 120000, date: '2026-02-02', paidTo: 'SparkClean Services', paymentMethod: 'mobile_money', recurring: true },
  { id: 'BEX-008', title: 'Delivery Van Insurance', category: 'transport', amount: 350000, date: '2026-01-10', paidTo: 'Jubilee Insurance', paymentMethod: 'bank_transfer', receiptRef: 'JUB-0110', recurring: true },
]

export const mockDebts: DebtRecord[] = [
  { id: 'DBT-001', customerName: 'James Wilson', customerPhone: '+255 782 098 700', orderId: 'ORD-006', totalAmount: 34000, amountPaid: 0, balance: 34000, dueDate: '2026-02-06', status: 'overdue', createdAt: '2026-02-06T06:45:00' },
  { id: 'DBT-002', customerName: 'Emma Williams', customerPhone: '+255 784 078 901', orderId: 'ORD-003', totalAmount: 350000, amountPaid: 175000, balance: 175000, dueDate: '2026-02-08', status: 'partial', createdAt: '2026-02-03T11:00:00' },
  { id: 'DBT-003', customerName: 'Grace Okonkwo', customerPhone: '+255 754 123 456', orderId: 'ORD-007', totalAmount: 120000, amountPaid: 60000, balance: 60000, dueDate: '2026-02-08', status: 'partial', createdAt: '2026-02-04T10:00:00' },
]
