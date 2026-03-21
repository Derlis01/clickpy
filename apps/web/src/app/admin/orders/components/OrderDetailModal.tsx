'use client'

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { Order } from '@clickpy/shared'
import { thousandsSeparator } from '@/utils/price'
import useOrderStore from '@/store/orderStore'
import { toast } from 'sonner'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

const statusFlow: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered']

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

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)

  if (!order) return null

  const currentIdx = statusFlow.indexOf(order.status)
  const nextStatus = currentIdx >= 0 && currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null
  const status = statusLabels[order.status] ?? statusLabels.pending

  const handleAdvance = async () => {
    if (!nextStatus) return
    const ok = await updateOrderStatus(order.id, nextStatus)
    if (ok) {
      toast.success(`Pedido #${order.order_number} → ${statusLabels[nextStatus].label}`)
    } else {
      toast.error('Error al actualizar')
    }
  }

  const handleCancel = async () => {
    const ok = await updateOrderStatus(order.id, 'cancelled')
    if (ok) {
      toast.success(`Pedido #${order.order_number} cancelado`)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg' scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader className='flex items-center gap-3 pb-2'>
          <span className='font-bold text-xl'>Pedido #{order.order_number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
            {status.label}
          </span>
        </ModalHeader>

        <ModalBody className='space-y-4'>
          {/* Customer info */}
          <div className='space-y-1'>
            <p className='text-sm text-gray-700'>
              <span className='text-gray-400'>Cliente: </span>
              {order.customer_name || '-'}
            </p>
            {order.customer_phone && (
              <p className='text-sm text-gray-700'>
                <span className='text-gray-400'>Tel: </span>
                {order.customer_phone}
              </p>
            )}
            <p className='text-sm text-gray-700'>
              <span className='text-gray-400'>Tipo: </span>
              {typeLabels[order.type] ?? order.type}
              {order.table_number ? ` — ${order.table_number}` : ''}
            </p>
            {order.notes && (
              <p className='text-sm text-gray-700'>
                <span className='text-gray-400'>Notas: </span>
                {order.notes}
              </p>
            )}
          </div>

          {/* Items */}
          <div>
            <p className='text-xs text-gray-400 font-medium mb-2'>Items</p>
            <div className='space-y-2'>
              {order.items?.map((item: any, i: number) => (
                <div key={i} className='flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-400 font-medium'>{item.quantity}x</span>
                    <div>
                      <span className='text-sm text-gray-700'>{item.product_name}</span>
                      {item.guest_name && (
                        <span className='text-xs text-gray-400 ml-2'>({item.guest_name})</span>
                      )}
                    </div>
                  </div>
                  <span className='text-xs text-gray-500'>
                    Gs. {thousandsSeparator(Number(item.price) * Number(item.quantity))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
            <span className='text-sm text-gray-500'>Total</span>
            <span className='font-bold text-lg'>Gs. {thousandsSeparator(Number(order.total))}</span>
          </div>

          {/* Status timeline */}
          <div className='flex items-center gap-1 pt-2'>
            {statusFlow.map((s, i) => {
              const isActive = statusFlow.indexOf(order.status) >= i
              const sInfo = statusLabels[s]
              return (
                <div key={s} className='flex items-center gap-1 flex-1'>
                  <div className={`h-1.5 flex-1 rounded-full ${isActive ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  {i === statusFlow.length - 1 && (
                    <span className='text-[10px] text-gray-400 whitespace-nowrap'>{sInfo.label}</span>
                  )}
                </div>
              )
            })}
          </div>
        </ModalBody>

        <ModalFooter className='gap-2'>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Button size='sm' variant='flat' color='danger' onPress={handleCancel}>
              Cancelar pedido
            </Button>
          )}
          {nextStatus && (
            <Button
              size='sm'
              color='primary'
              onPress={handleAdvance}
            >
              Mover a {statusLabels[nextStatus].label}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
