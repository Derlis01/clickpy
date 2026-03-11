'use client'

import { Button, Card, CardBody, Input } from '@heroui/react'

interface TipData {
  percentage: number
  amount: number
}

interface TipViewProps {
  myAmount: number
  tip: TipData
  waiterName: string
  formatPrice: (price: number) => string
  onBack: () => void
  setTipPercentage: (percentage: number) => void
  setCustomTip: (amount: number) => void
}

export default function TipView({
  myAmount,
  tip,
  waiterName,
  formatPrice,
  onBack,
  setTipPercentage,
  setCustomTip
}: TipViewProps) {
  // Configuración de opciones de propina con emojis
  const tipOptions = [
    { percentage: 5, emoji: '☺️', label: 'Bien' },
    { percentage: 10, emoji: '😘', label: 'Muy bien' },
    { percentage: 15, emoji: '💖', label: 'Excelente' }
  ]

  return (
    <div className='pb-24'>
      <div className='p-4'>
        <div>
          <div className='mb-8'>
            <Button onPress={onBack} variant='light' className='mb-4' size='sm'>
              ← Volver
            </Button>
            <div className='text-center'>
              <h1 className='text-2xl sm:text-3xl font-bold mb-2'>¿Qué tal estuvo {waiterName}?</h1>
              <p className='text-gray-600 text-base sm:text-lg'>Califica el servicio con una propina (opcional)</p>
            </div>
          </div>

          {/* Opciones de propina con emojis grandes */}
          <Card className='mb-6'>
            <CardBody className='p-4 sm:p-6'>
              <div className='grid grid-cols-1 gap-4 mb-6'>
                {tipOptions.map(option => {
                  const isSelected = tip.percentage === option.percentage
                  const tipAmount = (myAmount * option.percentage) / 100

                  return (
                    <Button
                      key={option.percentage}
                      color={isSelected ? 'success' : 'default'}
                      variant={isSelected ? 'solid' : 'bordered'}
                      onPress={() => setTipPercentage(option.percentage)}
                      className='py-6 h-auto justify-start text-left'
                      size='lg'
                    >
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center gap-4'>
                          <span className='text-3xl'>{option.emoji}</span>
                          <div>
                            <div className='font-semibold text-lg'>{option.label}</div>
                            <div className='text-sm text-gray-600'>{option.percentage}%</div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='font-bold text-lg'>{formatPrice(tipAmount)}</div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>

              {/* Opción personalizada más simple */}
              <div className='border-t pt-4'>
                <div className='text-center mb-3'>
                  <span className='text-sm text-gray-600'>¿Otro monto?</span>
                </div>
                <Input
                  type='number'
                  placeholder='Ingresa un monto personalizado'
                  value={tip.percentage === 0 ? tip.amount.toString() : ''}
                  onChange={e => {
                    const customAmount = Number(e.target.value) || 0
                    setCustomTip(customAmount)
                  }}
                  startContent={<span className='text-gray-500'>₲</span>}
                  size='lg'
                  radius='lg'
                />
              </div>
            </CardBody>
          </Card>

          {/* Total simplificado */}
          {tip.amount > 0 && (
            <Card className='mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200'>
              <CardBody className='p-4'>
                <div className='text-center'>
                  <p className='text-sm text-gray-600 mb-1'>Total con propina</p>
                  <p className='text-3xl font-bold text-green-600'>{formatPrice(myAmount + tip.amount)}</p>
                  <p className='text-xs text-gray-500 mt-1'>
                    Subtotal: {formatPrice(myAmount)} + Propina: {formatPrice(tip.amount)}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
