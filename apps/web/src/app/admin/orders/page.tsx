'use client'

import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@heroui/react'
import { useDisclosure } from '@heroui/react'
import useOrderStore from '@/store/orderStore'
import { useOrderSocket } from '@/hooks/useOrderSocket'
import { getMainBranchId } from '@/services/commerceService'
import { Order } from '@clickpy/shared'
import OrdersToolbar from './components/OrdersToolbar'
import OrderKanban from './components/OrderKanban'
import OrderList from './components/OrderList'
import OrderDetailModal from './components/OrderDetailModal'

function todayStart(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default function OrdersPage() {
  const { orders, viewMode, isLoading, fetchOrders, setSelectedOrder, selectedOrder } = useOrderStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [branchId, setBranchId] = useState<string | null>(null)

  // Get branchId for socket connection
  useEffect(() => {
    const id = getMainBranchId()
    if (id) setBranchId(id)
  }, [])

  // Real-time socket
  useOrderSocket(branchId)

  // Initial fetch — only today's orders
  useEffect(() => {
    fetchOrders({ from: todayStart() })
  }, [fetchOrders])

  // Kanban: hide delivered/cancelled older than 30 min
  const kanbanOrders = useMemo(() => {
    const cutoff = Date.now() - 30 * 60 * 1000
    return orders.filter((o) => {
      if (o.status === 'delivered' || o.status === 'cancelled') {
        return new Date(o.updated_at).getTime() > cutoff
      }
      return true
    })
  }, [orders])

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleClose = () => {
    setSelectedOrder(null)
    onClose()
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>Pedidos</h1>
          <p className='text-sm text-gray-400 mt-1'>Pedidos de hoy en tiempo real</p>
        </div>
      </div>

      <div className='mb-4'>
        <OrdersToolbar />
      </div>

      {isLoading && orders.length === 0 ? (
        <div className='flex items-center justify-center py-20'>
          <Spinner size='lg' />
        </div>
      ) : viewMode === 'kanban' ? (
        <OrderKanban orders={kanbanOrders} onOrderClick={handleOrderClick} />
      ) : (
        <OrderList orders={orders} onOrderClick={handleOrderClick} />
      )}

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </div>
  )
}
