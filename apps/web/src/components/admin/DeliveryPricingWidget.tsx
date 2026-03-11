'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Button, Image } from '@heroui/react'
import useCommerceStore from '@/store/commerceStore'

export default function DeliveryPricingWidget() {
  const commerceSlug = useCommerceStore(state => state.commerceSlug)

  const handleTestInStore = () => {
    if (commerceSlug) {
      window.open(`/${commerceSlug}`, '_blank')
    }
  }

  return (
    <CardAdminContainer
      title='Cálculo Automático de Delivery'
      description='Optimiza los costos de entrega con cálculo inteligente de distancias y tarifas.'
    >
      <div className='flex flex-col gap-2'>
        {/* Status Badge */}
        <div className='text-center'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'>
            🚚 Beta
          </span>
        </div>

        {/* Hero Image */}
        <div className='relative w-full rounded-xl overflow-hidden'>
          <Image
            src='/delivery-pricing-preview.png'
            alt='Cálculo automático de precios de delivery'
            className='w-full h-full object-contain z-0'
            radius='lg'
          />
        </div>

        {/* Context Description */}
        <div className='text-center'>
          <p className='text-gray-600 text-sm leading-relaxed'>
            Tu sistema calcula automáticamente el precio de entrega según la distancia. Ideal para flotas propias o
            tercerizadas.
          </p>
        </div>

        {/* Single CTA */}
        <div className='text-center'>
          <Button
            color='secondary'
            size='md'
            variant='solid'
            className='w-full mt-3 max-w-40'
            onPress={handleTestInStore}
          >
            Probar ahora
          </Button>
        </div>
      </div>
    </CardAdminContainer>
  )
}
