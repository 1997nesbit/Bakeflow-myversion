// ---- CATEGORY OPTION CONSTANTS ----
// Used to populate dropdowns in forms.

import type { ExpenseCategory } from '@/types/finance'
import type { BusinessExpenseCategory } from '@/types/finance'

export const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: 'raw_materials', label: 'Raw Materials & Ingredients' },
  { value: 'packaging', label: 'Packaging & Labels' },
  { value: 'equipment', label: 'Kitchen Equipment & Tools' },
  { value: 'storage', label: 'Storage & Refrigeration' },
  { value: 'delivery_logistics', label: 'Delivery & Logistics' },
  { value: 'wastage', label: 'Expired / Wasted Stock' },
  { value: 'miscellaneous', label: 'Miscellaneous Stock Expense' },
]

export const businessExpenseCategories: { value: BusinessExpenseCategory; label: string }[] = [
  { value: 'rent', label: 'Rent & Lease' },
  { value: 'salaries', label: 'Salaries & Wages' },
  { value: 'utilities', label: 'Utilities (Electric, Water, Gas)' },
  { value: 'marketing', label: 'Marketing & Advertising' },
  { value: 'licenses', label: 'Licenses & Permits' },
  { value: 'transport', label: 'Transport & Fuel' },
  { value: 'cleaning', label: 'Cleaning & Sanitation' },
  { value: 'misc', label: 'Miscellaneous' },
]
