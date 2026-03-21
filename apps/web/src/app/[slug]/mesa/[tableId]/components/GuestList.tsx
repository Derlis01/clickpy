'use client'

import { GuestPresence } from '@/store/tableSessionStore'
import { Check, Circle } from 'react-feather'

interface GuestListProps {
  guests: GuestPresence[]
  currentUser: string | null
}

export default function GuestList({ guests, currentUser }: GuestListProps) {
  if (guests.length === 0) {
    return <p className='text-gray-400 text-sm'>Esperando invitados...</p>
  }

  return (
    <div className='space-y-2'>
      {guests.map((guest, i) => (
        <div key={guest.guest_id ?? i} className='flex items-center justify-between py-2'>
          <div className='flex items-center gap-3'>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              guest.is_connected ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {guest.display_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className='text-gray-900 text-sm font-medium'>
                {guest.display_name}
                {guest.display_name === currentUser && (
                  <span className='text-gray-400 text-xs ml-1'>(tu)</span>
                )}
              </span>
              {!guest.is_connected && (
                <p className='text-gray-400 text-xs'>Desconectado</p>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {guest.has_items && (
              <span className='text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full'>
                tiene items
              </span>
            )}
            {guest.is_ready ? (
              <Check size={16} className='text-green-500' />
            ) : (
              <Circle size={16} className='text-gray-300' />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
