import { create } from 'zustand'
import { Order } from '@clickpy/shared'
import orderService, { OrderFilters } from '@/services/orderService'

type ViewMode = 'kanban' | 'list'

interface OrderStoreModel {
  orders: Order[]
  selectedOrder: Order | null
  viewMode: ViewMode
  filters: OrderFilters
  isLoading: boolean

  fetchOrders: (filters?: OrderFilters) => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setFilters: (filters: OrderFilters) => void
  setSelectedOrder: (order: Order | null) => void
  addOrder: (order: Order) => void
  updateOrder: (orderId: string, updates: Partial<Order>) => void
  moveOrder: (orderId: string, toStatus: string, toIndex: number) => void
  updateOrderStatus: (orderId: string, status: string, cancellationReason?: string) => Promise<boolean>
}

const useOrderStore = create<OrderStoreModel>()((set, get) => ({
  orders: [],
  selectedOrder: null,
  viewMode: 'kanban',
  filters: {},
  isLoading: false,

  fetchOrders: async (filters?: OrderFilters) => {
    set({ isLoading: true })
    const appliedFilters = filters ?? get().filters
    const orders = await orderService.getOrders(appliedFilters)
    set({ orders, isLoading: false, filters: appliedFilters })
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (filters) => {
    set({ filters })
    get().fetchOrders(filters)
  },

  setSelectedOrder: (order) => set({ selectedOrder: order }),

  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }))
  },

  updateOrder: (orderId, updates) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, ...updates } : o
      ),
      selectedOrder:
        state.selectedOrder?.id === orderId
          ? { ...state.selectedOrder, ...updates }
          : state.selectedOrder,
    }))
  },

  moveOrder: (orderId, toStatus, toIndex) => {
    const prev = get().orders
    const item = prev.find((o) => o.id === orderId)
    if (!item) return

    const without = prev.filter((o) => o.id !== orderId)
    const moved = { ...item, status: toStatus as Order['status'], updated_at: new Date().toISOString() }

    // Find where the target column's items start in the flat array
    const colItems = without.filter((o) => o.status === toStatus)
    let insertAt: number
    if (colItems.length === 0 || toIndex === 0) {
      // Empty column or first position — insert before first item of this status, or at end
      const firstIdx = without.findIndex((o) => o.status === toStatus)
      insertAt = firstIdx === -1 ? without.length : firstIdx
    } else {
      // Insert after the item currently at (toIndex - 1) in that column
      const refItem = colItems[Math.min(toIndex - 1, colItems.length - 1)]
      insertAt = without.indexOf(refItem) + 1
    }

    const result = [...without]
    result.splice(insertAt, 0, moved)
    set({ orders: result })
  },

  updateOrderStatus: async (orderId, status, cancellationReason) => {
    // Optimistic move already happened via moveOrder — just persist
    const prevOrders = get().orders

    const order = await orderService.updateOrderStatus(orderId, status, cancellationReason)
    if (!order) {
      set({ orders: prevOrders })
      return false
    }
    return true
  },
}))

export default useOrderStore
