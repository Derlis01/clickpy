import instance from '@/utils/axios'
import { Order } from '@/types/Checkout'

export const saveOrder = async (order: Order) => {
  try {
    const response = await instance.post('/public/post-customer-order', order)
    return response.status
  } catch (error: any) {
    return error.response.status
  }
}
