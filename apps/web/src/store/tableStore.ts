import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Table } from '@clickpy/shared'
import tableService from '@/services/tableService'

interface TableStoreModel {
  tables: Table[]
  isLoading: boolean

  fetchTables: () => Promise<void>
  generateTables: (count: number) => Promise<void>
  deleteTable: (id: string) => Promise<void>
  resetStore: () => void
}

const useTableStore = create<TableStoreModel>()(
  devtools(
    (set, get) => ({
      tables: [],
      isLoading: false,

      fetchTables: async () => {
        set({ isLoading: true })
        const response = await tableService.getTables()
        if (response.success) {
          set({ tables: response.tables })
        }
        set({ isLoading: false })
      },

      generateTables: async (count: number) => {
        const existing = get().tables
        const maxNumber = existing.reduce((max, t) => Math.max(max, t.number ?? 0), 0)

        const created: Table[] = []
        for (let i = 1; i <= count; i++) {
          const num = maxNumber + i
          const table = await tableService.createTable({ name: `Mesa ${num}`, number: num })
          if (table) created.push(table)
        }

        if (created.length > 0) {
          set(state => ({ tables: [...state.tables, ...created] }))
        }
      },

      deleteTable: async (id) => {
        await tableService.deleteTable(id)
        set(state => ({
          tables: state.tables.filter(t => t.id !== id)
        }))
      },

      resetStore: () => {
        set({ tables: [], isLoading: false })
      }
    }),
    { name: 'Table Store' }
  )
)

export default useTableStore
