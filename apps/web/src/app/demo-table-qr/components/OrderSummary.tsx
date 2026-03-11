import { Card, CardBody, Chip } from '@heroui/react'

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  orderedBy: string
}

interface OrderSummaryProps {
  items: OrderItem[]
  formatPrice: (price: number) => string
}

export default function OrderSummary({ items, formatPrice }: OrderSummaryProps) {
  return (
    <div className='mx-7 mb-64'>
      <div className='mb-10'>
        <div className='space-y-2'>
          {items.map(item => (
            <div
              key={item.id}
              className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1'>
                  <Chip variant='flat' size='sm' className='text-xs flex-shrink-0'>
                    {item.quantity}x
                  </Chip>
                  <span className='text-xs sm:text-sm font-medium text-gray-900 truncate'>{item.name}</span>
                </div>
              </div>
              <span className='font-semibold text-gray-900 text-xs sm:text-sm ml-2 flex-shrink-0'>
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
