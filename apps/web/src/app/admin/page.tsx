'use client'

import CardAdminContainer from '@/components/admin/CardAdminContainer'
import { Progress, Skeleton } from '@heroui/react'
import CollaborativeOrderingWidget from '@/components/admin/CollaborativeOrderingWidget'
// import AIMarketingWidget from '@/components/admin/AIMarketingWidget'
// import IntelligentAnalysisWidget from '@/components/admin/IntelligentAnalysisWidget'
import DeliveryPricingWidget from '@/components/admin/DeliveryPricingWidget'
import UserTask from '@/app/admin/components/UserTask'
import useCommerceStore from '@/store/commerceStore'
import useProductStore from '@/store/productStore'
import SocialMediaLink from '@/components/admin/marketing/SocialMediaLink'

export default function Home() {
  const products = useProductStore(state => state.products)
  const commerceAddress = useCommerceStore(state => state.commerceAddress)
  const commerceSlug = useCommerceStore(state => state.commerceSlug)
  const isProductLoading = useProductStore(state => state.isLoading)
  const isCommerceLoading = useCommerceStore(state => state.isLoading)

  const isProductTaskCompleted = products.length > 0
  const iscommerceAddressTaskCompleted = commerceAddress !== ''
  const isGridoEnc = commerceSlug === 'grido-enc'

  const totalTasks = 2
  const completedTasks = [isProductTaskCompleted, iscommerceAddressTaskCompleted].filter(Boolean).length
  const progressValue = (completedTasks / totalTasks) * 100

  if (isProductLoading || isCommerceLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-8'>
            <Skeleton className='h-8 w-64 rounded-lg mb-2' />
            <Skeleton className='h-4 w-48 rounded-lg' />
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            <Skeleton className='h-64 rounded-xl' />
            <Skeleton className='h-64 rounded-xl' />
            <Skeleton className='h-64 rounded-xl' />
            <Skeleton className='h-64 rounded-xl' />
            <Skeleton className='h-64 rounded-xl' />
            <Skeleton className='h-64 rounded-xl' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header Section */}
        <div className='mb-8'>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800 mb-2'>Novedades para tu negocio</h1>
          <p className='text-gray-600'>Explora lo que ya puedes probar y lo que viene en camino.</p>
        </div>

        {/* Main Grid Layout */}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max'>
          {/* Primeros pasos - Solo mostrar si no está completo y no es grido-enc */}
          {progressValue < 100 && !isGridoEnc && (
            <div className='lg:col-span-2 xl:col-span-1'>
              <CardAdminContainer title='Primeros pasos'>
                <div className='space-y-6'>
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='text-sm font-medium text-gray-700'>Progreso de configuración</span>
                      <span className='text-sm font-semibold text-primary'>{Math.round(progressValue)}%</span>
                    </div>
                    <Progress
                      aria-label='Task progress bar'
                      size='lg'
                      value={progressValue}
                      color='primary'
                      className='w-full'
                    />
                  </div>

                  <div className='space-y-4'>
                    <UserTask
                      title='Información de tu negocio'
                      description='Aquí puedes agregar los detalles de tu negocio.'
                      isCompleted={iscommerceAddressTaskCompleted}
                      path='/admin/local'
                    />
                    <UserTask
                      title='Carga tus productos'
                      description='Este es el lugar donde puedes agregar todos los productos que ofreces.'
                      isCompleted={isProductTaskCompleted}
                      path='/admin/products'
                    />
                  </div>
                </div>
              </CardAdminContainer>
            </div>
          )}

          {/* Widgets - Solo mostrar si no es grido-enc */}
          {!isGridoEnc && (
            <>
              <div className='transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'>
                <CollaborativeOrderingWidget />
              </div>

              {/* TODO: Habilitar cuando salga de fase de testeo */}
              {/* <div className='transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'>
                <AIMarketingWidget />
              </div> */}

              {/* TODO: Habilitar cuando salga de fase de testeo */}
              {/* <div className='transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'>
                <IntelligentAnalysisWidget />
              </div> */}

              <div className='transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'>
                <DeliveryPricingWidget />
              </div>
            </>
          )}

          {/* Link para redes - Siempre visible */}
          <div className='transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg'>
            <CardAdminContainer
              title='Link para redes'
              description='Este es el link directo a tu tienda online. Tus clientes podrán hacer pedidos desde cualquier dispositivo.'
            >
              <SocialMediaLink />
            </CardAdminContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
