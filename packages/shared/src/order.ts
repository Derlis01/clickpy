export interface OrderProduct {
  price: number
  imageUrl: string
  sk: string
  description: string
  pk: string
  category: string
  productName: string
  quantity: number
  total: number
  unicCartId: number
}

export interface Order {
  commercePk: string
  customerPhone: string
  customerName: string
  customerEmail?: string
  products: OrderProduct[]
  orderTimestamp: number
  subtotal: number
  total: number
  currency: string
  orderStatus: string
  orderType: string
  paymentMethod: string
  orderDate: string
  createdAt: string
  updatedAt: string
}
