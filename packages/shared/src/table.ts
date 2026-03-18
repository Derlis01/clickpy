export interface Table {
  id: string
  branch_id: string
  name: string
  number: number | null
  capacity: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type SessionStatus = 'active' | 'paying' | 'closed'
export type PaymentStatus = 'pending' | 'paid' | 'not_paid'

export interface TableSession {
  id: string
  table_id: string
  branch_id: string
  status: SessionStatus
  current_round: number
  opened_at: string
  closed_at: string | null
  total: number
}

export interface TableGuest {
  id: string
  session_id: string
  session_token: string
  display_name: string | null
  allergies: string | null
  is_virtual: boolean
  joined_at: string
  payment_status: PaymentStatus
  amount_due: number
  tip_amount: number
}

export interface TableOrderItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  status: 'confirmed' | 'preparing' | 'ready'
  selected_options: any[]
  selected_addons: any[]
  notes?: string
  guest_id?: string
  guest_name?: string
  guest_allergies?: string
}
