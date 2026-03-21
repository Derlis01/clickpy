'use client'

import { Grid, List } from 'react-feather'
import useOrderStore from '@/store/orderStore'

const typeOptions = [
  { value: '', label: 'Todos' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Retiro' },
  { value: 'dinein', label: 'Mesa' },
]

export default function OrdersToolbar() {
  const { viewMode, setViewMode, filters, setFilters } = useOrderStore()

  return (
    <div className='flex items-center justify-between gap-3 flex-wrap'>
      <div className='flex items-center gap-2'>
        <select
          className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500'
          value={filters.type ?? ''}
          onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className='flex bg-gray-100 rounded-lg p-0.5'>
        <button
          onClick={() => setViewMode('kanban')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
        >
          <Grid size={16} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
        >
          <List size={16} />
        </button>
      </div>
    </div>
  )
}
