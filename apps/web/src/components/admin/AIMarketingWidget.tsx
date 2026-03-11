'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Button, Image } from '@heroui/react'
import { useRouter } from 'next/navigation'

export default function AIMarketingWidget() {
  const router = useRouter()

  const handleTryNow = () => {
    router.push('/admin/marketing')
  }

  return (
    <CardAdminContainer
      title='Anuncios listos en segundos'
      description='Crea imágenes de promoción profesionales para tus productos.'
    >
      <div className='flex flex-col gap-4'>
        {/* Status Badge */}
        <div className='text-center'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800'>
            🎨 Disponible
          </span>
        </div>

        {/* Hero Image */}
        <div className='relative w-full rounded-xl overflow-hidden'>
          <Image
            src='/ai-marketing-preview.png'
            alt='Genera posts profesionales con IA'
            className='w-full h-full object-contain z-0 my-[15px]'
            radius='lg'
          />
        </div>

        {/* Context Description */}
        <div className='text-center'>
          <p className='text-gray-600 text-sm leading-relaxed'>
            Lo que antes tomaba días con agencias, ahora lo tienes en segundos.
          </p>
        </div>

        {/* Single CTA */}
        <div className='text-center'>
          <Button
            color='secondary'
            size='md'
            variant='solid'
            className='w-full mt-[18px] max-w-40'
            onPress={handleTryNow}
          >
            Probar ahora
          </Button>
        </div>
      </div>
    </CardAdminContainer>
  )
}
