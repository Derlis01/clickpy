import instance from '@/utils/axios'
import { Order } from '@clickpy/shared'

export interface OrderFilters {
  status?: string
  type?: string
  from?: string
  to?: string
}

const getOrders = async (filters?: OrderFilters): Promise<Order[]> => {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.type) params.set('type', filters.type)
    if (filters?.from) params.set('from', filters.from)
    if (filters?.to) params.set('to', filters.to)

    const response = await instance.get(`/orders?${params.toString()}`)
    return response.data.orders ?? []
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const response = await instance.get(`/orders/${id}`)
    return response.data.order ?? null
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

const updateOrderStatus = async (
  id: string,
  status: string,
  cancellationReason?: string
): Promise<Order | null> => {
  try {
    const response = await instance.patch(`/orders/${id}/status`, {
      status,
      cancellation_reason: cancellationReason,
    })
    return response.data.order ?? null
  } catch (error) {
    console.error('Error updating order status:', error)
    return null
  }
}

const orderService = { getOrders, getOrder, updateOrderStatus }
export default orderService
