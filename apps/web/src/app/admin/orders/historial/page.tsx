'use client'

import { useEffect, useState } from 'react'
import { Spinner, Button } from '@heroui/react'
import { useDisclosure } from '@heroui/react'
import { Order } from '@clickpy/shared'
import orderService, { OrderFilters } from '@/services/orderService'
import OrderList from '../components/OrderList'
import OrderDetailModal from '../components/OrderDetailModal'

function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Default: last 7 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return formatDateInput(d)
  })
  const [toDate, setToDate] = useState(() => formatDateInput(new Date()))
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const fetchHistory = async () => {
    setIsLoading(true)
    const filters: OrderFilters = {}
    if (fromDate) filters.from = new Date(fromDate).toISOString()
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      filters.to = to.toISOString()
    }
    if (statusFilter) filters.status = statusFilter
    if (typeFilter) filters.type = typeFilter

    const data = await orderService.getOrders(filters)
    setOrders(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleClose = () => {
    setSelectedOrder(null)
    onClose()
  }

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const completedOrders = orders.filter((o) => o.status === 'delivered').length
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='mb-6'>
        <h1 className='text-xl font-bold text-gray-900'>Historial de pedidos</h1>
        <p className='text-sm text-gray-400 mt-1'>Revisa pedidos anteriores</p>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border border-gray-100 p-4 mb-4'>
        <div className='flex items-end gap-3 flex-wrap'>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Desde</label>
            <input
              type='date'
              className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500'
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Hasta</label>
            <input
              type='date'
              className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500'
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Estado</label>
            <select
              className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value=''>Todos</option>
              <option value='delivered'>Entregado</option>
              <option value='cancelled'>Cancelado</option>
              <option value='pending'>Pendiente</option>
              <option value='confirmed'>Confirmado</option>
              <option value='preparing'>Preparando</option>
              <option value='ready'>Listo</option>
            </select>
          </div>
          <div>
            <label className='text-xs text-gray-400 block mb-1'>Tipo</label>
            <select
              className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500'
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value=''>Todos</option>
              <option value='delivery'>Delivery</option>
              <option value='pickup'>Retiro</option>
              <option value='dinein'>Mesa</option>
            </select>
          </div>
          <Button size='sm' color='primary' onPress={fetchHistory} isLoading={isLoading}>
            Buscar
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && orders.length > 0 && (
        <div className='grid grid-cols-3 gap-3 mb-4'>
          <div className='bg-white rounded-xl border border-gray-100 p-4 text-center'>
            <p className='text-2xl font-bold text-gray-900'>{orders.length}</p>
            <p className='text-xs text-gray-400 mt-1'>Pedidos</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-100 p-4 text-center'>
            <p className='text-2xl font-bold text-green-600'>{completedOrders}</p>
            <p className='text-xs text-gray-400 mt-1'>Entregados</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-100 p-4 text-center'>
            <p className='text-2xl font-bold text-red-500'>{cancelledOrders}</p>
            <p className='text-xs text-gray-400 mt-1'>Cancelados</p>
          </div>
        </div>
      )}

      {/* Orders list */}
      {isLoading ? (
        <div className='flex items-center justify-center py-20'>
          <Spinner size='lg' />
        </div>
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
