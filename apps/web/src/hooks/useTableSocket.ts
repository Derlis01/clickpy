'use client'

import { useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import useTableSessionStore from '@/store/tableSessionStore'
import usePublicCart from '@/store/publicCart'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:3001'

/**
 * Singleton socket manager.
 * One connection per session. Handles all listeners and cart bridge internally.
 */
class TableSocketManager {
  private socket: Socket | null = null
  private currentSessionId: string | null = null
  private cartUnsub: (() => void) | null = null
  private prevProducts: any[] = []

  connect(sessionId: string, token: string, displayName: string) {
    // Already connected to this session — skip
    if (this.socket?.connected && this.currentSessionId === sessionId) return

    // Different session or stale connection — clean up first
    this.disconnect()

    this.currentSessionId = sessionId

    const socket = io(API_URL, {
      auth: {
        session_id: sessionId,
        session_token: token,
        display_name: displayName
      },
      transports: ['websocket', 'polling']
    })

    this.socket = socket

    socket.on('connect', () => {
      useTableSessionStore.getState().setConnected(true)
    })

    socket.on('disconnect', () => {
      useTableSessionStore.getState().setConnected(false)
    })

    socket.on('guest:presence', (data: any) => {
      useTableSessionStore.getState().setGuests(data.guests ?? [])
      if (data.countdown) {
        useTableSessionStore.getState().setCountdown({ active: true, ends_at: data.countdown.ends_at })
      }
    })

    socket.on('guest:joined', (data: any) => {
      const me = useTableSessionStore.getState().displayName
      useTableSessionStore.getState().addGuest(data.display_name, data.guest_id)
      if (data.display_name !== me) {
        toast(`${data.display_name} se unio a la mesa`)
      }
    })

    socket.on('guest:left', (data: any) => {
      useTableSessionStore.getState().removeGuest(data.display_name)
    })

    socket.on('cart:item_added', (data: any) => {
      const me = useTableSessionStore.getState().displayName
      if (data.guest_name !== me) {
        useTableSessionStore.getState().addGuestItem(data.guest_name, {
          product_name: data.product_name,
          quantity: data.quantity ?? 1,
          price: data.price ?? 0,
        })
        toast(`${data.guest_name} agrego ${data.product_name}`)
      }
    })

    socket.on('cart:item_removed', (data: any) => {
      const me = useTableSessionStore.getState().displayName
      if (data.guest_name !== me) {
        useTableSessionStore.getState().removeGuestItem(data.guest_name, data.product_name ?? '')
        toast(`${data.guest_name} quito un item`)
      }
    })

    socket.on('round:guest_ready', (data: any) => {
      const me = useTableSessionStore.getState().displayName
      if (data.guest_name !== me) {
        toast(`${data.guest_name} confirmo su pedido`)
      }
    })

    socket.on('round:guest_unready', (data: any) => {
      const me = useTableSessionStore.getState().displayName
      if (data.guest_name !== me) {
        toast(`${data.guest_name} cancelo`)
      }
    })

    socket.on('countdown:started', (data: any) => {
      useTableSessionStore.getState().setCountdown({ active: true, ends_at: data.ends_at })
    })

    socket.on('countdown:reset', () => {
      useTableSessionStore.getState().setCountdown({ active: false, ends_at: null })
    })

    socket.on('countdown:expired', () => {
      useTableSessionStore.getState().setCountdown({ active: false, ends_at: null })
    })

    socket.on('round:confirmed', (data: any) => {
      const store = useTableSessionStore.getState()
      store.setLastRoundResult({ round: data.round, order_id: data.order_id, items: data.items })
      store.setCountdown({ active: false, ends_at: null })
      store.setReady(false)
      store.clearCart()
      store.incrementRound()
      // Clear the public cart (actual products) and reset the cart bridge
      usePublicCart.getState().clearProducts()
      this.prevProducts = []
      toast.success('Pedido enviado a cocina')
    })

    socket.on('round:error', (data: any) => {
      toast.error(data.message || 'Error en la ronda')
    })

    socket.on('cart:error', (data: any) => {
      toast.error(data.message || 'Error en el carrito')
    })

    socket.on('session:closed', (data: any) => {
      toast.info(data.reason === 'all_paid' ? 'Todos pagaron. Mesa cerrada.' : 'Mesa cerrada')
    })

    // Cart bridge — subscribe to cart store, emit changes to socket
    this.setupCartBridge()
  }

  disconnect() {
    this.cartUnsub?.()
    this.cartUnsub = null
    this.prevProducts = []

    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    this.currentSessionId = null
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data)
  }

  private setupCartBridge() {
    this.prevProducts = [...(usePublicCart.getState().products ?? [])]

    this.cartUnsub = usePublicCart.subscribe((state) => {
      const current = state.products ?? []
      const prev = this.prevProducts

      // Detect addition
      if (current.length > prev.length) {
        const added = current[current.length - 1]
        if (added) {
          this.emit('cart:update', {
            action: 'add',
            product_id: added.id,
            product_name: added.productName,
            quantity: added.quantity,
            price: added.total
          })
        }
      }

      // Detect removal
      if (current.length < prev.length) {
        const removed = prev.find(
          p => !current.some(c => c.unicCartId === p.unicCartId)
        )
        if (removed) {
          this.emit('cart:update', {
            action: 'remove',
            product_id: removed.id,
            product_name: removed.productName
          })
        }
      }

      this.prevProducts = [...current]
    })
  }
}

// Single instance
const socketManager = new TableSocketManager()

/**
 * Hook — call from any component. Only the first mount triggers connection.
 * All instances share the same socket via the singleton manager.
 */
export function useTableSocket() {
  const sessionId = useTableSessionStore(state => state.sessionId)
  const token = useTableSessionStore(state => state.sessionToken)
  const displayName = useTableSessionStore(state => state.displayName)

  useEffect(() => {
    if (!sessionId || !token || !displayName) return

    socketManager.connect(sessionId, token, displayName)

    return () => {
      // Only disconnect if session was cleared (user left)
      const current = useTableSessionStore.getState().sessionId
      if (!current) {
        socketManager.disconnect()
      }
    }
  }, [sessionId, token, displayName])

  const emit = useCallback((event: string, data?: any) => {
    socketManager.emit(event, data)
  }, [])

  return { emit }
}
