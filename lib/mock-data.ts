export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'baker'
  | 'decorator'
  | 'quality'
  | 'packing'
  | 'ready'
  | 'dispatched'
  | 'delivered'

export type OrderType = 'menu' | 'custom'
export type DeliveryType = 'pickup' | 'delivery'
export type PaymentStatus = 'unpaid' | 'deposit' | 'paid'

export interface MenuItem {
  id: string
  name: string
  category: 'cake' | 'bread' | 'pastry' | 'snack' | 'beverage'
  price: number
  estimatedMinutes: number
  description?: string
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'card'
export type PaymentTerms = 'upfront' | 'on_delivery'

export interface CustomCakeDetails {
  flavour: string
  icingType: string
  kilogram: number
  description?: string
  noteForCustomer?: string
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
  customization?: string
  customCake?: CustomCakeDetails
  isCustom: boolean
}

export interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderType: OrderType
  items: OrderItem[]
  status: OrderStatus
  specialNotes?: string
  cakeDescription?: string
  noteForCustomer?: string
  pickupDate: string
  pickupTime: string
  deliveryType: DeliveryType
  deliveryAddress?: string
  totalPrice: number
  amountPaid: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentTerms: PaymentTerms
  isAdvanceOrder: boolean
  estimatedMinutes: number
  createdAt: string
  postedToBakerAt?: string
  assignedTo?: string
  dispatchedAt?: string
  driverAccepted?: boolean
  driverDelivered?: boolean
  trackingId: string
  isGoldCustomer?: boolean
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email?: string
  products: string[]
}

export interface InventoryItem {
  id: string
  name: string
  category: 'ingredient' | 'packaging' | 'finished'
  quantity: number
  unit: string
  minStock: number
  costPerUnit: number
  lastRestocked: string
  supplierId?: string
}

export interface StockEntry {
  id: string
  inventoryItemId: string
  itemName: string
  quantity: number
  unit: string
  supplierName: string
  costPerUnit: number
  totalCost: number
  invoiceRef?: string
  date: string
  addedBy: string
}

export interface DailyRollout {
  id: string
  inventoryItemId: string
  itemName: string
  quantity: number
  unit: string
  purpose: string
  rolledOutBy: string
  date: string
  time: string
}

export type InventoryRole = 'manager' | 'inventory_clerk' | 'baker' | 'front_desk'

export interface InventoryUser {
  id: string
  name: string
  role: InventoryRole
  hasInventoryAccess: boolean
}

export interface Driver {
  id: string
  name: string
  phone: string
  status: 'available' | 'on-delivery' | 'offline'
}

// ---- BAKERY MENU ----
export const bakeryMenu: MenuItem[] = [
  { id: 'M-001', name: 'Chocolate Cake', category: 'cake', price: 45, estimatedMinutes: 90, description: 'Rich chocolate sponge with ganache' },
  { id: 'M-002', name: 'Vanilla Cake', category: 'cake', price: 40, estimatedMinutes: 80, description: 'Classic vanilla butter cake' },
  { id: 'M-003', name: 'Red Velvet Cake', category: 'cake', price: 50, estimatedMinutes: 90, description: 'Cream cheese frosted red velvet' },
  { id: 'M-004', name: 'Carrot Cake', category: 'cake', price: 42, estimatedMinutes: 85, description: 'Spiced carrot cake with cream cheese' },
  { id: 'M-005', name: 'Black Forest Cake', category: 'cake', price: 55, estimatedMinutes: 100, description: 'Cherry & chocolate layers' },
  { id: 'M-006', name: 'Cupcakes (Box of 12)', category: 'cake', price: 36, estimatedMinutes: 60, description: 'Assorted flavour cupcakes' },
  { id: 'M-007', name: 'Sourdough Loaf', category: 'bread', price: 8, estimatedMinutes: 45, description: 'Artisan sourdough bread' },
  { id: 'M-008', name: 'Baguette', category: 'bread', price: 5, estimatedMinutes: 35, description: 'Classic French baguette' },
  { id: 'M-009', name: 'Whole Wheat Loaf', category: 'bread', price: 7, estimatedMinutes: 40, description: 'Healthy whole wheat bread' },
  { id: 'M-010', name: 'Croissant', category: 'pastry', price: 4, estimatedMinutes: 30, description: 'Buttery flaky croissant' },
  { id: 'M-011', name: 'Danish Pastry', category: 'pastry', price: 5, estimatedMinutes: 35, description: 'Fruit-filled Danish' },
  { id: 'M-012', name: 'Cinnamon Roll', category: 'pastry', price: 4.5, estimatedMinutes: 40, description: 'Glazed cinnamon swirl' },
  { id: 'M-013', name: 'Meat Pie', category: 'snack', price: 6, estimatedMinutes: 45, description: 'Savoury beef pie' },
  { id: 'M-014', name: 'Sausage Roll', category: 'snack', price: 4, estimatedMinutes: 30, description: 'Flaky pastry sausage roll' },
  { id: 'M-015', name: 'Doughnut (Box of 6)', category: 'pastry', price: 18, estimatedMinutes: 40, description: 'Assorted glazed doughnuts' },
]

export const cakeFlavours = [
  'Vanilla', 'Chocolate', 'Red Velvet', 'Lemon', 'Strawberry', 'Carrot',
  'Marble', 'Coffee', 'Coconut', 'Banana', 'Orange', 'Pineapple',
]

export const icingTypes = [
  'Buttercream', 'Fondant', 'Cream Cheese', 'Whipped Cream', 'Ganache',
  'Royal Icing', 'Mirror Glaze', 'Naked (no icing)',
]

// ---- MOCK DATA ----
export const mockOrders: Order[] = [
  {
    id: 'ORD-001', trackingId: 'TRK-A1B2C3',
    customerName: 'Sarah Johnson', customerPhone: '+1 555-0123', customerEmail: 'sarah@email.com',
    orderType: 'custom', isGoldCustomer: true,
    items: [{ name: 'Custom Cake - Chocolate/Buttercream 2kg', quantity: 1, price: 75, isCustom: true, customCake: { flavour: 'Chocolate', icingType: 'Buttercream', kilogram: 2, description: 'Happy 30th Birthday Sarah!' } }],
    status: 'baker', cakeDescription: '2-tier round cake, chocolate drip on sides', noteForCustomer: 'Happy 30th Birthday Sarah!',
    specialNotes: 'Nut-free, extra chocolate frosting',
    pickupDate: '2026-02-06', pickupTime: '14:00', deliveryType: 'pickup',
    totalPrice: 75, amountPaid: 75, paymentStatus: 'paid', paymentMethod: 'mobile_money', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 120, createdAt: '2026-02-06T08:30:00', postedToBakerAt: '2026-02-06T08:35:00',
  },
  {
    id: 'ORD-002', trackingId: 'TRK-D4E5F6',
    customerName: 'Mike Chen', customerPhone: '+1 555-0456',
    orderType: 'menu',
    items: [{ name: 'Sourdough Loaf', quantity: 3, price: 8, isCustom: false }, { name: 'Baguette', quantity: 2, price: 5, isCustom: false }],
    status: 'packing',
    pickupDate: '2026-02-06', pickupTime: '16:00', deliveryType: 'delivery', deliveryAddress: '123 Main St, Apt 4B',
    totalPrice: 34, amountPaid: 34, paymentStatus: 'paid', paymentMethod: 'card', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 50, createdAt: '2026-02-06T07:15:00', postedToBakerAt: '2026-02-06T07:20:00',
  },
  {
    id: 'ORD-003', trackingId: 'TRK-G7H8I9',
    customerName: 'Emma Williams', customerPhone: '+1 555-0789', isGoldCustomer: true,
    orderType: 'custom',
    items: [{ name: 'Custom Cake - Vanilla/Fondant 5kg', quantity: 1, price: 350, isCustom: true, customCake: { flavour: 'Vanilla', icingType: 'Fondant', kilogram: 5, description: 'Wedding cake, white & gold theme, 50 servings' } }],
    status: 'decorator', cakeDescription: '3-tier white fondant with gold leaf accents, fresh flower topper', noteForCustomer: 'Congratulations Emma & James!',
    specialNotes: 'Fresh flowers on top, delivery at venue',
    pickupDate: '2026-02-08', pickupTime: '10:00', deliveryType: 'delivery', deliveryAddress: 'Grand Ballroom, 456 Oak Ave',
    totalPrice: 350, amountPaid: 175, paymentStatus: 'deposit', paymentMethod: 'bank_transfer', paymentTerms: 'upfront',
    isAdvanceOrder: true, estimatedMinutes: 180, createdAt: '2026-02-03T11:00:00', postedToBakerAt: '2026-02-06T06:00:00',
  },
  {
    id: 'ORD-004', trackingId: 'TRK-J1K2L3',
    customerName: 'David Brown', customerPhone: '+1 555-0321', isGoldCustomer: true,
    orderType: 'menu',
    items: [{ name: 'Croissant', quantity: 12, price: 4, isCustom: false }, { name: 'Danish Pastry', quantity: 6, price: 5, isCustom: false }],
    status: 'ready',
    pickupDate: '2026-02-06', pickupTime: '09:00', deliveryType: 'pickup',
    totalPrice: 78, amountPaid: 78, paymentStatus: 'paid', paymentMethod: 'cash', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 40, createdAt: '2026-02-06T06:30:00', postedToBakerAt: '2026-02-06T06:35:00',
  },
  {
    id: 'ORD-005', trackingId: 'TRK-M4N5O6',
    customerName: 'Lisa Anderson', customerPhone: '+1 555-0654',
    orderType: 'menu',
    items: [{ name: 'Cupcakes (Box of 12)', quantity: 2, price: 36, isCustom: false }],
    status: 'quality', specialNotes: 'Office party - variety of flavors',
    pickupDate: '2026-02-06', pickupTime: '11:00', deliveryType: 'pickup',
    totalPrice: 72, amountPaid: 72, paymentStatus: 'paid', paymentMethod: 'mobile_money', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 70, createdAt: '2026-02-06T07:00:00', postedToBakerAt: '2026-02-06T07:05:00',
  },
  {
    id: 'ORD-006', trackingId: 'TRK-P7Q8R9',
    customerName: 'James Wilson', customerPhone: '+1 555-0987',
    orderType: 'menu',
    items: [{ name: 'Whole Wheat Loaf', quantity: 2, price: 7, isCustom: false }, { name: 'Meat Pie', quantity: 4, price: 6, isCustom: false }],
    status: 'pending',
    pickupDate: '2026-02-06', pickupTime: '08:00', deliveryType: 'pickup',
    totalPrice: 38, amountPaid: 0, paymentStatus: 'unpaid', paymentTerms: 'on_delivery',
    isAdvanceOrder: false, estimatedMinutes: 50, createdAt: '2026-02-06T06:45:00',
  },
  {
    id: 'ORD-007', trackingId: 'TRK-S1T2U3',
    customerName: 'Grace Okonkwo', customerPhone: '+1 555-1234',
    orderType: 'custom',
    items: [{ name: 'Custom Cake - Strawberry/Cream Cheese 3kg', quantity: 1, price: 120, isCustom: true, customCake: { flavour: 'Strawberry', icingType: 'Cream Cheese', kilogram: 3, description: 'Baby shower cake, pink theme' } }],
    status: 'paid', cakeDescription: 'Round single tier, pink and white fondant, baby booties topper', noteForCustomer: 'Welcome Baby!',
    specialNotes: 'Needs to be ready by Saturday morning',
    pickupDate: '2026-02-08', pickupTime: '09:00', deliveryType: 'delivery', deliveryAddress: '789 Elm Street, House 12',
    totalPrice: 120, amountPaid: 60, paymentStatus: 'deposit', paymentMethod: 'mobile_money', paymentTerms: 'upfront',
    isAdvanceOrder: true, estimatedMinutes: 150, createdAt: '2026-02-04T10:00:00',
  },
  {
    id: 'ORD-008', trackingId: 'TRK-V4W5X6',
    customerName: 'Tom Richards', customerPhone: '+1 555-5678',
    orderType: 'menu',
    items: [{ name: 'Sausage Roll', quantity: 10, price: 4, isCustom: false }, { name: 'Meat Pie', quantity: 5, price: 6, isCustom: false }],
    status: 'ready',
    pickupDate: '2026-02-06', pickupTime: '12:00', deliveryType: 'delivery', deliveryAddress: '55 River Road, Office Block C',
    totalPrice: 70, amountPaid: 70, paymentStatus: 'paid', paymentMethod: 'cash', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 50, createdAt: '2026-02-06T08:00:00', postedToBakerAt: '2026-02-06T08:05:00',
  },
  {
    id: 'ORD-009', trackingId: 'TRK-Y7Z8A1',
    customerName: 'Angela Mbeki', customerPhone: '+1 555-2468',
    orderType: 'menu',
    items: [{ name: 'Croissant', quantity: 8, price: 4, isCustom: false }, { name: 'Sourdough Loaf', quantity: 2, price: 8, isCustom: false }],
    status: 'baker',
    pickupDate: '2026-02-06', pickupTime: '15:00', deliveryType: 'pickup',
    totalPrice: 48, amountPaid: 48, paymentStatus: 'paid', paymentMethod: 'cash', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 45, createdAt: '2026-02-06T09:30:00',
  },
  {
    id: 'ORD-010', trackingId: 'TRK-B2C3D4',
    customerName: 'Peter Kamau', customerPhone: '+1 555-1357', isGoldCustomer: true,
    orderType: 'custom',
    items: [{ name: 'Custom Cake - Lemon/Buttercream 2kg', quantity: 1, price: 85, isCustom: true, customCake: { flavour: 'Lemon', icingType: 'Buttercream', kilogram: 2, description: 'Anniversary cake, yellow and white' } }],
    status: 'baker', cakeDescription: 'Round 2-tier, lemon drizzle with white buttercream rosettes', noteForCustomer: 'Happy Anniversary!',
    specialNotes: 'Gluten-free flour requested',
    pickupDate: '2026-02-07', pickupTime: '10:00', deliveryType: 'delivery', deliveryAddress: '22 Garden Lane',
    totalPrice: 85, amountPaid: 85, paymentStatus: 'paid', paymentMethod: 'mobile_money', paymentTerms: 'upfront',
    isAdvanceOrder: true, estimatedMinutes: 100, createdAt: '2026-02-06T09:45:00',
  },
  {
    id: 'ORD-011', trackingId: 'TRK-E5F6G7',
    customerName: 'Fatima Osei', customerPhone: '+1 555-3690',
    orderType: 'menu',
    items: [{ name: 'Meat Pie', quantity: 6, price: 6, isCustom: false }, { name: 'Sausage Roll', quantity: 8, price: 4, isCustom: false }],
    status: 'baker',
    pickupDate: '2026-02-06', pickupTime: '13:00', deliveryType: 'pickup',
    totalPrice: 68, amountPaid: 68, paymentStatus: 'paid', paymentMethod: 'cash', paymentTerms: 'upfront',
    isAdvanceOrder: false, estimatedMinutes: 40, createdAt: '2026-02-06T10:00:00',
  },
]

export const mockInventory: InventoryItem[] = [
  { id: 'INV-001', name: 'All-Purpose Flour', category: 'ingredient', quantity: 45, unit: 'kg', minStock: 20, costPerUnit: 1.2, lastRestocked: '2026-02-01', supplierId: 'SUP-001' },
  { id: 'INV-002', name: 'Sugar', category: 'ingredient', quantity: 8, unit: 'kg', minStock: 15, costPerUnit: 0.9, lastRestocked: '2026-01-28', supplierId: 'SUP-002' },
  { id: 'INV-003', name: 'Butter', category: 'ingredient', quantity: 12, unit: 'kg', minStock: 10, costPerUnit: 4.5, lastRestocked: '2026-02-03', supplierId: 'SUP-003' },
  { id: 'INV-004', name: 'Eggs', category: 'ingredient', quantity: 120, unit: 'pcs', minStock: 100, costPerUnit: 0.15, lastRestocked: '2026-02-04', supplierId: 'SUP-003' },
  { id: 'INV-005', name: 'Yeast', category: 'ingredient', quantity: 3, unit: 'kg', minStock: 2, costPerUnit: 8.0, lastRestocked: '2026-02-02', supplierId: 'SUP-004' },
  { id: 'INV-006', name: 'Chocolate Chips', category: 'ingredient', quantity: 4, unit: 'kg', minStock: 5, costPerUnit: 6.0, lastRestocked: '2026-01-30', supplierId: 'SUP-004' },
  { id: 'INV-007', name: 'Vanilla Extract', category: 'ingredient', quantity: 2, unit: 'L', minStock: 1, costPerUnit: 12.0, lastRestocked: '2026-02-01', supplierId: 'SUP-004' },
  { id: 'INV-008', name: 'Cake Boxes - Small', category: 'packaging', quantity: 25, unit: 'pcs', minStock: 50, costPerUnit: 0.5, lastRestocked: '2026-01-25', supplierId: 'SUP-005' },
  { id: 'INV-009', name: 'Cake Boxes - Large', category: 'packaging', quantity: 40, unit: 'pcs', minStock: 30, costPerUnit: 0.8, lastRestocked: '2026-01-28', supplierId: 'SUP-005' },
  { id: 'INV-010', name: 'Bread Bags', category: 'packaging', quantity: 200, unit: 'pcs', minStock: 100, costPerUnit: 0.1, lastRestocked: '2026-02-02', supplierId: 'SUP-005' },
  { id: 'INV-011', name: 'Heavy Cream', category: 'ingredient', quantity: 6, unit: 'L', minStock: 8, costPerUnit: 3.5, lastRestocked: '2026-02-03', supplierId: 'SUP-003' },
  { id: 'INV-012', name: 'Fondant - White', category: 'ingredient', quantity: 5, unit: 'kg', minStock: 3, costPerUnit: 7.0, lastRestocked: '2026-01-30', supplierId: 'SUP-004' },
]

export const mockSuppliers: Supplier[] = [
  { id: 'SUP-001', name: 'Metro Flour Mills', phone: '+1 555-8001', email: 'orders@metroflour.com', products: ['All-Purpose Flour', 'Whole Wheat Flour'] },
  { id: 'SUP-002', name: 'Sweet Valley Sugar Co.', phone: '+1 555-8002', email: 'supply@sweetvalley.com', products: ['Sugar', 'Icing Sugar', 'Brown Sugar'] },
  { id: 'SUP-003', name: 'Green Pastures Dairy', phone: '+1 555-8003', email: 'hello@greenpastures.com', products: ['Butter', 'Heavy Cream', 'Eggs'] },
  { id: 'SUP-004', name: 'Baker\'s Best Supply', phone: '+1 555-8004', email: 'orders@bakersbest.com', products: ['Yeast', 'Chocolate Chips', 'Vanilla Extract', 'Fondant - White'] },
  { id: 'SUP-005', name: 'PackRight Solutions', phone: '+1 555-8005', email: 'sales@packright.com', products: ['Cake Boxes - Small', 'Cake Boxes - Large', 'Bread Bags'] },
]

export const mockStockEntries: StockEntry[] = [
  { id: 'SE-001', inventoryItemId: 'INV-001', itemName: 'All-Purpose Flour', quantity: 50, unit: 'kg', supplierName: 'Metro Flour Mills', costPerUnit: 1.2, totalCost: 60, invoiceRef: 'MF-2026-0234', date: '2026-02-01', addedBy: 'Admin' },
  { id: 'SE-002', inventoryItemId: 'INV-002', itemName: 'Sugar', quantity: 25, unit: 'kg', supplierName: 'Sweet Valley Sugar Co.', costPerUnit: 0.9, totalCost: 22.5, invoiceRef: 'SV-2026-0891', date: '2026-01-28', addedBy: 'Admin' },
  { id: 'SE-003', inventoryItemId: 'INV-003', itemName: 'Butter', quantity: 15, unit: 'kg', supplierName: 'Green Pastures Dairy', costPerUnit: 4.5, totalCost: 67.5, invoiceRef: 'GP-2026-0112', date: '2026-02-03', addedBy: 'Admin' },
  { id: 'SE-004', inventoryItemId: 'INV-004', itemName: 'Eggs', quantity: 200, unit: 'pcs', supplierName: 'Green Pastures Dairy', costPerUnit: 0.15, totalCost: 30, invoiceRef: 'GP-2026-0113', date: '2026-02-04', addedBy: 'Admin' },
  { id: 'SE-005', inventoryItemId: 'INV-008', itemName: 'Cake Boxes - Small', quantity: 100, unit: 'pcs', supplierName: 'PackRight Solutions', costPerUnit: 0.5, totalCost: 50, invoiceRef: 'PR-2026-0044', date: '2026-01-25', addedBy: 'Admin' },
  { id: 'SE-006', inventoryItemId: 'INV-006', itemName: 'Chocolate Chips', quantity: 10, unit: 'kg', supplierName: 'Baker\'s Best Supply', costPerUnit: 6.0, totalCost: 60, invoiceRef: 'BB-2026-0321', date: '2026-01-30', addedBy: 'Admin' },
]

export const mockDailyRollouts: DailyRollout[] = [
  { id: 'RO-001', inventoryItemId: 'INV-001', itemName: 'All-Purpose Flour', quantity: 8, unit: 'kg', purpose: 'Morning bread production', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:00' },
  { id: 'RO-002', inventoryItemId: 'INV-002', itemName: 'Sugar', quantity: 3, unit: 'kg', purpose: 'Cake and pastry batch', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:15' },
  { id: 'RO-003', inventoryItemId: 'INV-003', itemName: 'Butter', quantity: 2, unit: 'kg', purpose: 'Croissant & pastry dough', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:15' },
  { id: 'RO-004', inventoryItemId: 'INV-004', itemName: 'Eggs', quantity: 36, unit: 'pcs', purpose: 'Cake batter & bread', rolledOutBy: 'Baker John', date: '2026-02-06', time: '06:30' },
  { id: 'RO-005', inventoryItemId: 'INV-007', itemName: 'Vanilla Extract', quantity: 0.2, unit: 'L', purpose: 'Cake flavouring', rolledOutBy: 'Baker John', date: '2026-02-06', time: '07:00' },
]

export const mockInventoryUsers: InventoryUser[] = [
  { id: 'IU-001', name: 'Manager Admin', role: 'manager', hasInventoryAccess: true },
  { id: 'IU-002', name: 'Store Clerk Mary', role: 'inventory_clerk', hasInventoryAccess: true },
  { id: 'IU-003', name: 'Baker John', role: 'baker', hasInventoryAccess: true },
  { id: 'IU-004', name: 'Front Desk Sarah', role: 'front_desk', hasInventoryAccess: false },
]

export const mockDrivers: Driver[] = [
  { id: 'DRV-001', name: 'Tom Martinez', phone: '+1 555-1111', status: 'available' },
  { id: 'DRV-002', name: 'Amy Garcia', phone: '+1 555-2222', status: 'on-delivery' },
  { id: 'DRV-003', name: 'Chris Lee', phone: '+1 555-3333', status: 'available' },
]

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending Payment',
  paid: 'Paid - Ready to Post',
  baker: 'With Baker',
  decorator: 'Decorating',
  quality: 'Quality Check',
  packing: 'Packing',
  ready: 'Ready',
  dispatched: 'With Driver',
  delivered: 'Delivered / Picked Up',
}

export const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  baker: 'bg-orange-100 text-orange-800',
  decorator: 'bg-pink-100 text-pink-800',
  quality: 'bg-blue-100 text-blue-800',
  packing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-green-100 text-green-800',
  dispatched: 'bg-purple-100 text-purple-800',
  delivered: 'bg-gray-100 text-gray-800',
}

export const orderTypeLabels: Record<OrderType, string> = {
  menu: 'Menu Order',
  custom: 'Custom Order',
}

// ---- INVENTORY EXPENSES (stock-related only) ----
export type ExpenseCategory =
  | 'raw_materials'
  | 'packaging'
  | 'equipment'
  | 'storage'
  | 'delivery_logistics'
  | 'wastage'
  | 'miscellaneous'

export const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: 'raw_materials', label: 'Raw Materials & Ingredients' },
  { value: 'packaging', label: 'Packaging & Labels' },
  { value: 'equipment', label: 'Kitchen Equipment & Tools' },
  { value: 'storage', label: 'Storage & Refrigeration' },
  { value: 'delivery_logistics', label: 'Delivery & Logistics' },
  { value: 'wastage', label: 'Expired / Wasted Stock' },
  { value: 'miscellaneous', label: 'Miscellaneous Stock Expense' },
]

export interface Expense {
  id: string
  title: string
  category: ExpenseCategory
  amount: number
  date: string
  paidTo: string
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque'
  receiptRef?: string
  notes?: string
  recurring: boolean
  recurringPeriod?: 'weekly' | 'monthly' | 'yearly'
  addedBy: string
}

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

// Helper: days until order is due
export function daysUntilDue(pickupDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(pickupDate)
  due.setHours(0, 0, 0, 0)
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

// Helper: minutes elapsed since posted to baker
export function minutesSincePosted(postedAt: string): number {
  return Math.floor((Date.now() - new Date(postedAt).getTime()) / (1000 * 60))
}

// Helper: generate a unique tracking ID
export function generateTrackingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'TRK-'
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))
  return result
}

// Tracking stages for customer view
export const trackingStages = [
  { key: 'baking', label: 'Baking & QA', statuses: ['baker', 'quality'] as OrderStatus[] },
  { key: 'decorating', label: 'Decorating & Packing', statuses: ['decorator', 'packing'] as OrderStatus[] },
  { key: 'ready', label: 'Ready', statuses: ['ready'] as OrderStatus[] },
  { key: 'delivery', label: 'Delivery', statuses: ['dispatched', 'delivered'] as OrderStatus[] },
]

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  mobile_money: 'Mobile Money',
  card: 'Card',
}

// ---- DAILY BATCH PRODUCTION ----
export interface DailyBatchItem {
  id: string
  productName: string
  category: 'bread' | 'pastry' | 'snack' | 'cake'
  quantityBaked: number
  quantityRemaining: number
  unit: string
  bakedBy: string
  bakedAt: string
  ovenTemp?: string
  notes?: string
}

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

export type FulfillmentMethod = 'from_batch' | 'bake_fresh'
