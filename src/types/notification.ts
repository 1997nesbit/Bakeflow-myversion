// ---- NOTIFICATION / MESSAGING TYPES ----

// m-6: All 13 backend TriggerEvent values are represented here
export type TriggerEvent =
  | 'order_created_pickup_paid'
  | 'order_created_pickup_deposit'
  | 'order_created_pickup_unpaid'
  | 'order_created_delivery_paid'
  | 'order_created_delivery_deposit'
  | 'order_created_delivery_unpaid'
  | 'order_ready_pickup'
  | 'order_ready_delivery'
  | 'order_dispatched'
  | 'order_delivered'
  | 'payment_received'
  | 'payment_reminder'
  | 'payment_overdue'

export interface MessageTemplate {
  id: string
  name: string
  content: string
  isActive: boolean
  isAutomated: boolean
  triggerEvent: TriggerEvent | ''
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  messageContent: string
  recipientsCount: number
  status: 'draft' | 'sent' | 'scheduled'
  sentAt?: string
  scheduledFor?: string
  createdAt: string
}

export interface CampaignCreatePayload {
  name: string
  messageContent: string
  recipients: string[]          // phone numbers
  scheduledFor?: string
}

export interface NotificationLog {
  id: string
  templateName: string
  campaignName: string
  recipient: string
  message: string
  sent: boolean
  error: string
  createdAt: string
}

// m-6: Labels for all 13 trigger events
export const TRIGGER_LABELS: Record<TriggerEvent, string> = {
  order_created_pickup_paid:      'Order Created (Pickup · Paid)',
  order_created_pickup_deposit:   'Order Created (Pickup · Deposit)',
  order_created_pickup_unpaid:    'Order Created (Pickup · Unpaid)',
  order_created_delivery_paid:    'Order Created (Delivery · Paid)',
  order_created_delivery_deposit: 'Order Created (Delivery · Deposit)',
  order_created_delivery_unpaid:  'Order Created (Delivery · Unpaid)',
  order_ready_pickup:             'Order Ready (Pickup)',
  order_ready_delivery:           'Order Ready (Delivery)',
  order_dispatched:               'Out for Delivery',
  order_delivered:                'Delivered',
  payment_received:               'Payment Received',
  payment_reminder:               'Payment Reminder',
  payment_overdue:                'Payment Overdue',
}

/** Variable placeholders supported in templates */
export const TEMPLATE_VARIABLES = [
  { key: '{{order_no}}',      label: 'Order Number' },
  { key: '{{customer_name}}', label: 'Customer Name' },
  { key: '{{link}}',          label: 'Tracking Link' },
  { key: '{{address}}',       label: 'Bakery Address' },
  { key: '{{closing_time}}',  label: 'Closing Time' },
  { key: '{{driver_name}}',   label: 'Driver Name' },
  { key: '{{eta_mins}}',      label: 'ETA (minutes)' },
  { key: '{{amount}}',        label: 'Payment Amount' },
  { key: '{{balance}}',       label: 'Remaining Balance' },
  { key: '{{total_price}}',   label: 'Total Price' },
  { key: '{{pickup_date}}',   label: 'Pickup Date' },
  { key: '{{pickup_time}}',   label: 'Pickup Time' },
  { key: '{{delivery_address}}', label: 'Delivery Address' },
]
