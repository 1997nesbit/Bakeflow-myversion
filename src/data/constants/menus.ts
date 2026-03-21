// ---- BAKERY MENU & PRODUCT CONSTANTS ----
// Static menu items used in order forms.
// TODO (Phase 4): Replace with GET /api/menu/ — these will be managed from the Django admin.

import type { MenuItem } from '@/types/order'

export const bakeryMenu: MenuItem[] = [
  { id: 'M-001', name: 'Chocolate Cake', category: 'cake', price: 45000, estimatedMinutes: 90, description: 'Rich chocolate sponge with ganache' },
  { id: 'M-002', name: 'Vanilla Cake', category: 'cake', price: 40000, estimatedMinutes: 80, description: 'Classic vanilla butter cake' },
  { id: 'M-003', name: 'Red Velvet Cake', category: 'cake', price: 50000, estimatedMinutes: 90, description: 'Cream cheese frosted red velvet' },
  { id: 'M-004', name: 'Carrot Cake', category: 'cake', price: 42000, estimatedMinutes: 85, description: 'Spiced carrot cake with cream cheese' },
  { id: 'M-005', name: 'Black Forest Cake', category: 'cake', price: 55000, estimatedMinutes: 100, description: 'Cherry & chocolate layers' },
  { id: 'M-006', name: 'Cupcakes (Box of 12)', category: 'cake', price: 36000, estimatedMinutes: 60, description: 'Assorted flavour cupcakes' },
  { id: 'M-007', name: 'Sourdough Loaf', category: 'bread', price: 8000, estimatedMinutes: 45, description: 'Artisan sourdough bread' },
  { id: 'M-008', name: 'Baguette', category: 'bread', price: 5000, estimatedMinutes: 35, description: 'Classic French baguette' },
  { id: 'M-009', name: 'Whole Wheat Loaf', category: 'bread', price: 7000, estimatedMinutes: 40, description: 'Healthy whole wheat bread' },
  { id: 'M-010', name: 'Croissant', category: 'pastry', price: 3500, estimatedMinutes: 30, description: 'Buttery flaky croissant' },
  { id: 'M-011', name: 'Danish Pastry', category: 'pastry', price: 4500, estimatedMinutes: 35, description: 'Fruit-filled Danish' },
  { id: 'M-012', name: 'Cinnamon Roll', category: 'pastry', price: 4000, estimatedMinutes: 40, description: 'Glazed cinnamon swirl' },
  { id: 'M-013', name: 'Meat Pie', category: 'snack', price: 5000, estimatedMinutes: 45, description: 'Savoury beef pie' },
  { id: 'M-014', name: 'Sausage Roll', category: 'snack', price: 3500, estimatedMinutes: 30, description: 'Flaky pastry sausage roll' },
  { id: 'M-015', name: 'Doughnut (Box of 6)', category: 'pastry', price: 15000, estimatedMinutes: 40, description: 'Assorted glazed doughnuts' },
]

export const cakeFlavours: string[] = [
  'Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Strawberry', 'Carrot',
  'Marble', 'Coffee', 'Coconut', 'Banana', 'Orange', 'Pineapple',
]

export const icingTypes: string[] = [
  'Buttercream', 'Fondant', 'Cream Cheese', 'Whipped Cream', 'Ganache',
  'Royal Icing', 'Mirror Glaze', 'Naked (no icing)',
]
