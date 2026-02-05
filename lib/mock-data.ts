export type OrderStatus = 
  | 'pending'
  | 'baker'
  | 'decorator'
  | 'quality'
  | 'packing'
  | 'ready'
  | 'delivered'

export type OrderType = 'cake' | 'bread' | 'pastry' | 'custom'

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
  isDelivery: boolean
  deliveryAddress?: string
  totalPrice: number
  createdAt: string
  assignedTo?: string
}

export interface OrderItem {
  name: string
  quantity: number
  price: number
  customization?: string
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

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 555-0123',
    customerEmail: 'sarah@email.com',
    orderType: 'cake',
    items: [
      { name: 'Birthday Cake - Chocolate', quantity: 1, price: 75, customization: 'Happy 30th Birthday Sarah!' }
    ],
    status: 'baker',
    specialNotes: 'Nut-free, extra chocolate frosting',
    pickupDate: '2026-02-06',
    pickupTime: '14:00',
    isDelivery: false,
    totalPrice: 75,
    createdAt: '2026-02-05T08:30:00',
  },
  {
    id: 'ORD-002',
    customerName: 'Mike Chen',
    customerPhone: '+1 555-0456',
    orderType: 'bread',
    items: [
      { name: 'Sourdough Loaf', quantity: 3, price: 8 },
      { name: 'Baguette', quantity: 2, price: 5 }
    ],
    status: 'packing',
    pickupDate: '2026-02-05',
    pickupTime: '16:00',
    isDelivery: true,
    deliveryAddress: '123 Main St, Apt 4B',
    totalPrice: 34,
    createdAt: '2026-02-05T07:15:00',
  },
  {
    id: 'ORD-003',
    customerName: 'Emma Williams',
    customerPhone: '+1 555-0789',
    orderType: 'custom',
    items: [
      { name: 'Wedding Cake - 3 Tier', quantity: 1, price: 350, customization: 'White & gold theme, 50 servings' }
    ],
    status: 'decorator',
    specialNotes: 'Fresh flowers on top, delivery at venue',
    pickupDate: '2026-02-08',
    pickupTime: '10:00',
    isDelivery: true,
    deliveryAddress: 'Grand Ballroom, 456 Oak Ave',
    totalPrice: 350,
    createdAt: '2026-02-03T11:00:00',
  },
  {
    id: 'ORD-004',
    customerName: 'David Brown',
    customerPhone: '+1 555-0321',
    orderType: 'pastry',
    items: [
      { name: 'Croissant', quantity: 12, price: 4 },
      { name: 'Danish Pastry', quantity: 6, price: 5 }
    ],
    status: 'ready',
    pickupDate: '2026-02-05',
    pickupTime: '09:00',
    isDelivery: false,
    totalPrice: 78,
    createdAt: '2026-02-04T16:30:00',
  },
  {
    id: 'ORD-005',
    customerName: 'Lisa Anderson',
    customerPhone: '+1 555-0654',
    orderType: 'cake',
    items: [
      { name: 'Cupcakes - Assorted', quantity: 24, price: 3.5 }
    ],
    status: 'quality',
    specialNotes: 'Office party - variety of flavors',
    pickupDate: '2026-02-05',
    pickupTime: '11:00',
    isDelivery: false,
    totalPrice: 84,
    createdAt: '2026-02-04T14:00:00',
  },
  {
    id: 'ORD-006',
    customerName: 'James Wilson',
    customerPhone: '+1 555-0987',
    orderType: 'bread',
    items: [
      { name: 'Whole Wheat Loaf', quantity: 2, price: 7 },
      { name: 'Rye Bread', quantity: 1, price: 8 }
    ],
    status: 'pending',
    pickupDate: '2026-02-06',
    pickupTime: '08:00',
    isDelivery: false,
    totalPrice: 22,
    createdAt: '2026-02-05T09:45:00',
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
  { id: 'DRV-003', name: 'Chris Lee', phone: '+1 555-3333', status: 'offline' },
]

export const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  baker: 'With Baker',
  decorator: 'Decorating',
  quality: 'Quality Check',
  packing: 'Packing',
  ready: 'Ready',
  delivered: 'Delivered',
}

export const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  baker: 'bg-orange-100 text-orange-800',
  decorator: 'bg-pink-100 text-pink-800',
  quality: 'bg-blue-100 text-blue-800',
  packing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
}

export const orderTypeLabels: Record<OrderType, string> = {
  cake: 'Cake',
  bread: 'Bread',
  pastry: 'Pastry',
  custom: 'Custom',
}
