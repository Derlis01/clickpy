'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Button, Image } from '@heroui/react'
import { useRouter } from 'next/navigation'

export default function CollaborativeOrderingWidget() {
  const router = useRouter()

  const handleGoToTables = () => {
    router.push('/admin/tables')
  }

  return (
    <CardAdminContainer title='QRs Inteligentes' description='Gestiona las mesas de tu local'>
      <div className='flex flex-col gap-4'>
        {/* Status Badge */}
        <div className='text-center'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'>
            ✅ Disponible
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

        {/* Action Button */}
        <div className='flex gap-3 mt-3'>
          <Button color='secondary' variant='solid' size='md' onPress={handleGoToTables} className='flex-1'>
            Ver mesas
          </Button>
        </div>
      </div>
    </CardAdminContainer>
  )
}
