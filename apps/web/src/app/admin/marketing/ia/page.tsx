'use client'

import { useEffect, useState } from 'react'
import { getCommerceInsights, generateInsights, pollJobStatus } from '@/services/commerceService'
import { InsightStatusBadge } from '@/components/InsightStatusBadge'
import { motion, AnimatePresence } from 'framer-motion'
import { CommerceInsightsResponse } from '@/types/commerceModel'
import { ChevronDown, Zap } from 'react-feather'
import { Card, CardBody, Tabs, Tab, Button, Skeleton } from '@heroui/react'
import { InsightSkeletonGrid } from '@/components/skeletons/InsightCardSkeleton'
export default function CommerceInsight() {
  const [selectedKey, setSelectedKey] = useState('all')
  const [insights, setInsights] = useState<CommerceInsightsResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState<string>('')

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getCommerceInsights()
        if (data) setInsights(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true)
      setAnalysisStatus('Iniciando análisis...')

      // 1. Iniciar la generación de insights
      const response = await generateInsights()

      if (!response.success || !response.jobId) {
        throw new Error(response.message || 'Failed to start insight generation')
      }

      setAnalysisStatus('Analizando datos del comercio...')

      // 2. Hacer polling del estado del job
      const jobResult = await pollJobStatus(response.jobId)

      if (jobResult.status === 'failed') {
        throw new Error(jobResult.error || 'Insight generation failed')
      }

      setAnalysisStatus('Actualizando insights...')

      // 3. Actualizar los insights cuando el job termine
      const newData = await getCommerceInsights()
      if (newData) setInsights(newData)

      setAnalysisStatus('¡Análisis completado!')
    } catch (error: any) {
      console.error('Error during insight generation:', error)
      setAnalysisStatus(error?.message || 'Error al generar insights')
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisStatus('')
      }, 2000)
    }
  }

  const filteredInsights = insights.filter(insight =>
    selectedKey === 'all'
      ? true
      : selectedKey === 'positive'
        ? insight.insightType === 'positivo'
        : selectedKey === 'negative'
          ? insight.insightType === 'negativo'
          : insight.insightType === 'neutral'
  )

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto pt-7 pb-12 px-4 sm:px-6 lg:px-8'>
          <header className='mb-12 max-w-3xl'>
            <div className='mb-4'>
              <Skeleton className='h-8 w-64 rounded-lg' />
            </div>
            <Skeleton className='h-5 w-full max-w-xl rounded-lg' />
          </header>
          <InsightSkeletonGrid />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto pt-7 pb-12 px-4 sm:px-6 lg:px-8'>
        <header className='mb-12 max-w-3xl flex items-start justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900 mb-4 text-pretty'>Análisis inteligente</h1>
            <p className='text-base text-gray-600 text-pretty'>
              Detectamos lo importante y te sugerimos acciones que realmente ayudan a crecer.
            </p>
          </div>
          {/* <div className='flex flex-col items-end gap-2'>
            <Button
              isIconOnly
              variant='light'
              className='w-10 h-10'
              onPress={handleAnalyze}
              isDisabled={isAnalyzing}
              startContent={
                <Zap size={20} className={`${isAnalyzing ? 'animate-spin' : 'animate-pulse'} text-primary`} />
              }
            />
            {isAnalyzing && analysisStatus && (
              <p className='text-xs text-gray-500 text-right max-w-32'>{analysisStatus}</p>
            )}
          </div> */}
        </header>

        <div className='mb-12 overflow-x-auto'>
          <Tabs
            selectedKey={selectedKey}
            onSelectionChange={setSelectedKey as (key: React.Key) => void}
            variant='light'
            color='primary'
            size='lg'
            radius='sm'
            classNames={{
              tabList: 'justify-start md:justify-center gap-2 w-full px-2',
              cursor: 'bg-primary',
              tab: 'px-3 py-2 whitespace-nowrap',
              base: 'w-full overflow-x-auto',
              panel: 'px-0'
            }}
          >
            <Tab key='all' title={<span className='text-sm'>Todos</span>} />
            <Tab key='positive' title={<span className='text-sm'>Positivos</span>} />
            <Tab key='negative' title={<span className='text-sm'>Negativos</span>} />
            <Tab key='neutral' title={<span className='text-sm'>Neutrales</span>} />
          </Tabs>
        </div>

        {isAnalyzing ? (
          <div className='mt-8'>
            <InsightSkeletonGrid />
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className='text-center py-12'>
            <svg className='mx-auto h-12 w-12 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-gray-900'>No hay insights disponibles</h3>
            <p className='mt-1 text-sm text-gray-500'>No se encontraron insights para el filtro seleccionado.</p>
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredInsights.map((insight, index) => (
              <InsightCard key={insight.insightId || index} insight={insight} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InsightCard({ insight }: { insight: CommerceInsightsResponse }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className='shadow-sm hover:shadow-md transition-shadow'>
      <CardBody className='p-6'>
        <InsightStatusBadge type={insight.insightType} />
        <h2 className='mt-4 text-xl font-semibold text-gray-900 text-pretty leading-snug'>{insight.title}</h2>
        <p className='mt-3 text-sm text-gray-600 text-pretty'>{insight.briefDescription}</p>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className='mt-6 flex items-center text-sm text-primary hover:text-primary-600 focus:outline-none group w-full justify-between'
        >
          <span>{isOpen ? 'Ocultar detalles' : 'Ver detalles'}</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='mt-6 space-y-4 pt-4 border-t'>
                <DetailSection label='Problema' text={insight.problem} />
                <DetailSection label='Acción' text={insight.recommendedAction} />
                <DetailSection label='Resultado' text={insight.expectedOutcome} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardBody>
    </Card>
  )
}

function DetailSection({ label, text }: { label: string; text: string }) {
  return (
    <div className='space-y-1.5'>
      <dt className='text-sm font-medium text-gray-700'>{label}</dt>
      <dd className='text-sm text-gray-600 text-pretty leading-relaxed'>{text}</dd>
    </div>
  )
}
