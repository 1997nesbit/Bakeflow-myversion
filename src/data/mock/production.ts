// ---- MOCK PRODUCTION / DAILY BATCH DATA ----
// TODO (Phase 2): Replace with productionService.getBatches() from @/lib/api/services/orders

import type { DailyBatchItem } from '@/types/production'

export const mockDailyBatches: DailyBatchItem[] = [
  { id: 'BATCH-001', productName: 'Sourdough Loaf', category: 'bread', quantityBaked: 40, quantityRemaining: 28, unit: 'loaves', bakedBy: 'Baker John', bakedAt: '2026-02-06T05:30:00', ovenTemp: '220C', notes: 'Morning run, oven #1' },
  { id: 'BATCH-002', productName: 'Baguette', category: 'bread', quantityBaked: 30, quantityRemaining: 22, unit: 'pcs', bakedBy: 'Baker John', bakedAt: '2026-02-06T05:45:00', ovenTemp: '230C' },
  { id: 'BATCH-003', productName: 'Croissant', category: 'pastry', quantityBaked: 50, quantityRemaining: 35, unit: 'pcs', bakedBy: 'Baker Sarah', bakedAt: '2026-02-06T06:00:00', ovenTemp: '190C', notes: 'Butter croissants, laminated dough' },
  { id: 'BATCH-004', productName: 'Danish Pastry', category: 'pastry', quantityBaked: 24, quantityRemaining: 18, unit: 'pcs', bakedBy: 'Baker Sarah', bakedAt: '2026-02-06T06:15:00', ovenTemp: '185C' },
  { id: 'BATCH-005', productName: 'Meat Pie', category: 'snack', quantityBaked: 40, quantityRemaining: 25, unit: 'pcs', bakedBy: 'Baker John', bakedAt: '2026-02-06T06:30:00', ovenTemp: '200C', notes: 'Beef filling' },
  { id: 'BATCH-006', productName: 'Sausage Roll', category: 'snack', quantityBaked: 50, quantityRemaining: 38, unit: 'pcs', bakedBy: 'Baker John', bakedAt: '2026-02-06T06:45:00', ovenTemp: '200C' },
  { id: 'BATCH-007', productName: 'Cinnamon Roll', category: 'pastry', quantityBaked: 20, quantityRemaining: 20, unit: 'pcs', bakedBy: 'Baker Sarah', bakedAt: '2026-02-06T07:00:00', ovenTemp: '180C', notes: 'Extra glaze' },
  { id: 'BATCH-008', productName: 'Whole Wheat Loaf', category: 'bread', quantityBaked: 25, quantityRemaining: 18, unit: 'loaves', bakedBy: 'Baker John', bakedAt: '2026-02-06T07:15:00', ovenTemp: '210C' },
]
