'use client'

import { Button } from '@heroui/react'

interface MobileBottomBarProps {
  onAction: () => void
  actionText: string
  isDisabled?: boolean
  showPrice?: boolean
  price?: string
  // Botón secundario opcional (para limpiar selección)
  secondaryAction?: () => void
  secondaryText?: string
  showSecondary?: boolean
}

export default function MobileBottomBar({
  onAction,
  actionText,
  isDisabled = false,
  showPrice = false,
  price,
  secondaryAction,
  secondaryText = 'Limpiar selección',
  showSecondary = false
}: MobileBottomBarProps) {
  return (
    <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg flex justify-center'>
      <div className='max-w-md w-full px-4 py-3 pb-safe'>
        <div className='space-y-3'>
          {/* Botón secundario (limpiar selección) */}
          {showSecondary && secondaryAction && (
            <Button onPress={secondaryAction} variant='bordered' className='w-full py-2 text-sm' size='lg' radius='lg'>
              {secondaryText}
            </Button>
          )}

          {/* Botón principal */}
          <Button
            onPress={onAction}
            className='w-full py-4 sm:py-6 text-base sm:text-lg font-semibold mobile-button'
            color='secondary'
            size='lg'
            isDisabled={isDisabled}
            radius='lg'
          >
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  )
}
