import { Switch, Input, Divider } from "@heroui/react"
import { useState, useEffect } from 'react'
import { AdminProduct } from '@/types/AdminProduct'

interface AddonLimitsSectionProps {
  product: AdminProduct
  onUpdate: (updates: Partial<AdminProduct>) => void
}

export const AddonLimitsSection = ({ product, onUpdate }: AddonLimitsSectionProps) => {
  // Estado local para controlar el switch y los valores de los inputs
  const [isEnabled, setIsEnabled] = useState(product.hasAddonLimits || false)
  const [minValue, setMinValue] = useState(product.minAddons || 0)
  const [maxValue, setMaxValue] = useState(product.maxAddons || 0)

  // useEffect para sincronizar el estado local con las props del producto
  useEffect(() => {
    setIsEnabled(product.hasAddonLimits || false)
    setMinValue(product.minAddons || 0)
    setMaxValue(product.maxAddons || 0)
  }, [product])

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked)
    onUpdate({
      hasAddonLimits: checked,
      minAddons: checked ? minValue : undefined,
      maxAddons: checked ? maxValue : undefined
    })
  }

  const handleMinChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setMinValue(numValue)
    if (isEnabled) {
      onUpdate({
        minAddons: numValue
      })
    }
  }

  const handleMaxChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setMaxValue(numValue)
    if (isEnabled) {
      onUpdate({
        maxAddons: numValue
      })
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-start'>
        <div className='space-y-1'>
          <span className='text-sm font-medium text-gray-700'>Límites de selección</span>
          <p className='text-xs text-gray-500'>Establece cuántos adicionales puede elegir el cliente</p>
        </div>
        <Switch size='sm' isSelected={isEnabled} onValueChange={handleToggle} />
      </div>

      {isEnabled && (
        <div className='grid grid-cols-2 gap-3 mt-4'>
          <Input
            type='number'
            label='Mínimo'
            value={minValue.toString()}
            onChange={e => handleMinChange(e.target.value)}
            variant='flat'
            size='sm'
            classNames={{
              label: 'text-xs',
              input: 'text-sm'
            }}
          />
          <Input
            type='number'
            label='Máximo'
            value={maxValue.toString()}
            onChange={e => handleMaxChange(e.target.value)}
            variant='flat'
            size='sm'
            classNames={{
              label: 'text-xs',
              input: 'text-sm'
            }}
          />
          <div className='col-span-2 text-xs text-gray-500'>
            {minValue === 0 && maxValue === 0
              ? 'Sin límites establecidos'
              : `El cliente ${minValue > 0 ? `debe elegir al menos ${minValue}` : 'puede elegir'} 
                 ${maxValue > 0 ? `hasta ${maxValue}` : ''} adicionales`}
          </div>
        </div>
      )}
    </div>
  )
}
