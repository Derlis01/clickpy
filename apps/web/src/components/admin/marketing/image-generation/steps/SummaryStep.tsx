'use client'

import { Button, Textarea, Card, Image, Chip } from '@heroui/react'
import { ChevronLeft } from 'react-feather'
import { AdminProduct } from '@/types/AdminProduct'

interface SummaryStepProps {
  selectedProducts: AdminProduct[]
  promotionType: string
  promotionOtherText: string
  extraText: string
  error: string | null
  onExtraTextChange: (text: string) => void
  onBack: () => void
  onGenerate: () => void
  onSimulateSuccess?: () => void
}

export const SummaryStep = ({
  selectedProducts,
  promotionType,
  promotionOtherText,
  extraText,
  error,
  onExtraTextChange,
  onBack,
  onGenerate,
  onSimulateSuccess
}: SummaryStepProps) => {
  const getPromotionTypeText = () => {
    switch (promotionType) {
      case 'discount':
        return 'Descuento Especial'
      case 'launch':
        return 'Lanzamiento de Nuevo Producto'
      case 'combo':
        return 'Combo Especial'
      case 'other':
        return promotionOtherText
      default:
        return ''
    }
  }

  return (
    <div className='flex flex-col gap-8 py-4 max-w-3xl mx-auto'>
      <header className='text-center space-y-2'>
        <h2 className='text-lg font-medium'>Revisa tu publicidad</h2>
        <p className='text-sm text-gray-600'>Verifica los detalles antes de generar tu imagen</p>
      </header>

      <div className='space-y-6'>
        {/* Tipo de promoción */}
        <section className='space-y-3'>
          <h3 className='text-sm font-medium text-gray-700'>Tipo de promoción</h3>
          <Chip color='primary' variant='dot' className='text-sm'>
            {getPromotionTypeText()}
          </Chip>
        </section>

        {/* Productos */}
        <section className='space-y-3'>
          <h3 className='text-sm font-medium text-gray-700'>Productos seleccionados ({selectedProducts.length})</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {selectedProducts.map(product => (
              <Card key={product.id} className='p-3 border border-default-200' radius='sm' shadow='sm'>
                <div className='flex gap-3'>
                  <div className='w-16 h-16 shrink-0'>
                    <Image
                      src={product.imageUrl || '/image-empty-state.svg'}
                      alt={product.productName}
                      className='object-cover rounded-md w-full h-full'
                    />
                  </div>
                  <div className='flex flex-col justify-center min-w-0'>
                    <p className='text-sm font-medium truncate'>{product.productName}</p>
                    <p className='text-xs text-gray-500'>Gs. {product.price.toLocaleString('es-PY')}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Detalles adicionales */}
        <section className='space-y-3'>
          <h3 className='text-sm font-medium text-gray-700'>¿Querés agregar algún detalle? (Opcional)</h3>
          <Textarea
            placeholder="Ej: '20% de descuento', 'Envío gratis', 'Válido hasta agotar stock'"
            value={extraText}
            onChange={e => onExtraTextChange(e.target.value)}
            minRows={2}
            variant='bordered'
            className='w-full'
          />
        </section>
      </div>

      <footer className='flex flex-col gap-4 mt-4 pt-4 border-t border-default-200'>
        {error && <div className='p-3 text-sm text-danger bg-danger-50 rounded-lg'>{error}</div>}
        <div className='flex justify-between'>
          <Button variant='ghost' className='gap-2' onPress={onBack} size='sm'>
            <ChevronLeft size={18} />
            Atrás
          </Button>
          <div className='flex gap-2'>
            <Button color='primary' onPress={onGenerate} size='lg'>
              Generar Publicidad
            </Button>
            {/* <Button color='secondary' onPress={onSimulateSuccess} size='lg' variant='ghost'>
              Simular Éxito
            </Button> */}
          </div>
        </div>
      </footer>
    </div>
  )
}
