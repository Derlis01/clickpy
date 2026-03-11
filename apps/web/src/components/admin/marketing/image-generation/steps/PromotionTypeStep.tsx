import { RadioGroup, Radio, Button, Input } from '@heroui/react'
import { ChevronLeft } from 'react-feather'
import { AdminProduct } from '@/types/AdminProduct'

interface PromotionTypeStepProps {
  selectedProducts: AdminProduct[]
  promotionType: string | null
  promotionOtherText: string
  onPromotionTypeChange: (type: string) => void
  onPromotionOtherTextChange: (text: string) => void
  onBack: () => void
  onNext: () => void
}

export const PromotionTypeStep = ({
  promotionType,
  promotionOtherText,
  onPromotionTypeChange,
  onPromotionOtherTextChange,
  onBack,
  onNext
}: PromotionTypeStepProps) => {
  return (
    <div className='flex flex-col gap-6 py-4'>
      <div className='space-y-6'>
        <h2 className='text-lg font-medium text-center'>¿Qué tipo de promoción querés hacer?</h2>

        <RadioGroup
          value={promotionType || ''}
          onValueChange={onPromotionTypeChange}
          classNames={{
            wrapper: 'flex flex-col gap-3'
          }}
        >
          <Radio value='discount' description='Ideal para ofertas y rebajas en tus productos'>
            Descuento especial
          </Radio>
          <Radio value='launch' description='Destaca el lanzamiento de tus nuevos productos'>
            Lanzamiento de nuevo producto
          </Radio>
          <Radio value='combo' description='Promociona conjuntos de productos seleccionados'>
            Combo especial
          </Radio>
          <Radio value='other' description='Define tu propio tipo de promoción personalizada'>
            Otro
          </Radio>
        </RadioGroup>

        {promotionType === 'other' && (
          <Input
            label='Especifica el tipo de promoción'
            placeholder='Ej: Liquidación Total'
            value={promotionOtherText}
            onChange={e => onPromotionOtherTextChange(e.target.value)}
            className='max-w-lg'
          />
        )}
      </div>

      <div className='flex justify-between mt-4'>
        <Button variant='ghost' className='gap-2' onPress={onBack}>
          <ChevronLeft size={18} />
          Atrás
        </Button>
        <Button
          color='primary'
          isDisabled={!promotionType || (promotionType === 'other' && !promotionOtherText.trim())}
          onPress={onNext}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
