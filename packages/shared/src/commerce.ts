export interface ScheduleHour {
  open: string
  close: string
}

export interface Schedule {
  day: number // 0=Sun, 1=Mon, ..., 6=Sat
  is_open: boolean
  hours: ScheduleHour[]
}

export interface PaymentMethodConfig {
  enabled: boolean
}

export interface DeliveryMethodConfig {
  enabled: boolean
  fee: number
}

export interface PaymentMethods {
  cash: PaymentMethodConfig
  qr: PaymentMethodConfig
  transfer: PaymentMethodConfig
  paymentLink: PaymentMethodConfig
}

export interface ShippingMethods {
  pickup: PaymentMethodConfig
  delivery: DeliveryMethodConfig
  dinein: PaymentMethodConfig
}

export interface Organization {
  id: string
  name: string
  slug: string
  phone: string
  logo: string
  banner: string
  primary_color: string
  category: string
  currency: string
  plan: 'free' | 'entrepreneur' | 'business' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  organization_id: string
  name: string
  slug: string | null
  address: string
  phone: string
  is_main: boolean
  last_order_number: number
  schedule: Schedule[]
  payment_methods: PaymentMethods
  shipping_methods: ShippingMethods
  ask_payment_method: boolean
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}
