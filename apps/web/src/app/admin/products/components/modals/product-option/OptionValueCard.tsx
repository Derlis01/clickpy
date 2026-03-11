import { OptionValue } from '@/types/AdminProduct'
import { Button, Input, Switch } from '@heroui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, X } from 'react-feather'
import { useState } from 'react'

interface ProductOptionValueProps {
  value: OptionValue
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<OptionValue>) => void
  onToggleExpand: (id: string) => void
}

const OptionValueCard: React.FC<ProductOptionValueProps> = ({ value, onRemove, onUpdate, onToggleExpand }) => {
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)

  return (
    <div className='border border-gray-200 rounded-lg'>
      <motion.div
        className='flex items-center gap-3 p-3 cursor-pointer'
        onClick={e => {
          const target = e.target as HTMLElement
          if (!target.closest('button')) {
            onToggleExpand(value.optionValueId)
          }
        }}
      >
        <motion.div
          className='p-1 rounded-full hover:bg-gray-100'
          animate={{ rotate: value.isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className='w-4 h-4' />
        </motion.div>
        <div className='flex-grow flex flex-col'>
          <span className='font-medium'>{value.name}</span>
          <span className='text-gray-500 text-sm'>Gs. {value.price.toLocaleString()}</span>
        </div>
        <Button isIconOnly className='bg-transparent min-w-8 w-8 h-8' onPress={() => onRemove(value.optionValueId)}>
          <X className='w-4 h-4' />
        </Button>
      </motion.div>

      <AnimatePresence>
        {value.isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='p-3 pt-0 space-y-2'>
              <Input
                value={value.name}
                label='Nombre'
                size='sm'
                variant='bordered'
                onClick={e => e.stopPropagation()}
                onChange={e => onUpdate(value.optionValueId, { name: e.target.value })}
              />
              <Input
                value={value.price.toString()}
                label='Precio'
                type='number'
                size='sm'
                variant='bordered'
                onClick={e => e.stopPropagation()}
                onChange={e => onUpdate(value.optionValueId, { price: Number(e.target.value) })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OptionValueCard
