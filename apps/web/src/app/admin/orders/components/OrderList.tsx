'use client'

import { Order } from '@clickpy/shared'
import { thousandsSeparator } from '@/utils/price'

interface OrderListProps {
  orders: Order[]
  onOrderClick: (order: Order) => void
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Preparando', color: 'bg-orange-100 text-orange-700' },
  ready: { label: 'Listo', color: 'bg-green-100 text-green-700' },
  delivered: { label: 'Entregado', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
}

const typeLabels: Record<string, string> = {
  delivery: 'Delivery',
  pickup: 'Retiro',
  dinein: 'Mesa',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-PY', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderList({ orders, onOrderClick }: OrderListProps) {
  return (
    <div className='bg-white rounded-xl border border-gray-100 overflow-hidden'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-gray-100 text-xs text-gray-400 uppercase'>
            <th className='text-left px-4 py-3 font-medium'>#</th>
            <th className='text-left px-4 py-3 font-medium'>Cliente</th>
            <th className='text-left px-4 py-3 font-medium'>Tipo</th>
            <th className='text-left px-4 py-3 font-medium'>Estado</th>
            <th className='text-left px-4 py-3 font-medium'>Items</th>
            <th className='text-right px-4 py-3 font-medium'>Total</th>
            <th className='text-right px-4 py-3 font-medium'>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = statusLabels[order.status] ?? statusLabels.pending
            return (
              <tr
                key={order.id}
                onClick={() => onOrderClick(order)}
                className='border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors'
              >
                <td className='px-4 py-3 font-bold text-sm text-gray-900'>
                  {order.order_number}
                </td>
                <td className='px-4 py-3 text-sm text-gray-700'>
                  {order.customer_name || order.table_number || '-'}
                </td>
                <td className='px-4 py-3 text-sm text-gray-500'>
                  {typeLabels[order.type] ?? order.type}
                </td>
                <td className='px-4 py-3'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className='px-4 py-3 text-sm text-gray-500'>
                  {order.items?.length ?? 0}
                </td>
                <td className='px-4 py-3 text-sm text-right font-medium text-gray-900'>
                  Gs. {thousandsSeparator(Number(order.total))}
                </td>
                <td className='px-4 py-3 text-xs text-right text-gray-400'>
                  {formatDate(order.created_at)}
                </td>
              </tr>
            )
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className='px-4 py-12 text-center text-sm text-gray-300'>
                Sin pedidos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
