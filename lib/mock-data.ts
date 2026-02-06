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

export interface CustomCakeDetails {
  flavour: string
  icingType: string
  kilogram: number
  description?: string
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
  pickupDate: string
  pickupTime: string
  deliveryType: DeliveryType
  deliveryAddress?: string
  totalPrice: number
  amountPaid: number
  paymentStatus: PaymentStatus
  isAdvanceOrder: boolean
  estimatedMinutes: number
  createdAt: string
  postedToBakerAt?: string
  assignedTo?: string
}

export interface InventoryItem {
  id: string
  name: string
  category: 'ingredient' | 'packaging' | 'finished'
  quantity: number
  unit: string
  minStock: number
  lastRestocked: string
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
    id: 'ORD-001',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 555-0123',
    customerEmail: 'sarah@email.com',
    orderType: 'custom',
    items: [
      { name: 'Custom Cake - Chocolate/Buttercream 2kg', quantity: 1, price: 75, isCustom: true, customCake: { flavour: 'Chocolate', icingType: 'Buttercream', kilogram: 2, description: 'Happy 30th Birthday Sarah!' } }
    ],
    status: 'baker',
    specialNotes: 'Nut-free, extra chocolate frosting',
    pickupDate: '2026-02-06',
    pickupTime: '14:00',
    deliveryType: 'pickup',
    totalPrice: 75,
    amountPaid: 75,
    paymentStatus: 'paid',
    isAdvanceOrder: false,
    estimatedMinutes: 120,
    createdAt: '2026-02-06T08:30:00',
    postedToBakerAt: '2026-02-06T08:35:00',
  },
  {
    id: 'ORD-002',
    customerName: 'Mike Chen',
    customerPhone: '+1 555-0456',
    orderType: 'menu',
    items: [
      { name: 'Sourdough Loaf', quantity: 3, price: 8, isCustom: false },
      { name: 'Baguette', quantity: 2, price: 5, isCustom: false }
    ],
    status: 'packing',
    pickupDate: '2026-02-06',
    pickupTime: '16:00',
    deliveryType: 'delivery',
    deliveryAddress: '123 Main St, Apt 4B',
    totalPrice: 34,
    amountPaid: 34,
    paymentStatus: 'paid',
    isAdvanceOrder: false,
    estimatedMinutes: 50,
    createdAt: '2026-02-06T07:15:00',
    postedToBakerAt: '2026-02-06T07:20:00',
  },
  {
    id: 'ORD-003',
    customerName: 'Emma Williams',
    customerPhone: '+1 555-0789',
    orderType: 'custom',
    items: [
      { name: 'Custom Cake - Vanilla/Fondant 5kg', quantity: 1, price: 350, isCustom: true, customCake: { flavour: 'Vanilla', icingType: 'Fondant', kilogram: 5, description: 'Wedding cake, white & gold theme, 50 servings' } }
    ],
    status: 'decorator',
    specialNotes: 'Fresh flowers on top, delivery at venue',
    pickupDate: '2026-02-08',
    pickupTime: '10:00',
    deliveryType: 'delivery',
    deliveryAddress: 'Grand Ballroom, 456 Oak Ave',
    totalPrice: 350,
    amountPaid: 175,
    paymentStatus: 'deposit',
    isAdvanceOrder: true,
    estimatedMinutes: 180,
    createdAt: '2026-02-03T11:00:00',
    postedToBakerAt: '2026-02-06T06:00:00',
  },
  {
    id: 'ORD-004',
    customerName: 'David Brown',
    customerPhone: '+1 555-0321',
    orderType: 'menu',
    items: [
      { name: 'Croissant', quantity: 12, price: 4, isCustom: false },
      { name: 'Danish Pastry', quantity: 6, price: 5, isCustom: false }
    ],
    status: 'ready',
    pickupDate: '2026-02-06',
    pickupTime: '09:00',
    deliveryType: 'pickup',
    totalPrice: 78,
    amountPaid: 78,
    paymentStatus: 'paid',
    isAdvanceOrder: false,
    estimatedMinutes: 40,
    createdAt: '2026-02-06T06:30:00',
    postedToBakerAt: '2026-02-06T06:35:00',
  },
  {
    id: 'ORD-005',
    customerName: 'Lisa Anderson',
    customerPhone: '+1 555-0654',
    orderType: 'menu',
    items: [
      { name: 'Cupcakes (Box of 12)', quantity: 2, price: 36, isCustom: false }
    ],
    status: 'quality',
    specialNotes: 'Office party - variety of flavors',
    pickupDate: '2026-02-06',
    pickupTime: '11:00',
    deliveryType: 'pickup',
    totalPrice: 72,
    amountPaid: 72,
    paymentStatus: 'paid',
    isAdvanceOrder: false,
    estimatedMinutes: 70,
    createdAt: '2026-02-06T07:00:00',
    postedToBakerAt: '2026-02-06T07:05:00',
  },
  {
    id: 'ORD-006',
    customerName: 'James Wilson',
    customerPhone: '+1 555-0987',
    orderType: 'menu',
    items: [
      { name: 'Whole Wheat Loaf', quantity: 2, price: 7, isCustom: false },
      { name: 'Meat Pie', quantity: 4, price: 6, isCustom: false }
    ],
    status: 'pending',
    pickupDate: '2026-02-06',
    pickupTime: '08:00',
    deliveryType: 'pickup',
    totalPrice: 38,
    amountPaid: 0,
    paymentStatus: 'unpaid',
    isAdvanceOrder: false,
    estimatedMinutes: 50,
    createdAt: '2026-02-06T06:45:00',
  },
  {
    id: 'ORD-007',
    customerName: 'Grace Okonkwo',
    customerPhone: '+1 555-1234',
    orderType: 'custom',
    items: [
      { name: 'Custom Cake - Strawberry/Cream Cheese 3kg', quantity: 1, price: 120, isCustom: true, customCake: { flavour: 'Strawberry', icingType: 'Cream Cheese', kilogram: 3, description: 'Baby shower cake, pink theme' } }
    ],
    status: 'paid',
    specialNotes: 'Needs to be ready by Saturday morning',
    pickupDate: '2026-02-08',
    pickupTime: '09:00',
    deliveryType: 'delivery',
    deliveryAddress: '789 Elm Street, House 12',
    totalPrice: 120,
    amountPaid: 60,
    paymentStatus: 'deposit',
    isAdvanceOrder: true,
    estimatedMinutes: 150,
    createdAt: '2026-02-04T10:00:00',
  },
  {
    id: 'ORD-008',
    customerName: 'Tom Richards',
    customerPhone: '+1 555-5678',
    orderType: 'menu',
    items: [
      { name: 'Sausage Roll', quantity: 10, price: 4, isCustom: false },
      { name: 'Meat Pie', quantity: 5, price: 6, isCustom: false }
    ],
    status: 'ready',
    pickupDate: '2026-02-06',
    pickupTime: '12:00',
    deliveryType: 'delivery',
    deliveryAddress: '55 River Road, Office Block C',
    totalPrice: 70,
    amountPaid: 70,
    paymentStatus: 'paid',
    isAdvanceOrder: false,
    estimatedMinutes: 50,
    createdAt: '2026-02-06T08:00:00',
    postedToBakerAt: '2026-02-06T08:05:00',
  },
]

export const mockInventory: InventoryItem[] = [
  { id: 'INV-001', name: 'All-Purpose Flour', category: 'ingredient', quantity: 45, unit: 'kg', minStock: 20, lastRestocked: '2026-02-01' },
  { id: 'INV-002', name: 'Sugar', category: 'ingredient', quantity: 8, unit: 'kg', minStock: 15, lastRestocked: '2026-01-28' },
  { id: 'INV-003', name: 'Butter', category: 'ingredient', quantity: 12, unit: 'kg', minStock: 10, lastRestocked: '2026-02-03' },
  { id: 'INV-004', name: 'Eggs', category: 'ingredient', quantity: 120, unit: 'pcs', minStock: 100, lastRestocked: '2026-02-04' },
  { id: 'INV-005', name: 'Yeast', category: 'ingredient', quantity: 3, unit: 'kg', minStock: 2, lastRestocked: '2026-02-02' },
  { id: 'INV-006', name: 'Chocolate Chips', category: 'ingredient', quantity: 4, unit: 'kg', minStock: 5, lastRestocked: '2026-01-30' },
  { id: 'INV-007', name: 'Vanilla Extract', category: 'ingredient', quantity: 2, unit: 'L', minStock: 1, lastRestocked: '2026-02-01' },
  { id: 'INV-008', name: 'Cake Boxes - Small', category: 'packaging', quantity: 25, unit: 'pcs', minStock: 50, lastRestocked: '2026-01-25' },
  { id: 'INV-009', name: 'Cake Boxes - Large', category: 'packaging', quantity: 40, unit: 'pcs', minStock: 30, lastRestocked: '2026-01-28' },
  { id: 'INV-010', name: 'Bread Bags', category: 'packaging', quantity: 200, unit: 'pcs', minStock: 100, lastRestocked: '2026-02-02' },
  { id: 'INV-011', name: 'Heavy Cream', category: 'ingredient', quantity: 6, unit: 'L', minStock: 8, lastRestocked: '2026-02-03' },
  { id: 'INV-012', name: 'Fondant - White', category: 'ingredient', quantity: 5, unit: 'kg', minStock: 3, lastRestocked: '2026-01-30' },
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
