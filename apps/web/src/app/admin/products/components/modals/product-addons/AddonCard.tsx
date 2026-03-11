'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'react-feather'
import { Button } from '@heroui/react'

interface AddonCardProps {
  addon: {
    addonId: string
    name: string
    price: number
    isExpanded?: boolean
  }
  onRemove: (id: string) => void
  onToggleExpand: (id: string) => void
}

const AddonCard: React.FC<AddonCardProps> = ({ addon, onRemove, onToggleExpand }) => {
  return (
    <div className='border border-gray-200 rounded-lg overflow-hidden bg-white mb-2'>
      <motion.div
        initial={false}
        animate={{ backgroundColor: addon.isExpanded ? '#F9FAFB' : '#FFFFFF' }}
        className='p-4'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3 flex-1'>
            <Button
              onPress={() => onToggleExpand(addon.addonId)}
              className='p-1 hover:bg-gray-100 rounded-full transition-colors'
            >
              <motion.div
                initial={false}
                animate={{ rotate: addon.isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className='w-4 h-4 text-gray-500' />
              </motion.div>
            </Button>
            <span className='font-medium text-sm'>{addon.name}</span>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm text-gray-600'>Gs. {addon.price.toLocaleString()}</span>
            <Button
              onPress={() => onRemove(addon.addonId)}
              className='p-1 hover:bg-red-50 rounded-full transition-colors group'
            >
              <X className='w-4 h-4 text-gray-400 group-hover:text-red-500' />
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {addon.isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden px-8'
            >
              <div className='space-y-4 pb-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-gray-500'>Precio del adicional</span>
                  <span className='text-sm font-medium'>Gs. {addon.price.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default AddonCard
