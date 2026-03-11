'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Button, Image } from '@heroui/react'
import { useRouter } from 'next/navigation'

export default function IntelligentAnalysisWidget() {
  const router = useRouter()

  const handleTryAnalysis = () => {
    // TODO: Navigate to analysis page when ready
    router.push('/admin/marketing/ia')
  }

  return (
    <CardAdminContainer
      title='Análisis Inteligente'
      description='IA que encuentra patrones ocultos en tus datos para impulsar las ventas.'
    >
      <div className='flex flex-col gap-2'>
        {/* Status Badge */}
        <div className='text-center'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800'>
            🧠 Disponible
          </span>
        </div>

        {/* Hero Image */}
        <div className='relative w-full rounded-xl overflow-hidden'>
          <Image
            src='/ai-analysis-preview.png'
            alt='Análisis inteligente de datos con IA'
            className='w-full h-full object-contain z-0 '
            radius='lg'
          />
        </div>

        {/* Context Description */}
        <div className='text-center'>
          <p className='text-gray-600 text-sm leading-relaxed'>
            Descubre oportunidades que no sabías que tenías. Los datos son lo más importante de tu negocio.
          </p>
        </div>

        {/* Single CTA */}
        <div className='text-center'>
          <Button
            color='secondary'
            size='md'
            variant='solid'
            className='w-full mt-3 max-w-40'
            onPress={handleTryAnalysis}
          >
            Ver insights
          </Button>
        </div>
      </div>
    </CardAdminContainer>
  )
}
