'use client'

import { Button } from '@heroui/react'
import { Download, Share2, ArrowLeft } from 'react-feather'
import { useState } from 'react'

interface SuccessStepProps {
  imageUrl: string
  onBack: () => void
}

export const SuccessStep = ({ imageUrl, onBack }: SuccessStepProps) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(imageUrl, {
        mode: 'no-cors'
      })
      if (!response.ok) {
        // Si no se puede descargar directamente, abrimos en una nueva pestaña
        window.open(imageUrl, '_blank')
        return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `promocion-${new Date().getTime()}.png`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error al descargar la imagen:', error)
      // Si hay un error, intentamos abrir en una nueva pestaña como fallback
      window.open(imageUrl, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'promocion.png', { type: 'image/png' })
        await navigator.share({
          title: 'Mi Promoción',
          files: [file]
        })
      } catch (error) {
        console.error('Error al compartir:', error)
      }
    }
  }

  return (
    <div className='flex flex-col items-center gap-6 py-6'>
      <div className='bg-success-100/40 text-success-600 px-6 py-3 rounded-xl text-base font-medium flex items-center gap-2'>
        <div className='w-2 h-2 bg-success-500 rounded-full'></div>
        ¡Tu imagen está lista!
      </div>

      <div className='w-full max-w-xl mx-auto'>
        <div className='group relative rounded-2xl overflow-hidden border-2 border-default-200 shadow-sm hover:shadow-lg transition-all duration-300'>
          {/* Overlay con efecto hover */}
          <div className='absolute inset-0 bg-gradient-to-b from-black/0 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

          <img src={imageUrl} alt='Imagen generada' className='w-full h-auto' />

          {/* Botones flotantes en hover */}
          <div className='absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <Button
              size='sm'
              variant='solid'
              color='default'
              className='bg-white/90 hover:bg-white'
              onPress={handleShare}
              isDisabled={!navigator.share}
              startContent={<Share2 size={16} />}
            >
              Compartir
            </Button>
            <Button
              size='sm'
              variant='solid'
              color='default'
              className='bg-white/90 hover:bg-white'
              onPress={handleDownload}
              startContent={<Download size={16} />}
            >
              Descargar
            </Button>
          </div>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto pt-4'>
        <Button
          className='flex-1 sm:flex-none'
          color='primary'
          variant='bordered'
          startContent={<ArrowLeft size={18} />}
          onPress={onBack}
        >
          Crear otra
        </Button>

        <Button
          className='flex-1'
          startContent={<Download size={18} />}
          color='primary'
          variant='solid'
          onPress={handleDownload}
          isLoading={isDownloading}
        >
          {isDownloading ? 'Descargando...' : 'Descargar imagen'}
        </Button>
      </div>
    </div>
  )
}
