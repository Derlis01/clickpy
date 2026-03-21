import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface GuestCartItem {
  product_name: string
  quantity: number
  price: number
}

export interface GuestPresence {
  guest_id?: string
  display_name: string
  is_ready: boolean
  has_items: boolean
  is_connected: boolean
  items?: GuestCartItem[]
}

export interface CartItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  notes?: string
}

export interface CountdownState {
  active: boolean
  ends_at: string | null
}

interface TableSessionStoreModel {
  // Session
  sessionId: string | null
  sessionToken: string | null
  displayName: string | null
  tableId: string | null
  tableNumber: number | null

  // State
  guests: GuestPresence[]
  cart: CartItem[]
  isReady: boolean
  countdown: CountdownState
  currentRound: number
  isConnected: boolean
  lastRoundResult: { round: number; order_id: string | null; items: any[] } | null

  // Actions
  setSession: (sessionId: string, token: string, name: string, tableId: string, tableNumber?: number) => void
  setTableNumber: (num: number) => void
  setGuests: (guests: GuestPresence[]) => void
  addGuest: (name: string, guestId?: string) => void
  removeGuest: (name: string) => void
  setConnected: (connected: boolean) => void
  setReady: (ready: boolean) => void
  setCountdown: (countdown: CountdownState) => void
  setLastRoundResult: (result: { round: number; order_id: string | null; items: any[] } | null) => void
  incrementRound: () => void

  // Cart
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void

  // Guest items (from socket)
  addGuestItem: (guestName: string, item: GuestCartItem) => void
  removeGuestItem: (guestName: string, productName: string) => void

  // Reset
  reset: () => void
}

const STORAGE_KEY_PREFIX = 'mesa_session_'

function getStoredSession(tableId: string) {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tableId}`)
    if (!raw) return null
    return JSON.parse(raw) as { sessionId: string; token: string; name: string }
  } catch {
    return null
  }
}

function storeSession(tableId: string, sessionId: string, token: string, name: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${tableId}`, JSON.stringify({ sessionId, token, name }))
}

export { getStoredSession, storeSession }

const useTableSessionStore = create<TableSessionStoreModel>()(
  devtools(
    (set) => ({
      sessionId: null,
      sessionToken: null,
      displayName: null,
      tableId: null,
      tableNumber: null,
      guests: [],
      cart: [],
      isReady: false,
      countdown: { active: false, ends_at: null },
      currentRound: 1,
      isConnected: false,
      lastRoundResult: null,

      setSession: (sessionId, token, name, tableId, tableNumber) => {
        storeSession(tableId, sessionId, token, name)
        set({ sessionId, sessionToken: token, displayName: name, tableId, tableNumber: tableNumber ?? null })
      },

      setTableNumber: (num) => set({ tableNumber: num }),

      setGuests: (guests) => set({ guests }),

      addGuest: (name, guestId) =>
        set(state => {
          const exists = state.guests.some(g => g.guest_id === guestId || g.display_name === name)
          if (exists) return state
          return {
            guests: [...state.guests, { display_name: name, guest_id: guestId, is_ready: false, has_items: false, is_connected: true }]
          }
        }),

      removeGuest: (name) =>
        set(state => ({
          guests: state.guests.filter(g => g.display_name !== name)
        })),

      setConnected: (connected) => set({ isConnected: connected }),
      setReady: (ready) => set({ isReady: ready }),
      setCountdown: (countdown) => set({ countdown }),
      setLastRoundResult: (result) => set({ lastRoundResult: result }),
      incrementRound: () => set(state => ({ currentRound: state.currentRound + 1 })),

      addToCart: (item) =>
        set(state => {
          const existing = state.cart.find(c => c.product_id === item.product_id)
          if (existing) {
            return { cart: state.cart.map(c => c.product_id === item.product_id ? { ...c, quantity: c.quantity + item.quantity } : c) }
          }
          return { cart: [...state.cart, item] }
        }),

      removeFromCart: (productId) =>
        set(state => ({ cart: state.cart.filter(c => c.product_id !== productId) })),

      clearCart: () => set({ cart: [], isReady: false }),

      addGuestItem: (guestName, item) =>
        set(state => ({
          guests: state.guests.map(g => {
            if (g.display_name !== guestName) return g
            const existing = g.items ?? []
            return { ...g, items: [...existing, item], has_items: true }
          })
        })),

      removeGuestItem: (guestName, productName) =>
        set(state => ({
          guests: state.guests.map(g => {
            if (g.display_name !== guestName) return g
            const items = g.items ?? []
            const idx = items.findIndex(i => i.product_name === productName)
            if (idx === -1) return g
            const updated = [...items.slice(0, idx), ...items.slice(idx + 1)]
            return { ...g, items: updated, has_items: updated.length > 0 }
          })
        })),

      reset: () =>
        set({
          sessionId: null, sessionToken: null, displayName: null, tableId: null, tableNumber: null,
          guests: [], cart: [], isReady: false, countdown: { active: false, ends_at: null },
          currentRound: 1, isConnected: false, lastRoundResult: null
        })
    }),
    { name: 'Table Session Store' }
  )
)

export default useTableSessionStore
