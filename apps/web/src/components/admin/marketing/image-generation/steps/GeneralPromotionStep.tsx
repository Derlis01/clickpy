'use client'

import { Button, Textarea } from '@heroui/react'
import { ChevronLeft } from 'react-feather'

interface GeneralPromotionStepProps {
  generalPromotionText: string
  onPromotionTextChange: (text: string) => void
  onBack: () => void
  onGenerate: () => void
  onSimulateSuccess?: () => void
  error: string | null
}

export const GeneralPromotionStep = ({
  generalPromotionText,
  onPromotionTextChange,
  onBack,
  onGenerate,
  onSimulateSuccess,
  error
}: GeneralPromotionStepProps) => {
  return (
    <div className='flex flex-col gap-6 py-4'>
      <div className='space-y-4'>
        <h2 className='text-lg font-medium text-center'>Contanos sobre tu publicidad</h2>
        <p className='text-sm text-gray-600 text-center max-w-lg mx-auto'>
          Describe lo que querés anunciar y generaremos una imagen perfecta para tu promoción
        </p>

        <Textarea
          value={generalPromotionText}
          variant='bordered'
          onChange={e => onPromotionTextChange(e.target.value)}
          placeholder="Ej: 'Gran descuento en toda la tienda', 'Inauguración de nueva sucursal', 'Horarios especiales por fiestas'"
          minRows={4}
          className='w-full'
        />
      </div>

      <footer className='flex flex-col gap-4 mt-4'>
        {error && <div className='p-3 text-sm text-danger bg-danger-50 rounded-lg'>{error}</div>}
        <div className='flex justify-between'>
          <Button variant='ghost' className='gap-2' onPress={onBack}>
            <ChevronLeft size={18} />
            Atrás
          </Button>
          <div className='flex gap-2'>
            <Button color='primary' isDisabled={!generalPromotionText.trim()} onPress={onGenerate}>
              Generar Publicidad
            </Button>
            {/* <Button
              color='secondary'
              isDisabled={!generalPromotionText.trim()}
              onPress={onSimulateSuccess}
              variant='ghost'
            >
              Simular Éxito
            </Button> */}
          </div>
        </div>
      </footer>
    </div>
  )
}
