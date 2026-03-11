'use client'

import { Card, Progress } from '@heroui/react'
import { Image as ImageIcon } from 'react-feather'

interface LoadingImageGenerationProps {
  progress: number
  isPollingActive?: boolean
}

export const LoadingImageGeneration = ({ progress, isPollingActive = false }: LoadingImageGenerationProps) => {
  const getStatusText = () => {
    if (progress < 50) {
      return 'Iniciando el proceso de generación...'
    }
    if (progress < 90) {
      return 'Nuestro equipo de diseñadores imaginarios está en reunión urgente...'
    }
    if (isPollingActive) {
      return 'Ultimos retoques... ¡Ya casi está listo!'
    }
    return 'Afinando los últimos detalles...'
  }
  return (
    <div className='flex flex-col items-center justify-center py-12 gap-6'>
      <div className='relative w-24 h-24'>
        <div className='absolute inset-0 flex items-center justify-center'>
          <ImageIcon className='w-12 h-12 text-primary animate-pulse' />
        </div>
        <div className='absolute inset-0 border-4 border-primary/30 rounded-full border-t-primary animate-spin'></div>
      </div>

      <div className='text-center space-y-2'>
        <h3 className='text-lg font-medium'>Creando tu imagen promocional</h3>
        <p className='text-sm text-gray-600'>{getStatusText()}</p>
        <p className='text-xs text-gray-500'>No salgas de esta vista, ya volvemos con tu obra.</p>
      </div>

      <div className='w-full max-w-sm space-y-2'>
        <Progress value={progress} color='primary' className='w-full' showValueLabel={true} />
        <p className='text-xs text-gray-500 text-center'>Generando tu imagen... {Math.round(progress)}%</p>
      </div>

      <Card className='p-4 bg-default-50 border-none max-w-sm'>
        <div className='flex items-center gap-3'>
          <div className='w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]'></div>
          <div className='w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]'></div>
          <div className='w-2 h-2 bg-primary rounded-full animate-bounce'></div>
        </div>
      </Card>
    </div>
  )
}
