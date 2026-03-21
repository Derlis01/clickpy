'use client'

import { useCallback } from 'react'
import { Order } from '@clickpy/shared'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import OrderCard from './OrderCard'
import useOrderStore from '@/store/orderStore'
import { toast } from 'sonner'

interface OrderKanbanProps {
  orders: Order[]
  onOrderClick: (order: Order) => void
}

const columns: { key: string; label: string; bg: string; dot: string; headerBg: string }[] = [
  { key: 'pending', label: 'Pendiente', bg: 'bg-yellow-50/60', dot: 'bg-yellow-400', headerBg: 'bg-yellow-100' },
  { key: 'confirmed', label: 'Confirmado', bg: 'bg-blue-50/60', dot: 'bg-blue-400', headerBg: 'bg-blue-100' },
  { key: 'preparing', label: 'Preparando', bg: 'bg-orange-50/60', dot: 'bg-orange-400', headerBg: 'bg-orange-100' },
  { key: 'ready', label: 'Listo', bg: 'bg-green-50/60', dot: 'bg-green-400', headerBg: 'bg-green-100' },
  { key: 'delivered', label: 'Entregado', bg: 'bg-gray-50/60', dot: 'bg-gray-400', headerBg: 'bg-gray-100' },
]

export default function OrderKanban({ orders, onOrderClick }: OrderKanbanProps) {
  const moveOrder = useOrderStore((s) => s.moveOrder)
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus)

  const ordersByColumn = columns.reduce<Record<string, Order[]>>((acc, col) => {
    acc[col.key] = orders.filter((o) => o.status === col.key)
    return acc
  }, {})

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result
      if (!destination) return

      const fromStatus = source.droppableId
      const toStatus = destination.droppableId

      // Same column, same position — nothing
      if (fromStatus === toStatus && source.index === destination.index) return

      // Same column reorder — just visual, no API
      if (fromStatus === toStatus) {
        moveOrder(draggableId, toStatus, destination.index)
        return
      }

      // Different column — optimistic move at exact drop position, then persist
      moveOrder(draggableId, toStatus, destination.index)
      const ok = await updateOrderStatus(draggableId, toStatus)
      if (!ok) {
        toast.error('Error al mover pedido')
      }
    },
    [moveOrder, updateOrderStatus]
  )

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className='flex gap-4 overflow-x-auto pb-4'>
        {columns.map((col) => {
          const colOrders = ordersByColumn[col.key] ?? []

          return (
            <div key={col.key} className='min-w-[260px] flex-1 rounded-xl overflow-hidden'>
              {/* Header */}
              <div className={`${col.headerBg} px-4 py-3 flex items-center gap-2`}>
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className='text-sm font-semibold text-gray-700'>{col.label}</span>
                <span className='text-xs text-gray-400 ml-auto bg-white/60 px-1.5 py-0.5 rounded-full'>
                  {colOrders.length}
                </span>
              </div>

              {/* Droppable column body */}
              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 space-y-3 min-h-[250px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary-50/40' : col.bg
                    }`}
                  >
                    {colOrders.map((order, index) => (
                      <Draggable key={order.id} draggableId={order.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <OrderCard
                              order={order}
                              onClick={onOrderClick}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {colOrders.length === 0 && !snapshot.isDraggingOver && (
                      <div className='text-center py-10'>
                        <p className='text-xs text-gray-300'>Sin pedidos</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
