'use client'

import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import useOrderStore from '@/store/orderStore'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'

export function useOrderSocket(branchId: string | null) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!branchId) return

    const socket = io(API_URL, {
      auth: {
        role: 'kitchen',
        branch_id: branchId,
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('kitchen:new_order', (data: any) => {
      // Fetch the full order to get all fields
      useOrderStore.getState().addOrder({
        id: data.order_id,
        branch_id: branchId,
        order_number: data.order_number ?? 0,
        customer_id: null,
        customer_phone: '',
        customer_name: data.customer_name ?? data.table_name ?? '',
        items: data.items ?? [],
        subtotal: 0,
        delivery_fee: 0,
        total: data.total ?? 0,
        currency: 'PYG',
        status: data.status ?? 'confirmed',
        type: data.type ?? data.source === 'table' ? 'dinein' : 'delivery',
        payment_method: '',
        payment_status: 'pending',
        notes: '',
        table_number: data.table_name ?? undefined,
        created_at: data.created_at ?? new Date().toISOString(),
        updated_at: data.created_at ?? new Date().toISOString(),
      })
    })

    socket.on('order:status_updated', (data: any) => {
      useOrderStore.getState().updateOrder(data.order_id, {
        status: data.status,
        updated_at: data.updated_at,
      })
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [branchId])
}
