export interface OrderItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  selected_options: any[]
  selected_addons: any[]
  notes?: string
  subtotal: number
}

export interface DeliveryAddress {
  street?: string
  city?: string
  notes?: string
  lat?: number
  lng?: number
}

export interface Order {
  id: string
  branch_id: string
  order_number: number
  customer_id: string | null
  customer_phone: string
  customer_name: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  currency: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  type: 'delivery' | 'pickup' | 'dinein'
  payment_method: string
  payment_status: 'pending' | 'paid'
  notes: string
  cancellation_reason?: string
  delivery_address?: DeliveryAddress
  table_number?: string
  estimated_time?: number
  created_at: string
  updated_at: string
}
