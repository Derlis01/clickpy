import { Button } from '@heroui/react'
import { Tag, Gift } from 'react-feather'

interface InitialStepProps {
  onSelectType: (type: 'product' | 'general') => void
}

export const InitialStep = ({ onSelectType }: InitialStepProps) => {
  return (
    <div className='flex flex-col items-center py-8'>
      <h2 className='text-base font-medium mb-6'>¿Para qué sería la promoción?</h2>
      <div className='flex flex-col gap-4 w-full max-w-md'>
        <Button
          color='primary'
          variant='solid'
          className='py-6 text-base gap-3'
          onPress={() => onSelectType('product')}
        >
          <Tag size={24} />
          <span>Para productos</span>
        </Button>

        <Button
          color='secondary'
          variant='solid'
          className='py-6 text-base gap-3'
          onPress={() => onSelectType('general')}
        >
          <Gift size={24} />
          <span>Promoción general</span>
        </Button>
      </div>
    </div>
  )
}
