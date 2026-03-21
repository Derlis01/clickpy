'use client'

import { Order } from '@clickpy/shared'
import { thousandsSeparator } from '@/utils/price'
import { Clock, MapPin, Coffee, ShoppingBag as BagIcon } from 'react-feather'

interface OrderCardProps {
  order: Order
  onClick: (order: Order) => void
  isDragging?: boolean
}

const typeConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  delivery: { label: 'Delivery', color: 'bg-blue-100 text-blue-700', icon: MapPin },
  pickup: { label: 'Retiro', color: 'bg-purple-100 text-purple-700', icon: BagIcon },
  dinein: { label: 'Mesa', color: 'bg-amber-100 text-amber-700', icon: Coffee },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function OrderCard({ order, onClick, isDragging }: OrderCardProps) {
  const type = typeConfig[order.type] ?? typeConfig.delivery
  const TypeIcon = type.icon
  const itemCount = order.items?.length ?? 0

  return (
    <div
      onClick={() => onClick(order)}
      className={`bg-white rounded-xl p-4 cursor-pointer shadow-sm border border-gray-100/80 transition-shadow ${
        isDragging ? 'shadow-xl ring-2 ring-primary-200 rotate-[2deg]' : 'hover:shadow-md'
      }`}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <span className='font-bold text-lg text-gray-900'>#{order.order_number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${type.color}`}>
            <TypeIcon size={10} />
            {type.label}
          </span>
        </div>
        <span className='text-xs text-gray-400 flex items-center gap-1'>
          <Clock size={10} />
          {timeAgo(order.created_at)}
        </span>
      </div>

      <p className='text-sm text-gray-700 font-medium truncate'>
        {order.customer_name || order.table_number || 'Sin nombre'}
      </p>

      <div className='flex items-center justify-between mt-3'>
        <span className='text-xs text-gray-400'>
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
        <span className='font-semibold text-sm text-gray-900'>
          Gs. {thousandsSeparator(Number(order.total))}
        </span>
      </div>
    </div>
  )
}
