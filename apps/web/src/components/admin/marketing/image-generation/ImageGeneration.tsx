'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import useProductStore from '@/store/productStore'
import useCommerceStore from '@/store/commerceStore'
import { useUserPlan } from '@/hooks/useUserPlan'
import { AdminProduct } from '@/types/AdminProduct'
import { CreateImageJobResponse } from '@/types/JobStatus'
import CardAdminContainer from '../../CardAdminContainer'
import { InitialStep } from './steps/InitialStep'
import { ProductSelection } from './steps/ProductSelection'
import { PromotionTypeStep } from './steps/PromotionTypeStep'
import { GeneralPromotionStep } from './steps/GeneralPromotionStep'
import { SummaryStep } from './steps/SummaryStep'
import { LoadingImageGeneration } from './steps/LoadingImageGeneration'
import { SuccessStep } from './steps/SuccessStep'
import { Button, Image } from '@heroui/react'
import instance from '@/utils/axios'

type Step =
  | 'start'
  | 'initial'
  | 'product-selection'
  | 'promotion-type'
  | 'summary'
  | 'general-promotion'
  | 'loading'
  | 'success'
type PromotionType = 'discount' | 'launch' | 'combo' | 'other'

export const ImageGeneration = () => {
  // Estados principales
  const [currentStep, setCurrentStep] = useState<Step>('start')
  const [selectedProducts, setSelectedProducts] = useState<AdminProduct[]>([])
  const [promotionType, setPromotionType] = useState<PromotionType | null>(null)
  const [promotionOtherText, setPromotionOtherText] = useState('')
  const [extraText, setExtraText] = useState('')
  const [generalPromotionText, setGeneralPromotionText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)

  // Estados para el flujo asíncrono
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [pollingStarted, setPollingStarted] = useState(false)
  const [isPollingActive, setIsPollingActive] = useState(false)

  // Referencias para cleanup
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollingStopTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkJobStatusRef = useRef<(() => Promise<void>) | null>(null)

  // Función para limpiar todos los timers
  const cleanupTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    if (pollingStopTimeoutRef.current) {
      clearTimeout(pollingStopTimeoutRef.current)
      pollingStopTimeoutRef.current = null
    }
    setIsPollingActive(false)
  }, [])

  // Función para simular progreso inteligente
  const startProgressSimulation = useCallback(() => {
    console.log('📈 Starting progress simulation...')
    setProgress(0)
    let currentProgress = 0

    progressIntervalRef.current = setInterval(() => {
      if (currentProgress < 90) {
        // Progreso normal hasta 90% en 40 segundos
        currentProgress += 90 / 40 // 2.25% por segundo
        console.log(`📊 Progress: ${currentProgress.toFixed(1)}% (phase 1)`)
      } else if (currentProgress < 95) {
        // Progreso más lento después de 90%
        currentProgress += 0.5 // 0.5% por segundo
        console.log(`📊 Progress: ${currentProgress.toFixed(1)}% (phase 2 - polling phase)`)
      }

      // No superar 95% hasta que el job esté completo
      const finalProgress = Math.min(currentProgress, 95)
      setProgress(finalProgress)

      // Limpiar si llegamos al máximo sin completar
      if (currentProgress >= 95 && progressIntervalRef.current) {
        console.log('📊 Progress simulation complete at 95%')
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }, 1000) // Actualizar cada segundo
  }, [])

  // Función para consultar el estado del job (temporalmente deshabilitada)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const checkJobStatus = useCallback(async () => {}, [jobId, cleanupTimers, selectedProducts.length])

  // Actualizar la referencia cuando cambie la función
  useEffect(() => {
    checkJobStatusRef.current = checkJobStatus
  }, [checkJobStatus])

  // Función para iniciar el polling después de 40 segundos
  const startPolling = useCallback(() => {
    console.log('🚀 Starting polling timer (40 seconds)...')

    // Esperar 40 segundos antes de comenzar el polling
    pollingTimeoutRef.current = setTimeout(() => {
      console.log('⏰ 40 seconds elapsed, starting polling...')
      setPollingStarted(true)
      setIsPollingActive(true)

      // Consultar inmediatamente
      if (checkJobStatusRef.current) {
        checkJobStatusRef.current()
      }

      // Continuar consultando cada 3 segundos
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Polling interval tick...')
        if (checkJobStatusRef.current) {
          checkJobStatusRef.current()
        } else {
          console.log('⚠️ checkJobStatusRef.current is null!')
        }
      }, 3000)

      // Detener el polling después de 5 minutos (máximo tiempo de espera)
      pollingStopTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Polling timeout reached (5 minutes)')
        cleanupTimers()
        setError('Tiempo de espera agotado. La imagen puede tardar más de lo esperado.')
        const previousStep = selectedProducts.length > 0 ? 'summary' : 'general-promotion'
        setCurrentStep(previousStep)
      }, 300000) // 5 minutos
    }, 40000) // 40 segundos
  }, [cleanupTimers, selectedProducts.length])

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      cleanupTimers()
    }
  }, [cleanupTimers])

  // Debug effect para monitorear el estado del polling
  useEffect(() => {
    console.log('🔔 Polling state changed:', {
      pollingStarted,
      isPollingActive,
      jobId,
      progress: Math.round(progress)
    })
  }, [pollingStarted, isPollingActive, jobId, progress])

  // Stores
  const commerceLogo = useCommerceStore(state => state.commerceLogo)
  const primaryColor = useCommerceStore(state => state.commercePrimaryColor)
  const { currentPlan } = useUserPlan()
  const isPaidPlan = currentPlan === 'entrepreneur' || currentPlan === 'enterprise'

  // Handlers
  const handleInitialChoice = (type: 'product' | 'general') => {
    setCurrentStep(type === 'product' ? 'product-selection' : 'general-promotion')
  }

  const handleGenerateImage = async () => {
    console.log('🎨 Starting image generation...')
    setCurrentStep('loading')
    setError(null)
    setGeneratedImageUrl(null)
    setJobId(null)
    setProgress(0)
    setPollingStarted(false)
    setIsPollingActive(false)
    cleanupTimers()

    const payload = {
      commerceInfo: {
        logo: commerceLogo,
        primaryColor
      },
      ...(currentStep === 'summary'
        ? {
            type: 'product',
            selectedProducts: selectedProducts.map(p => ({
              id: p.id,
              name: p.productName,
              imageUrl: p.imageUrl,
              price: p.price
            })),
            promotionType,
            ...(promotionType === 'other' && { promotionTypeText: promotionOtherText }),
            extraText: extraText || null
          }
        : {
            type: 'general',
            description: generalPromotionText
          })
    }

    console.log('📤 Sending payload to API:', payload)

    try {
      const response = await instance.post<CreateImageJobResponse>('/commerce/create-image', payload)
      console.log('📥 API Response:', response.data)

      if (response.data.success && response.data.jobId) {
        // Guardar el jobId y comenzar el flujo asíncrono
        console.log('✅ Job created successfully, jobId:', response.data.jobId)
        setJobId(response.data.jobId)
        startProgressSimulation()
        startPolling()
      } else {
        console.log('❌ Job creation failed:', response.data.message)
        setError(response.data.message || 'Error al iniciar la generación de imagen')
        setCurrentStep(currentStep === 'summary' ? 'summary' : 'general-promotion')
      }
    } catch (error: any) {
      console.error('💥 API Error:', error)
      setError(error.response?.data?.message || 'Error al iniciar la generación de imagen')
      setCurrentStep(currentStep === 'summary' ? 'summary' : 'general-promotion')
    }
  }

  const resetFlow = useCallback(() => {
    cleanupTimers()
    setCurrentStep('start')
    setSelectedProducts([])
    setPromotionType(null)
    setPromotionOtherText('')
    setExtraText('')
    setGeneralPromotionText('')
    setError(null)
    setGeneratedImageUrl(null)
    setJobId(null)
    setProgress(0)
    setPollingStarted(false)
    setIsPollingActive(false)
  }, [cleanupTimers])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'loading':
        return <LoadingImageGeneration progress={progress} isPollingActive={isPollingActive} />

      case 'success':
        if (!generatedImageUrl) return null
        return <SuccessStep imageUrl={generatedImageUrl} onBack={resetFlow} />

      case 'start':
        return (
          <div className='flex flex-col gap-6'>
            {/* Hero Banner Section */}
            <div className='flex flex-col gap-4'>
              {/* Hero Image */}
              <div className='relative w-full rounded-xl overflow-hidden'>
                <Image
                  src='/ai-marketing-preview.png'
                  alt='Genera posts profesionales con IA'
                  className='w-full h-full object-contain z-0'
                  radius='lg'
                />
              </div>

              {/* Value Proposition */}
              <div className='text-center px-4'>
                <p className='text-gray-600 text-sm leading-relaxed mb-3'>
                  Crea imágenes promocionales profesionales en segundos.
                  <br />
                  <span className='font-medium text-gray-700'>Lo que antes tomaba horas, ahora es instantáneo.</span>
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className='flex flex-col items-center gap-3'>
              <Button
                color='secondary'
                variant='solid'
                onPress={() => setCurrentStep('initial')}
                isDisabled={!isPaidPlan}
                className='px-8 py-2 font-medium'
                size='md'
              >
                {isPaidPlan ? 'Crear anuncio' : 'Crear imagen'}
              </Button>

              {!isPaidPlan && (
                <div className='text-center'>
                  <p className='text-xs text-gray-500 mb-2'>Disponible en el plan Emprendedor</p>
                  <Button
                    color='primary'
                    variant='light'
                    size='sm'
                    onPress={() => window.open('https://wa.me/595972885139', '_blank')}
                    className='text-xs'
                  >
                    Actualizar plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 'initial':
        return <InitialStep onSelectType={handleInitialChoice} />

      case 'product-selection':
        return (
          <ProductSelection
            selectedProducts={selectedProducts}
            onProductsSelect={setSelectedProducts}
            onBack={() => setCurrentStep('initial')}
            onNext={() => setCurrentStep('promotion-type')}
          />
        )

      case 'promotion-type':
        return (
          <PromotionTypeStep
            selectedProducts={selectedProducts}
            promotionType={promotionType}
            promotionOtherText={promotionOtherText}
            onPromotionTypeChange={type => setPromotionType(type as PromotionType)}
            onPromotionOtherTextChange={setPromotionOtherText}
            onBack={() => setCurrentStep('product-selection')}
            onNext={() => setCurrentStep('summary')}
          />
        )

      case 'summary':
        if (!promotionType) return null
        return (
          <SummaryStep
            selectedProducts={selectedProducts}
            promotionType={promotionType}
            promotionOtherText={promotionOtherText}
            extraText={extraText}
            onExtraTextChange={setExtraText}
            onBack={() => setCurrentStep('promotion-type')}
            onGenerate={handleGenerateImage}
            error={error}
          />
        )

      case 'general-promotion':
        return (
          <GeneralPromotionStep
            generalPromotionText={generalPromotionText}
            onPromotionTextChange={setGeneralPromotionText}
            onBack={() => setCurrentStep('initial')}
            onGenerate={handleGenerateImage}
            error={error}
          />
        )
    }
  }

  return (
    <CardAdminContainer
      title='Tu anuncio listo en segundos'
      description='Diseña imágenes de promoción para tus productos o campañas especiales.'
    >
      {renderCurrentStep()}
    </CardAdminContainer>
  )
}
