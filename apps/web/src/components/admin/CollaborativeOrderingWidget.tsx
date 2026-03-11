'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Button, Image } from '@heroui/react'
import { useRouter } from 'next/navigation'

export default function CollaborativeOrderingWidget() {
  const router = useRouter()

  const handleGoToDemo = () => {
    router.push('/demo-table-qr')
  }

  const handleMoreInfo = () => {
    window.open('https://www.figma.com/proto/xG0sDpA7YqFTu7cMQHysVO/Clickpy-resto?node-id=1-32&t=x3tJ0T38ff4zLgZD-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1', '_blank')
  }

  return (
    <CardAdminContainer title='QRs Inteligentes' description='Una nueva forma de ordenar está llegando'>
      <div className='flex flex-col gap-4'>
        {/* Status Badge */}
        <div className='text-center'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800'>
            ⚡ Muy pronto disponible
          </span>
        </div>
        {/* Hero Image - Main Focus */}
        <div className='relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
          <Image
            src='/collaborative-ordering-preview.png'
            alt='QRs inteligentes para restaurantes'
            className='w-full h-full object-contain z-0'
            radius='lg'
          />
        </div>

        {/* Title and Simple Description */}
        <div className='text-center space-y-2'>
          <p className='text-gray-600 text-sm'>Ordena, divide y paga desde la mesa con un solo click.</p>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 mt-3'>
          <Button variant='ghost' size='md' className='flex-1 border-gray-200 text-gray-600' onPress={handleMoreInfo}>
            Más información
          </Button>
          <Button color='secondary' variant='solid' size='md' onPress={handleGoToDemo} className='flex-1'>
            Ver demo
          </Button>
        </div>
      </div>
    </CardAdminContainer>
  )
}
